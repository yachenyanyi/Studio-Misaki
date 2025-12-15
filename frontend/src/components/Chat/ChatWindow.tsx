import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService';
import type { ChatMessage } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import { Send, Loader2, MessageSquare, StopCircle } from 'lucide-react';

interface Props {
    threadId: string;
    onThreadCreated?: (id: string) => void;
}

const GRAPH_MAP: Record<string, string> = {
    "role_playing_agent": "角色扮演智能体",
    "basic_filesystem_agent": "基础文件系统智能体",
    "state_only_agent": "纯状态智能体",
    "persistent_memory_agent": "持久记忆智能体",
    "hybrid_storage_agent": "混合存储智能体",
    "analytics_agent": "分析智能体",
    "enterprise_agent": "企业智能体",
    "intelligent_deep_assistant": "智能深度助手",
    "simple_graph": "简单图",
};

const ChatWindow: React.FC<Props> = ({ threadId, onThreadCreated }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedAgent, setSelectedAgent] = useState('intelligent_deep_assistant');
    const abortControllerRef = useRef<AbortController | null>(null);
    const preventAbortOnThreadChangeRef = useRef<boolean>(false);
    const preventLoadHistoryRef = useRef<boolean>(false);

    const isNew = threadId === 'new';

    useEffect(() => {
        if (!isNew && !preventLoadHistoryRef.current) {
            loadHistory();
        } else {
            if (isNew) setMessages([]);
            preventLoadHistoryRef.current = false;
        }
        return () => {
            if (abortControllerRef.current && !preventAbortOnThreadChangeRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [threadId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadHistory = async () => {
        setLoading(true);
        try {
            const history = await chatService.getHistory(threadId);
            setMessages(history);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        
        const userMsg: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        
        const msgText = input;
        setInput('');
        setLoading(true);
        
        // Cancel previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new AbortController
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        let activeThreadId = threadId;
        
        if (isNew) {
            try {
                const thread = await chatService.createThread(selectedAgent, msgText.slice(0, 30));
                activeThreadId = thread.thread_id;
                if (onThreadCreated) {
                    preventAbortOnThreadChangeRef.current = true;
                    preventLoadHistoryRef.current = true;
                    onThreadCreated(activeThreadId);
                }
            } catch (e) {
                console.error('Failed to create thread', e);
                setLoading(false);
                return;
            }
        }

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        await chatService.sendMessageStream(
            activeThreadId,
            selectedAgent,
            msgText,
            (chunk) => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastIndex = newMsgs.length - 1;
                    const last = newMsgs[lastIndex];
                    if (last && last.role === 'assistant') {
                        newMsgs[lastIndex] = {
                            ...last,
                            content: (last.content || '') + chunk
                        };
                    }
                    return newMsgs;
                });
            },
            () => {
                setLoading(false);
                abortControllerRef.current = null;
                preventAbortOnThreadChangeRef.current = false;
                preventLoadHistoryRef.current = false;
            },
            (err) => {
                if (err.name === 'AbortError') {
                    console.log('Request aborted');
                    setLoading(false);
                    return;
                }
                setLoading(false);
                console.error(err);
                setMessages(prev => [...prev, { role: 'system', content: `Error: ${err}` }]);
                abortControllerRef.current = null;
                preventAbortOnThreadChangeRef.current = false;
                preventLoadHistoryRef.current = false;
            },
            abortController.signal
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            background: 'var(--bg-body)',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{ 
                padding: '1rem 2rem', 
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {isNew ? 'Start a New Conversation' : 'Chat'}
                </div>
                {isNew && (
                    <select 
                        value={selectedAgent} 
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border-color)',
                            background: 'white',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        {Object.entries(GRAPH_MAP).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Messages */}
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: '2rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {messages.length === 0 && isNew && (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        height: '100%',
                        opacity: 0.6,
                        color: 'var(--text-secondary)'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(var(--primary-rgb), 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <MessageSquare size={40} color="var(--primary-color)" />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Welcome to Sakura AI</h3>
                        <p style={{ margin: 0 }}>Select an agent above to start chatting</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} style={{ padding: '0 2rem' }}>
                        <MessageBubble message={msg} />
                    </div>
                ))}
                {loading && messages.length > 0 && messages[messages.length-1].role !== 'assistant' && (
                    <div style={{ padding: '0 2rem' }}>
                        <div style={{ 
                            display: 'inline-flex', 
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <Loader2 className="animate-spin" size={20} color="var(--primary-color)" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ 
                padding: '2rem', 
                background: 'transparent',
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'flex-end',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'box-shadow 0.2s'
                }}
                onFocus={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(var(--primary-rgb), 0.15)'}
                onBlur={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                >
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            resize: 'none',
                            padding: '0.75rem 1rem',
                            outline: 'none',
                            minHeight: '24px',
                            maxHeight: '200px',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            lineHeight: '1.5'
                        }}
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                        }}
                    />
                    <button
                        onClick={loading ? handleStop : handleSend}
                        disabled={!loading && !input.trim()}
                        style={{
                            background: (loading || input.trim()) ? 'var(--primary-color)' : '#e5e7eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '1rem',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: (loading || input.trim()) ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            marginLeft: '0.5rem'
                        }}
                    >
                        {loading ? <StopCircle size={20} /> : <Send size={20} />}
                    </button>
                </div>
                <div style={{ 
                    textAlign: 'center', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)', 
                    marginTop: '0.75rem',
                    opacity: 0.7
                }}>
                    AI can make mistakes. Please verify important information.
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
