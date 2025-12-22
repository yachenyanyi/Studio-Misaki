import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../../services/chatService';
import { User, Bot, Terminal, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    message: ChatMessage;
}

const ToolOutput: React.FC<{ content: string }> = ({ content }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    // Try to parse content if it's JSON
    let displayContent = content;
    try {
        const parsed = JSON.parse(content);
        displayContent = JSON.stringify(parsed, null, 2);
    } catch (e) {
        // Not JSON, keep as is
    }

    const shouldTruncate = displayContent.length > 300;
    const truncatedContent = shouldTruncate && !isExpanded 
        ? displayContent.slice(0, 300) + '...' 
        : displayContent;

    return (
        <div style={{
            margin: '0.5rem 0 1rem 3rem',
            maxWidth: '85%',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.4rem 0.75rem',
                background: '#f1f5f9',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#64748b'
            }}>
                <CheckCircle size={14} style={{ marginRight: '0.5rem', color: '#10b981' }} />
                工具输出
                <div style={{ flex: 1 }} />
                {shouldTruncate && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--primary-color)',
                            fontSize: '0.7rem'
                        }}
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? '收起' : '展开'}
                    </button>
                )}
            </div>
            <pre style={{
                margin: 0,
                padding: '0.75rem',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: '#334155',
                maxHeight: isExpanded ? 'none' : '200px',
                overflowY: 'auto'
            }}>
                {truncatedContent}
            </pre>
        </div>
    );
};

const ToolCall: React.FC<{ tool: any }> = ({ tool }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0.5rem 0 0.5rem 3rem',
            padding: '0.4rem 0.75rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            color: '#475569',
            maxWidth: 'fit-content'
        }}>
            <Terminal size={14} style={{ marginRight: '0.5rem' }} />
            <span style={{ fontWeight: 600, marginRight: '0.4rem' }}>调用工具:</span>
            <code style={{ 
                background: '#e2e8f0', 
                padding: '0.1rem 0.3rem', 
                borderRadius: '0.25rem',
                fontSize: '0.75rem'
            }}>{tool.name || tool.function?.name}</code>
        </div>
    );
};

const MessageBubble: React.FC<Props> = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isTool = message.role === 'tool';
    
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

    if (isTool) {
        return <ToolOutput content={message.content} />;
    }

    return (
        <>
            <div style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginBottom: message.tool_calls && message.tool_calls.length > 0 ? '0.5rem' : '1.5rem',
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
                    padding: message.content ? '1rem 1.5rem' : '0.5rem 1rem',
                    borderRadius: '1.25rem',
                    background: isUser ? 'linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%)' : 'white',
                    color: isUser ? 'white' : 'var(--text-primary)',
                    boxShadow: isUser ? '0 4px 12px rgba(var(--primary-rgb), 0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                    borderTopRightRadius: isUser ? '0.25rem' : '1.25rem',
                    borderTopLeftRadius: isUser ? '1.25rem' : '0.25rem',
                    border: isUser ? 'none' : '1px solid rgba(0,0,0,0.03)',
                    display: message.content ? 'block' : 'none'
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
            
            {/* Render tool calls if any */}
            {!isUser && message.tool_calls && message.tool_calls.map((tool, idx) => (
                <ToolCall key={idx} tool={tool} />
            ))}
        </>
    );
};

export default MessageBubble;
