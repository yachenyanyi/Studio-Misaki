import api from '../api';

export interface ChatThread {
    thread_id: string;
    assistant_id: string;
    title?: string;
    updated_at: string;
}

export interface ChatAssistant {
    assistant_id: string;
    name?: string;
    graph_id?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    id?: string;
    usage_metadata?: any;
    additional_kwargs?: any;
    response_metadata?: any;
}

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

    getThreadState: async (threadId: string) => {
        try {
            console.log(`[chatService] Fetching state for thread: ${threadId}`);
            const response = await api.get(`/chatproxy/threads/${threadId}/state`);
            console.log(`[chatService] Raw response for ${threadId}:`, response.data);
            
            const values = response.data.values;
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

                const mapped = values.messages.map((msg: any) => {
                    let role: 'user' | 'assistant' | 'system' = 'user';
                    if (msg.type === 'human' || msg.role === 'user') role = 'user';
                    else if (msg.type === 'ai' || msg.role === 'assistant') role = 'assistant';
                    else if (msg.type === 'system' || msg.role === 'system') role = 'system';
                    
                    return {
                        role,
                        content: normalizeContent(msg.content),
                        id: msg.id,
                        usage_metadata: msg.usage_metadata,
                        additional_kwargs: msg.additional_kwargs,
                        response_metadata: msg.response_metadata
                    };
                });
                console.log(`[chatService] Mapped messages:`, mapped);
                return mapped;
            }
            console.log(`[chatService] No messages found in values`);
            return [];
        } catch (e) {
            console.error(`[chatService] Error fetching thread state:`, e);
            throw e;
        }
    },

    getHistory: async (threadId: string): Promise<ChatMessage[]> => {
        // Use getThreadState to retrieve the current message history from the thread state
        return chatService.getThreadState(threadId);
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
            
            // Construct the client pointing to our Django proxy
            // The Django proxy exposes /chatproxy which forwards to LangGraph
            // LangGraph SDK expects base URL. It appends /threads/...
            // Our proxy is at /api/chatproxy. So full path to threads is /api/chatproxy/threads
            const client = new Client({
                apiUrl: `${window.location.origin}/api/chatproxy`,
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
