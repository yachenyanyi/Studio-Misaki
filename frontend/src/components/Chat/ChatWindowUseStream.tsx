import React, { useState, useEffect, useRef } from 'react';
import { useStream } from '@langchain/langgraph-sdk/react';
import { Send, Loader2, StopCircle, MessageSquare } from 'lucide-react';
import { chatService, type ChatAssistant } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import type { ChatMessage } from '../../services/chatService';

interface Props {
    assistantId: string;
    threadId?: string; // Optional: if provided, resumes thread
    onThreadId?: (id: string) => void;
}

export const ChatWindowUseStream: React.FC<Props> = ({ assistantId, threadId, onThreadId }) => {
    const [input, setInput] = useState('');
    const [historyMessages, setHistoryMessages] = useState<any[]>([]);
    const [assistants, setAssistants] = useState<ChatAssistant[]>([]);
    const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(assistantId);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const apiUrl = `${window.location.origin}/api/chatproxy`;
    const token = localStorage.getItem('auth_token');
    const isNew = !threadId || threadId === 'new';

    useEffect(() => {
        const fetchHistory = async () => {
            if (threadId && threadId !== 'new') {
                try {
                    const msgs = await chatService.getThreadState(threadId);
                    setHistoryMessages(msgs);
                } catch (e) {
                    console.error("Failed to load thread history", e);
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
                console.error('Failed to load assistants', e);
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
        onFinish: () => {
            console.log("Stream finished");
        },
        onError: (e) => {
            console.error("Stream error", e);
        }
    });

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        const msg = input;
        setInput('');
        try {
            await submit({ messages: [{ role: 'user', content: msg }] }, { streamMode: ["messages"] });
        } catch (e) {
            console.error("Submit error:", e);
        }
    };

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

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [renderMessages.length, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div
            style={{
                height: '100%',
                padding: '1.5rem 1.75rem',
                boxSizing: 'border-box',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                background: 'var(--bg-body)'
            }}
        >
            <div
                style={{
                    flex: 1,
                    maxWidth: '980px',
                    margin: '0 auto',
                    borderRadius: '1.75rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,249,252,0.96))',
                    boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
                    border: '1px solid rgba(148,163,184,0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(226,232,240,0.9)',
                        background: 'radial-gradient(circle at top left, rgba(129,140,248,0.12), transparent 55%)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 999,
                                background: 'linear-gradient(135deg,#6366f1,#ec4899)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 25px rgba(79,70,229,0.45)'
                            }}
                        >
                            <MessageSquare size={18} color="#ffffff" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280' }}>
                                Studio-Misaki
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                                {isNew ? '开始新的对话' : '正在对话'}
                            </div>
                        </div>
                    </div>
                    {assistants.length > 0 && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '999px',
                                background: 'rgba(15,23,42,0.03)',
                                border: '1px solid rgba(148,163,184,0.5)'
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '999px',
                                    background: 'rgba(129,140,248,0.09)',
                                    fontWeight: 500
                                }}
                            >
                                Assistant
                            </span>
                            <select
                                value={effectiveAssistantId}
                                onChange={(e) => setSelectedAssistantId(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    outline: 'none',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)',
                                    paddingRight: '0.25rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {assistants.map((a) => (
                                    <option key={a.assistant_id} value={a.assistant_id}>
                                        {a.name || a.assistant_id}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        flex: 1,
                        padding: '1.5rem 1.75rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        background: 'linear-gradient(to bottom, rgba(248,250,252,0.9), rgba(249,250,251,0.9))'
                    }}
                >
                    {renderMessages.length === 0 && isNew && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: 'var(--text-secondary)',
                                textAlign: 'center'
                            }}
                        >
                            <div
                                style={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 999,
                                    background: 'radial-gradient(circle at 30% 0%, rgba(244,114,182,0.2), transparent 60%), radial-gradient(circle at 70% 120%, rgba(129,140,248,0.25), transparent 55%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.25rem',
                                    boxShadow: '0 18px 40px rgba(15,23,42,0.18)'
                                }}
                            >
                                <MessageSquare size={40} color="#ffffff" />
                            </div>
                            <div
                                style={{
                                    fontSize: '1.15rem',
                                    fontWeight: 600,
                                    marginBottom: '0.4rem',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                随时随地，智能对话
                            </div>
                            <div
                                style={{
                                    fontSize: '0.9rem',
                                    maxWidth: 360,
                                    lineHeight: 1.6,
                                    opacity: 0.85
                                }}
                            >
                                选择一个助手，输入你的问题，Studio-Misaki 会以 Markdown 形式为你生成优雅的回复。
                            </div>
                        </div>
                    )}

                    {renderMessages.map((item, i) => (
                        <div key={item.msg.id || i} style={{ padding: '0 0.25rem' }}>
                            <MessageBubble message={item.msg} />
                            {item.usage && (
                                <div
                                    style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        marginTop: '0.35rem',
                                        paddingLeft: '3.5rem'
                                    }}
                                >
                                    {item.usage.total_tokens || item.usage.totalTokens} tokens (
                                    {item.usage.input_tokens || item.usage.inputTokens || 0} in /
                                    {item.usage.output_tokens || item.usage.outputTokens || 0} out)
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div style={{ padding: '0 0.25rem' }}>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.65rem 0.9rem',
                                    background: 'white',
                                    borderRadius: '999px',
                                    boxShadow: '0 8px 20px rgba(15,23,42,0.12)',
                                    border: '1px solid rgba(226,232,240,0.9)'
                                }}
                            >
                                <Loader2 className="animate-spin" size={16} color="var(--primary-color)" />
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>正在思考回复…</span>
                            </div>
                        </div>
                    )}

                    {error != null && (
                        <div style={{ padding: '0 0.25rem' }}>
                            <div
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: '#fef2f2',
                                    color: '#b91c1c',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.85rem',
                                    border: '1px solid #fecaca'
                                }}
                            >
                                Error: {String(error)}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                <div
                    style={{
                        padding: '1rem 1.5rem 1.3rem',
                        borderTop: '1px solid rgba(226,232,240,0.9)',
                        background: 'rgba(248,250,252,0.96)'
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            background: 'white',
                            borderRadius: '999px',
                            boxShadow: '0 6px 18px rgba(15,23,42,0.09)',
                            padding: '0.55rem 0.55rem 0.55rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid rgba(226,232,240,0.9)'
                        }}
                    >
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="和 Studio-Misaki 聊点什么吧…"
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                resize: 'none',
                                padding: '0.35rem 0.75rem 0.35rem 0',
                                outline: 'none',
                                minHeight: 24,
                                maxHeight: 120,
                                fontFamily: 'inherit',
                                fontSize: '0.95rem',
                                lineHeight: 1.5
                            }}
                            rows={1}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                            }}
                            disabled={isLoading}
                        />
                        <button
                            type={isLoading ? 'button' : 'submit'}
                            onClick={isLoading ? () => { stop(); } : undefined}
                            disabled={!isLoading && !input.trim()}
                            style={{
                                background: isLoading || input.trim() ? 'linear-gradient(135deg,#6366f1,#ec4899)' : '#e5e7eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '999px',
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isLoading || input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.18s ease',
                                flexShrink: 0
                            }}
                        >
                            {isLoading ? <StopCircle size={18} /> : <Send size={18} />}
                        </button>
                    </form>
                    <div
                        style={{
                            textAlign: 'right',
                            fontSize: '0.72rem',
                            color: 'var(--text-secondary)',
                            marginTop: '0.5rem',
                            opacity: 0.8
                        }}
                    >
                        Enter 发送，Shift + Enter 换行
                    </div>
                </div>
            </div>
        </div>
    );
};
