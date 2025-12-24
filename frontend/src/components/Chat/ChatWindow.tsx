import React, { useState, useEffect } from 'react';
import { useStream } from '@langchain/langgraph-sdk/react';
import { chatService, type ChatAssistant } from '../../services/chatService';
import { API_BASE_URL } from '../../api';
import { normalizeMessages } from '../../utils/chatUtils';
import { AssistantSelector } from './AssistantSelector';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ErrorMessage } from '../ui/ErrorMessage';
import { API_ENDPOINTS, MESSAGES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

interface Props {
    assistantId: string;
    threadId?: string; // Optional: if provided, resumes thread
    onThreadId?: (id: string) => void;
}

const ChatWindow: React.FC<Props> = ({ assistantId, threadId, onThreadId }) => {
    const { user } = useAuth();
    const [historyMessages, setHistoryMessages] = useState<any[]>([]);
    const [assistants, setAssistants] = useState<ChatAssistant[]>([]);
    const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(assistantId);
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [rollbackKey, setRollbackKey] = useState(0);
    const [pendingInput, setPendingInput] = useState('');
    
    // Sync selectedAssistantId with prop when prop changes
    useEffect(() => {
        if (assistantId && !selectedAssistantId) {
            setSelectedAssistantId(assistantId);
        }
    }, [assistantId]);
    
    const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.CHAT_PROXY}`;
    const token = localStorage.getItem('auth_token');
    const isNew = !threadId || threadId === 'new';

    useEffect(() => {
        const fetchHistoryAndMetadata = async () => {
            if (threadId && threadId !== 'new') {
                try {
                    // Fetch both history and thread metadata in parallel
                    const [state, threadInfo] = await Promise.all([
                        chatService.getThreadState(threadId),
                        chatService.getThread(threadId)
                    ]);
                    const msgs = chatService.getMessagesFromState(state);
                    setHistoryMessages(msgs);
                    if (threadInfo && threadInfo.assistant_id) {
                        setSelectedAssistantId(threadInfo.assistant_id);
                    }
                } catch (e) {
                    console.error(MESSAGES.ERROR_LOAD_HISTORY, e);
                    // Fallback to just history if metadata fails
                    try {
                        const state = await chatService.getThreadState(threadId);
                        const msgs = chatService.getMessagesFromState(state);
                        setHistoryMessages(msgs);
                    } catch (innerE) {
                        console.error("Critical error loading thread:", innerE);
                    }
                }
            } else {
                setHistoryMessages([]);
                // For new threads, we can either keep the current selection or reset to default
                // Let's keep the current selection as it allows the user to pick before starting
            }
        };
        fetchHistoryAndMetadata();
    }, [threadId, rollbackKey]);

    useEffect(() => {
        const loadAssistants = async () => {
            try {
                const list = await chatService.getAssistants();
                setAssistants(list);
                
                // If the current selected ID is not in the list and we have assistants,
                // and it's a new thread, we might want to default to the first one.
                if (isNew && list.length > 0) {
                    const isCurrentValid = list.some(a => a.assistant_id === selectedAssistantId);
                    if (!isCurrentValid) {
                        setSelectedAssistantId(list[0].assistant_id);
                    }
                }
            } catch (e) {
                console.error(MESSAGES.ERROR_LOAD_ASSISTANTS, e);
            }
        };
        loadAssistants();
    }, []);

    const handleRollback = async () => {
        if (!threadId || threadId === 'new' || isRollingBack) return;
        
        try {
            setIsRollingBack(true);
            // Get more history to find the turn boundary
            const history = await chatService.getThreadHistory(threadId, 20);
            
            if (history && history.length > 1) {
                const currentMessages = history[0].values?.messages || [];
                if (currentMessages.length === 0) return;

                // Find the last human message index
                let lastHumanIdx = -1;
                let lastHumanContent = '';
                for (let i = currentMessages.length - 1; i >= 0; i--) {
                    const m = currentMessages[i];
                    if (m.type === 'human' || m.role === 'user') {
                        lastHumanIdx = i;
                        lastHumanContent = typeof m.content === 'string' ? m.content : 
                                           (Array.isArray(m.content) ? m.content.map((c: any) => c.text || '').join('') : '');
                        break;
                    }
                }

                if (lastHumanIdx !== -1) {
                    // Rollback to the state BEFORE this human message
                    // This state should have exactly lastHumanIdx messages
                    const targetState = history.find((s: any) => {
                        const msgs = s.values?.messages || [];
                        return msgs.length === lastHumanIdx;
                    });

                    if (targetState && targetState.checkpoint_id) {
                        console.log("Rolling back to turn boundary:", targetState.checkpoint_id, "Msg count:", lastHumanIdx);
                        await chatService.rollbackThread(threadId, targetState.checkpoint_id);
                        
                        // Set the revoked message back to input
                        setPendingInput(lastHumanContent);
                        
                        const newState = await chatService.getThreadState(threadId);
                        const newMsgs = chatService.getMessagesFromState(newState);
                        setHistoryMessages(newMsgs);
                        setRollbackKey(prev => prev + 1);
                        return;
                    }
                }

                // Fallback: just rollback one message if turn detection fails
                const currentMsgCount = currentMessages.length;
                const fallbackState = history.find((s: any) => (s.values?.messages?.length || 0) < currentMsgCount);
                if (fallbackState) {
                    await chatService.rollbackThread(threadId, fallbackState.checkpoint_id);
                    const newState = await chatService.getThreadState(threadId);
                    setHistoryMessages(chatService.getMessagesFromState(newState));
                    setRollbackKey(prev => prev + 1);
                }
             }
        } catch (e) {
            console.error("Rollback failed:", e);
        } finally {
            setIsRollingBack(false);
        }
    };

    const effectiveAssistantId = selectedAssistantId || assistantId;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-body)'
        }}>
            <AssistantSelector 
                assistants={assistants} 
                selectedId={effectiveAssistantId} 
                onSelect={setSelectedAssistantId} 
                isNew={isNew}
            />
            
            <ChatStreamWrapper
                key={`${threadId}-${effectiveAssistantId}-${rollbackKey}`}
                apiUrl={apiUrl}
                assistantId={effectiveAssistantId}
                threadId={threadId}
                token={token}
                user={user}
                historyMessages={historyMessages}
                onThreadId={onThreadId}
                onRollback={handleRollback}
                isRollingBack={isRollingBack}
                isNew={isNew}
                initialInput={pendingInput}
                onInputUsed={() => setPendingInput('')}
            />
        </div>
    );
};

interface StreamWrapperProps {
    apiUrl: string;
    assistantId: string;
    threadId?: string;
    token: string | null;
    user: any;
    historyMessages: any[];
    onThreadId?: (id: string) => void;
    onRollback: () => void;
    isRollingBack: boolean;
    isNew: boolean;
    initialInput?: string;
    onInputUsed?: () => void;
}

const ChatStreamWrapper: React.FC<StreamWrapperProps> = ({
    apiUrl, assistantId, threadId, token, user, historyMessages, onThreadId, onRollback, isRollingBack, isNew,
    initialInput, onInputUsed
}) => {
    const { messages, values, submit, isLoading, stop, error, getMessagesMetadata } = useStream({
        apiUrl,
        assistantId,
        threadId: threadId === 'new' ? undefined : threadId,
        onThreadId,
        defaultHeaders: {
             'Authorization': token ? `Bearer ${token}` : ''
        },
        onError: (e) => {
            console.error(MESSAGES.ERROR_STREAM, e);
        }
    });

    const handleSend = async (msg: string) => {
        try {
            await submit(
                { messages: [{ role: 'user', content: msg }] }, 
                { 
                    streamMode: ["messages"],
                    config: {
                        configurable: {
                            user_id: user?.username || '',
                            thread_id: threadId === 'new' ? undefined : threadId
                        }
                    }
                }
            );
        } catch (e) {
            console.error(MESSAGES.ERROR_SUBMIT, e);
        }
    };

    const renderMessages = normalizeMessages(values, historyMessages, messages || [], getMessagesMetadata);

    return (
        <>
            <MessageList 
                messages={renderMessages} 
                isLoading={isLoading} 
                isNew={isNew}
            />

            <ErrorMessage message={error ? String(error) : ''} />

            <ChatInput 
                onSend={handleSend} 
                onStop={stop} 
                onRollback={onRollback}
                isLoading={isLoading} 
                isRollingBack={isRollingBack}
                showRollback={!!threadId && threadId !== 'new' && renderMessages.length > 0}
                initialValue={initialInput}
            />
        </>
    );
};


export default ChatWindow;
