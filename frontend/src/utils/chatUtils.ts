import type { ChatMessage } from '../services/chatService';

export const normalizeMessages = (
    values: any, 
    historyMessages: any[], 
    messages: any[], 
    getMessagesMetadata?: (m: any, idx: number) => any
): { msg: ChatMessage; usage?: any }[] => {
    let allMessages: any[] = [];
    const hasStream = messages && messages.length > 0;

    if (hasStream) {
        // During streaming, combine history (from DB) with new stream messages
        allMessages = [...historyMessages, ...messages];
    } else if (values && values.messages && Array.isArray(values.messages) && values.messages.length > 0) {
        // If we have values.messages (standard LangGraph state), use it as the source of truth
        allMessages = values.messages;
    } else {
        // Fallback to historyMessages
        allMessages = historyMessages;
    }

    // Aggressive deduplication by ID to prevent "double sections"
    const seenIds = new Set();
    const uniqueMessages: any[] = [];
    
    for (const m of allMessages) {
        // LangGraph messages usually have an 'id'. If not, use role + content hash as a fallback.
        const mId = m.id || `${m.role || m.type}-${typeof m.content === 'string' ? m.content.substring(0, 50) : JSON.stringify(m.content).substring(0, 50)}`;
        if (!seenIds.has(mId)) {
            uniqueMessages.push(m);
            seenIds.add(mId);
        }
    }

    const renderMessages: { msg: ChatMessage; usage?: any }[] = [];
    uniqueMessages.forEach((m: any, idx: number) => {
        let role: 'user' | 'assistant' | 'system' | 'tool' = 'user';
        if (m.type === 'ai' || m.role === 'assistant') role = 'assistant';
        else if (m.type === 'human' || m.role === 'user') role = 'user';
        else if (m.type === 'system' || m.role === 'system') role = 'system';
        else if (m.type === 'tool' || m.role === 'tool') role = 'tool';

        let content = '';
        if (typeof m.content === 'string') content = m.content;
        else if (Array.isArray(m.content)) {
            content = m.content.map((c: any) => c.text || '').join('');
        }

        const meta = getMessagesMetadata ? getMessagesMetadata(m, idx) : undefined;
        const streamMeta = meta?.streamMetadata as any;
        const usageSource = streamMeta && typeof streamMeta === 'object' ? streamMeta : undefined;
        const usage = usageSource?.usage_metadata ||
                      usageSource?.usage ||
                      usageSource?.tokenUsage ||
                      usageSource?.token_usage ||
                      m.usage_metadata || 
                      m.additional_kwargs?.usage_metadata || 
                      m.response_metadata?.usage || 
                      m.response_metadata?.tokenUsage ||
                      m.response_metadata?.token_usage;

        renderMessages.push({
            msg: { 
                role, 
                content, 
                id: m.id,
                tool_calls: m.tool_calls || m.additional_kwargs?.tool_calls
            },
            usage
        });
    });
    return renderMessages;
};
