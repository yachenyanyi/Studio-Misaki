import { useState, useEffect, useCallback } from 'react';
import { chatService, type ChatAssistant } from '../services/chatService';
import { MESSAGES } from '../constants';

interface UseChatProps {
    assistantId: string;
    threadId?: string;
}

export const useChat = ({ assistantId, threadId }: UseChatProps) => {
    const [historyMessages, setHistoryMessages] = useState<any[]>([]);
    const [assistants, setAssistants] = useState<ChatAssistant[]>([]);
    const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(assistantId);
    const [isRollingBack, setIsRollingBack] = useState(false);
    const [rollbackKey, setRollbackKey] = useState(0);
    const [pendingInput, setPendingInput] = useState('');

    const isNew = !threadId || threadId === 'new';

    // Sync selectedAssistantId when assistantId prop changes
    useEffect(() => {
        if (assistantId && !selectedAssistantId) {
            setSelectedAssistantId(assistantId);
        }
    }, [assistantId]);

    // Load History & Metadata
    useEffect(() => {
        const fetchHistoryAndMetadata = async () => {
            if (threadId && threadId !== 'new') {
                try {
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
            }
        };
        fetchHistoryAndMetadata();
    }, [threadId, rollbackKey]);

    // Load Assistants
    useEffect(() => {
        const loadAssistants = async () => {
            try {
                const list = await chatService.getAssistants();
                setAssistants(list);
                
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
    }, [isNew]);

    const handleRollback = useCallback(async () => {
        if (!threadId || threadId === 'new' || isRollingBack) return;
        
        try {
            setIsRollingBack(true);
            const history = await chatService.getThreadHistory(threadId, 20);
            
            if (history && history.length > 1) {
                const currentMessages = history[0].values?.messages || [];
                if (currentMessages.length === 0) return;

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
                    const targetState = history.find((s: any) => {
                        const msgs = s.values?.messages || [];
                        return msgs.length === lastHumanIdx;
                    });

                    if (targetState && targetState.checkpoint_id) {
                        await chatService.rollbackThread(threadId, targetState.checkpoint_id);
                        setPendingInput(lastHumanContent);
                        const newState = await chatService.getThreadState(threadId);
                        setHistoryMessages(chatService.getMessagesFromState(newState));
                        setRollbackKey(prev => prev + 1);
                        return;
                    }
                }

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
    }, [threadId, isRollingBack]);

    return {
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
    };
};
