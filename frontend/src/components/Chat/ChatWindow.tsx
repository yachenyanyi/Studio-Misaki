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

interface Props {
    assistantId: string;
    threadId?: string; // Optional: if provided, resumes thread
    onThreadId?: (id: string) => void;
}

const ChatWindow: React.FC<Props> = ({ assistantId, threadId, onThreadId }) => {
    const [historyMessages, setHistoryMessages] = useState<any[]>([]);
    const [assistants, setAssistants] = useState<ChatAssistant[]>([]);
    const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(assistantId);
    
    const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.CHAT_PROXY}`;
    const token = localStorage.getItem('auth_token');
    const isNew = !threadId || threadId === 'new';

    useEffect(() => {
        const fetchHistory = async () => {
            if (threadId && threadId !== 'new') {
                try {
                    const msgs = await chatService.getThreadState(threadId);
                    setHistoryMessages(msgs);
                } catch (e) {
                    console.error(MESSAGES.ERROR_LOAD_HISTORY, e);
                }
            } else {
                setHistoryMessages([]);
            }
        };
        fetchHistory();
    }, [threadId]);

    useEffect(() => {
        const loadAssistants = async () => {
            try {
                const list = await chatService.getAssistants();
                setAssistants(list);
                if (!selectedAssistantId && list.length > 0) {
                    setSelectedAssistantId(list[0].assistant_id);
                }
            } catch (e) {
                console.error(MESSAGES.ERROR_LOAD_ASSISTANTS, e);
            }
        };
        loadAssistants();
    }, []);

    const effectiveAssistantId = selectedAssistantId || assistantId;

    const { messages, values, submit, isLoading, stop, error, getMessagesMetadata } = useStream({
        apiUrl,
        assistantId: effectiveAssistantId,
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
            await submit({ messages: [{ role: 'user', content: msg }] }, { streamMode: ["messages"] });
        } catch (e) {
            console.error(MESSAGES.ERROR_SUBMIT, e);
        }
    };

    const renderMessages = normalizeMessages(values, historyMessages, messages || [], getMessagesMetadata);

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
            
            <MessageList 
                messages={renderMessages} 
                isLoading={isLoading} 
                isNew={isNew}
            />

            <ErrorMessage message={error ? String(error) : ''} />

            <ChatInput 
                onSend={handleSend} 
                onStop={stop} 
                isLoading={isLoading} 
            />
        </div>
    );
};

export default ChatWindow;
