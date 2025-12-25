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
        // Important: stream messages should come after history
        allMessages = [...historyMessages, ...messages];
    } else if (values && values.messages && Array.isArray(values.messages) && values.messages.length > 0) {
        // If we have values.messages (standard LangGraph state), use it as the source of truth
        allMessages = values.messages;
    } else {
        // Fallback to historyMessages
        allMessages = historyMessages;
    }

    // Use a Map for stable deduplication
    const messageMap = new Map<string, any>();
    
    // Process messages in order: history first, then values, then stream
    // This ensures that newer/more specific versions of a message (like those in a stream)
    // overwrite older versions (like those in history)
    
    const processMessage = (m: any) => {
        if (!m) return;
        
        // Use m.id if available, it's the most reliable way to deduplicate
        let id = m.id;
        
        if (!id) {
            // Fallback for messages without ID:
            // Use role and a hash of the content (if long enough) or just role.
            // During streaming, we want the AI message to have a stable temporary ID.
            const content = typeof m.content === 'string' ? m.content : '';
            if (m.role === 'assistant' || m.type === 'ai') {
                // For assistant messages without ID, assume there's only one "current" one being streamed
                id = 'current-assistant';
            } else {
                // For other messages (like user input before it gets an ID), use a hash of the content
                id = `temp-${m.role || m.type}-${content.substring(0, 20)}`;
            }
        }
        
        messageMap.set(id, m);
    };

    if (hasStream) {
        // History first, then stream overwrites history if IDs match
        historyMessages.forEach(processMessage);
        messages.forEach(processMessage);
    } else if (values && values.messages && Array.isArray(values.messages)) {
        values.messages.forEach(processMessage);
    } else {
        historyMessages.forEach(processMessage);
    }

    const uniqueMessages = Array.from(messageMap.values());

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

export const exportToJSON = (messages: { msg: ChatMessage; usage?: any }[]) => {
    const data = JSON.stringify(messages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportToMarkdown = (messages: { msg: ChatMessage; usage?: any }[]) => {
    let markdown = `# Chat History\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    messages.forEach(({ msg }) => {
        const roleName = msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : msg.role === 'system' ? 'System' : 'Tool';
        if (msg.role === 'tool') {
            markdown += `#### 🛠 Tool Output\n\`\`\`json\n${msg.content}\n\`\`\`\n\n`;
        } else {
            markdown += `### ${roleName}\n${msg.content}\n\n`;
        }
        markdown += `---\n\n`;
    });
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${new Date().toISOString()}.md`;
    a.click();
    URL.revokeObjectURL(url);
};
