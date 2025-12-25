import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../services/chatService';
import MessageBubble from './MessageBubble';
import { MessageSquare, Loader2 } from 'lucide-react';
import { UI_COLORS } from '../../constants';

interface Props {
    messages: { msg: ChatMessage; usage?: any }[];
    isLoading: boolean;
    isNew: boolean;
}

const TypingIndicator = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        background: 'white',
        borderRadius: '1rem',
        width: 'fit-content',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.05)',
        margin: '0 0.5rem 1rem 0.5rem'
    }}>
        <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '6px', 
            background: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <Loader2 size={14} className="animate-spin" />
        </div>
        <div style={{ display: 'flex', gap: '3px' }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--primary-color)',
                    animation: `bounce 1.4s infinite ease-in-out both`,
                    animationDelay: `${i * 0.16}s`,
                    opacity: 0.6
                }} />
            ))}
        </div>
        <style>{`
            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1.0); }
            }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `}</style>
    </div>
);

export const MessageList: React.FC<Props> = ({ messages, isLoading, isNew }) => {
    const endRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change or loading state changes
    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    return (
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
            {messages.length === 0 && isNew && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: UI_COLORS.TEXT_SECONDARY,
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
                            color: UI_COLORS.TEXT_PRIMARY
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

            {messages.map((item, i) => (
                <div key={item.msg.id || i} style={{ padding: '0 0.5rem' }}>
                    <MessageBubble message={item.msg} />
                    {item.usage && (
                        <div style={{ 
                            fontSize: '0.65rem', 
                            color: '#94a3b8', 
                            marginTop: '0.25rem', 
                            textAlign: item.msg.role === 'user' ? 'right' : 'left',
                            padding: '0 0.5rem',
                            fontFamily: 'monospace'
                        }}>
                            Tokens: {item.usage.total_tokens} (↑{item.usage.input_tokens} ↓{item.usage.output_tokens})
                        </div>
                    )}
                </div>
            ))}
            
            {isLoading && (!messages.length || messages[messages.length - 1].msg.role === 'user') && (
                <TypingIndicator />
            )}
            
            <div ref={endRef} />
        </div>
    );
};
