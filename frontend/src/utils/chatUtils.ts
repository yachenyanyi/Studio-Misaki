import type { ChatMessage } from '../services/chatService';

export const normalizeMessages = (
    values: any, 
    historyMessages: any[], 
    messages: any[], 
    getMessagesMetadata?: (m: any, idx: number) => any
): { msg: ChatMessage; usage?: any }[] => {
    let allMessages: any[] = [];
    if (values && values.messages && Array.isArray(values.messages) && values.messages.length > 0) {
        allMessages = values.messages;
    } else {
        allMessages = [...historyMessages, ...(messages || [])];
    }

    const renderMessages: { msg: ChatMessage; usage?: any }[] = [];
    allMessages.forEach((m: any, idx: number) => {
        let role: 'user' | 'assistant' | 'system' = 'user';
        if (m.type === 'ai' || m.role === 'assistant') role = 'assistant';
        else if (m.type === 'human' || m.role === 'user') role = 'user';
        else if (m.type === 'system' || m.role === 'system') role = 'system';

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
            msg: { role, content, id: m.id },
            usage
        });
    });
    return renderMessages;
};
