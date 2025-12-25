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
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    id?: string;
    timestamp?: string; // Add timestamp
    usage_metadata?: any;
    additional_kwargs?: any;
    response_metadata?: any;
    tool_calls?: any[];
}
