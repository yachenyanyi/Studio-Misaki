import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage } from '../../services/chatService';
import { User, Bot, Terminal, CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';

interface Props {
    message: ChatMessage;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = React.useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.4rem',
                padding: '0.25rem 0.5rem',
                color: 'white',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s'
            }}
        >
            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
        </button>
    );
};

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
                padding: '0 0.5rem',
                position: 'relative'
            }}>
                {!isUser && (
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                        marginRight: '0.75rem',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(79,70,229,0.2)'
                    }}>
                        <Bot size={20} />
                    </div>
                )}
                <div style={{
                    maxWidth: '85%',
                    position: 'relative'
                }}>
                    <div style={{
                        padding: message.content ? '0.85rem 1.25rem' : '0.5rem 1rem',
                        borderRadius: '1.25rem',
                        background: isUser ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' : 'white',
                        color: isUser ? 'white' : 'var(--text-primary)',
                        boxShadow: isUser ? '0 4px 15px rgba(79,70,229,0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
                        borderTopRightRadius: isUser ? '0.25rem' : '1.25rem',
                        borderTopLeftRadius: isUser ? '1.25rem' : '0.25rem',
                        border: isUser ? 'none' : '1px solid rgba(0,0,0,0.05)',
                        display: message.content ? 'block' : 'none'
                    }}>
                        <div className="markdown-body" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                            {/* @ts-ignore */}
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]} 
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    code({node, inline, className, children, ...props}: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeContent = String(children).replace(/\n$/, '');
                                        return !inline && match ? (
                                            <div style={{ position: 'relative', margin: '1rem 0' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '0.5rem',
                                                    top: '0.5rem',
                                                    zIndex: 10,
                                                    opacity: 0.8
                                                }}>
                                                    <CopyButton text={codeContent} />
                                                </div>
                                                <SyntaxHighlighter
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{
                                                        borderRadius: '0.75rem',
                                                        margin: 0,
                                                        fontSize: '0.82rem',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        padding: '1.5rem 1rem 1rem 1rem'
                                                    }}
                                                    {...props}
                                                >
                                                    {codeContent}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code className={className} style={{
                                                background: isUser ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
                                                padding: '0.2rem 0.4rem',
                                                borderRadius: '0.3rem',
                                                fontFamily: 'monospace',
                                                fontSize: '0.85em',
                                                color: isUser ? '#fff' : '#e11d48'
                                            }} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    a: ({node, ...props}) => <a style={{ color: isUser ? '#93c5fd' : '#2563eb', textDecoration: 'underline' }} {...props} />,
                                    p: ({node, ...props}) => <p style={{ margin: '0.4rem 0' }} {...props} />,
                                    ul: ({node, ...props}) => <ul style={{ paddingLeft: '1.25rem', margin: '0.4rem 0' }} {...props} />,
                                    ol: ({node, ...props}) => <ol style={{ paddingLeft: '1.25rem', margin: '0.4rem 0' }} {...props} />,
                                    blockquote: ({node, ...props}) => (
                                        <blockquote style={{ 
                                            borderLeft: `3px solid ${isUser ? 'rgba(255,255,255,0.3)' : '#e2e8f0'}`, 
                                            paddingLeft: '0.75rem', 
                                            margin: '0.75rem 0', 
                                            fontStyle: 'italic',
                                            color: isUser ? 'rgba(255,255,255,0.8)' : '#64748b'
                                        }} {...props} />
                                    )
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                    {message.timestamp && (
                        <div style={{
                            fontSize: '0.7rem',
                            color: '#94a3b8',
                            marginTop: '0.3rem',
                            textAlign: isUser ? 'right' : 'left',
                            padding: '0 0.5rem',
                            opacity: 0.8
                        }}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>
                {isUser && (
                    <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', 
                        marginLeft: '0.75rem',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(219,39,119,0.2)'
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
