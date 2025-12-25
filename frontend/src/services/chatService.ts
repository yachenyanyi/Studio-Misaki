import api, { API_BASE_URL } from '../api';
import type { ChatThread, ChatAssistant, ChatMessage } from '../types/chat';

export type { ChatThread, ChatAssistant, ChatMessage }; // Re-export for backward compatibility if needed, or better to remove later.

export const chatService = {
    getThreads: async (): Promise<ChatThread[]> => {
        const response = await api.get('/chat/threads/');
        return response.data;
    },

    getAssistants: async (): Promise<ChatAssistant[]> => {
        const response = await api.get('/chat/assistants/');
        const data = response.data;
        let items: any[] = [];
        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(data.assistants)) {
            items = data.assistants;
        } else if (Array.isArray(data.data)) {
            items = data.data;
        }
        return items.map((a: any) => ({
            assistant_id: a.assistant_id || a.id || a.assistantId,
            name: a.name || a.metadata?.name || a.graph_id || a.graphId,
            graph_id: a.graph_id || a.graphId
        })).filter((a: ChatAssistant) => !!a.assistant_id);
    },

    createThread: async (assistantId: string, title?: string): Promise<ChatThread> => {
        const response = await api.post('/chatproxy/threads', { assistant_id: assistantId, title });
        return response.data;
    },
    
    deleteThread: async (threadId: string) => {
        await api.delete(`/chat/threads/${threadId}/`);
    },

    getThread: async (threadId: string): Promise<ChatThread> => {
        const response = await api.get(`/chat/threads/${threadId}/`);
        return response.data;
    },
    
    getThreadState: async (thread_id: string) => {
        try {
            console.log(`[chatService] Fetching state for thread: ${thread_id}`);
            const response = await api.get(`/chatproxy/threads/${thread_id}/state`);
            return response.data;
        } catch (e) {
            console.error(`[chatService] Error fetching thread state:`, e);
            throw e;
        }
    },

    getThreadHistory: async (thread_id: string, limit: number = 20) => {
        try {
            const response = await api.get(`/chatproxy/threads/${thread_id}/history`, {
                params: { limit }
            });
            return response.data; // Array of states, each with checkpoint_id and values
        } catch (e) {
            console.error(`[chatService] Error fetching thread history:`, e);
            throw e;
        }
    },

    rollbackThread: async (thread_id: string, checkpoint_id: string) => {
        try {
            // Revert thread state to a specific checkpoint
            // The LangGraph API expects a ThreadStateUpdate object which includes a checkpoint config
            const response = await api.post(`/chatproxy/threads/${thread_id}/state`, {
                checkpoint: {
                    checkpoint_id: checkpoint_id
                }
            });
            return response.data;
        } catch (e) {
            console.error(`[chatService] Error rolling back thread:`, e);
            throw e;
        }
    },
    
    getMessagesFromState: (state: any) => {
        const values = state.values;
        if (values && values.messages) {
            const normalizeContent = (c: any): string => {
                if (typeof c === 'string') return c;
                if (Array.isArray(c)) {
                    return c.map((item: any) => {
                        if (typeof item === 'string') return item;
                        if (item?.text) return item.text;
                        return '';
                    }).join('');
                }
                return '';
            };

            return values.messages.map((msg: any) => {
                let role: 'user' | 'assistant' | 'system' | 'tool' = 'user';
                if (msg.type === 'human' || msg.role === 'user') role = 'user';
                else if (msg.type === 'ai' || msg.role === 'assistant') role = 'assistant';
                else if (msg.type === 'system' || msg.role === 'system') role = 'system';
                else if (msg.type === 'tool' || msg.role === 'tool') role = 'tool';
                
                return {
                    role,
                    content: normalizeContent(msg.content),
                    id: msg.id,
                    usage_metadata: msg.usage_metadata,
                    additional_kwargs: msg.additional_kwargs,
                    response_metadata: msg.response_metadata,
                    tool_calls: msg.tool_calls || msg.additional_kwargs?.tool_calls
                };
            });
        }
        return [];
    },

    getHistory: async (threadId: string): Promise<ChatMessage[]> => {
        // Use getThreadState and getMessagesFromState to retrieve messages
        const state = await chatService.getThreadState(threadId);
        return chatService.getMessagesFromState(state);
    },

    sendMessageStream: async (
        threadId: string, 
        assistantId: string,
        message: string,
        onChunk: (content: string) => void,
        onComplete: () => void,
        onError: (err: any) => void,
        signal?: AbortSignal
    ) => {
        const token = localStorage.getItem('auth_token');

        
        try {
            // Use Client from @langchain/langgraph-sdk
            // Dynamic import to avoid SSR issues if any, though Client is isomorphic
            const { Client } = await import("@langchain/langgraph-sdk");

            const chatProxyBase = `${API_BASE_URL.replace(/\/+$/, '')}/chatproxy`;

            const client = new Client({
                apiUrl: chatProxyBase,
                // We need to pass the token. The SDK might not support Authorization header directly in constructor easily
                // for all transports without a custom fetch.
                // However, Client uses fetch. We can try to override fetch or headers.
                // The SDK Client accepts `headers` in constructor options in recent versions.
                defaultHeaders: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });

            // The SDK stream method returns an async iterable
            const streamResponse = client.runs.stream(
                threadId,
                assistantId,
                {
                    input: { messages: [{ role: 'human', content: message }] },
                    streamMode: "messages-tuple",
                    // Pass signal to underlying fetch if SDK supports it (might need custom fetch)
                    // For now, we rely on the SDK's internal handling.
                    // If we need cancellation, we might need to handle it via the generator loop break.
                }
            );

            for await (const chunk of streamResponse) {
                if (signal?.aborted) {
                    break;
                }
                
                if (!chunk) continue;

                // Log chunk for debugging
                console.log('Stream chunk:', chunk);
                
                const eventChunk = chunk as any;

                if (typeof eventChunk !== 'object') continue;

                // Handle various event types
                // messages-tuple mode usually emits: messages/partial, messages/complete
                // updates mode emits: updates
                // values mode emits: values
                
                if (eventChunk.event === 'messages/partial' || 
                    eventChunk.event === 'messages') {
                    
                    const data = eventChunk.data;
                    let content = '';
                    
                    const extract = (d: any): string => {
                        if (!d) return '';
                        if (typeof d === 'string') return d;
                        // Handle array (tuple) - [message, metadata]
                        if (Array.isArray(d)) {
                            // usually first element is message or content
                            // recursive check
                             return d.map(extract).join('');
                        }
                        if (d.content) {
                            if (typeof d.content === 'string') return d.content;
                            if (Array.isArray(d.content)) {
                                return d.content.map((c: any) => c.text || c).join('');
                            }
                        }
                        // Fallback for simple object with text
                        if (d.text) return d.text;
                        
                        return '';
                    };

                    content = extract(data);
                    
                    if (content) {
                        onChunk(content);
                    }
                } 
            }
            
            onComplete();
        } catch (e) {
            // Check if it's an abort error
            if (signal?.aborted) {
                // Ignore abort errors
                return;
            }
            onError(e);
        }
    }
};
