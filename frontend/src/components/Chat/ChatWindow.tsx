import React from 'react';
import { useStream } from '@langchain/langgraph-sdk/react';
import { API_BASE_URL } from '../../api';
import { normalizeMessages, exportToJSON, exportToMarkdown } from '../../utils/chatUtils';
import { AssistantSelector } from './AssistantSelector';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ErrorMessage } from '../ui/ErrorMessage';
import { API_ENDPOINTS, MESSAGES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import type { ChatAssistant } from '../../services/chatService';

interface Props {
    assistantId: string;
    threadId?: string; // Optional: if provided, resumes thread
    onThreadId?: (id: string) => void;
}

const ChatWindow: React.FC<Props> = ({ assistantId, threadId, onThreadId }) => {
    const { user } = useAuth();
    const {
        historyMessages,
        assistants,
        selectedAssistantId,
        setSelectedAssistantId,
        isRollingBack,
        rollbackKey,
        pendingInput,
        setPendingInput,
        handleRollback,
        isNew
    } = useChat({ assistantId, threadId });
    
    const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.CHAT_PROXY}`;
    const token = localStorage.getItem('auth_token');

    const effectiveAssistantId = selectedAssistantId || assistantId;

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-body)'
        }}>
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
                assistants={assistants}
                onSelectAssistant={setSelectedAssistantId}
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
    assistants: ChatAssistant[];
    onSelectAssistant: (id: string) => void;
}

const ChatStreamWrapper: React.FC<StreamWrapperProps> = ({
    apiUrl, assistantId, threadId, token, user, historyMessages, onThreadId, onRollback, isRollingBack, isNew,
    initialInput, onInputUsed, assistants, onSelectAssistant
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
                    // Use both values and messages stream modes for better compatibility
                    // streamMode: ["values", "messages"] is a safe bet for LangGraph
                    streamMode: ["values", "messages"],
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
            <AssistantSelector 
                assistants={assistants} 
                selectedId={assistantId} 
                onSelect={onSelectAssistant} 
                isNew={isNew}
                onExportJSON={() => exportToJSON(renderMessages)}
                onExportMarkdown={() => exportToMarkdown(renderMessages)}
            />

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
