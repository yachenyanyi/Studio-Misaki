import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../../services/chatService';
import { User, Bot } from 'lucide-react';

interface Props {
    message: ChatMessage;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    if (isSystem) {
        return (
            <div style={{ 
                textAlign: 'center', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)', 
                margin: '1rem 0',
                fontStyle: 'italic'
            }}>
                {message.content}
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
            marginBottom: '1.5rem',
            padding: '0 0.5rem'
        }}>
            {!isUser && (
                <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 
                    marginRight: '1rem',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    <Bot size={20} />
                </div>
            )}
            <div style={{
                maxWidth: '85%',
                padding: '1rem 1.5rem',
                borderRadius: '1.25rem',
                background: isUser ? 'linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%)' : 'white',
                color: isUser ? 'white' : 'var(--text-primary)',
                boxShadow: isUser ? '0 4px 12px rgba(var(--primary-rgb), 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                borderTopRightRadius: isUser ? '0.25rem' : '1.25rem',
                borderTopLeftRadius: isUser ? '1.25rem' : '0.25rem',
                border: isUser ? 'none' : '1px solid rgba(0,0,0,0.03)'
            }}>
                <div className="markdown-body" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {/* @ts-ignore */}
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        customStyle={{
                                            borderRadius: '0.75rem',
                                            margin: '1rem 0',
                                            fontSize: '0.85rem',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} style={{
                                        background: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                                        padding: '0.1rem 0.3rem',
                                        borderRadius: '0.25rem',
                                        fontFamily: 'monospace',
                                        fontSize: '0.9em'
                                    }} {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            a: ({node, ...props}) => <a style={{ color: isUser ? '#fff' : 'var(--primary-color)', textDecoration: 'underline' }} {...props} />,
                            p: ({node, ...props}) => <p style={{ margin: '0.5rem 0' }} {...props} />,
                            ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }} {...props} />,
                            ol: ({node, ...props}) => <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }} {...props} />,
                            blockquote: ({node, ...props}) => (
                                <blockquote style={{ 
                                    borderLeft: `4px solid ${isUser ? 'rgba(255,255,255,0.4)' : 'var(--border-color)'}`, 
                                    paddingLeft: '1rem', 
                                    margin: '1rem 0', 
                                    fontStyle: 'italic',
                                    opacity: 0.9
                                }} {...props} />
                            )
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
            </div>
            {isUser && (
                <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', 
                    marginLeft: '1rem',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ec4899',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}>
                    <User size={20} />
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
