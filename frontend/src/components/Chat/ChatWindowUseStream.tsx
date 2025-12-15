import React, { useState, useEffect } from 'react';
import { useStream } from '@langchain/langgraph-sdk/react';
import { Send, Loader2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chatService } from '../../services/chatService';

interface Props {
    assistantId: string;
    threadId?: string; // Optional: if provided, resumes thread
    onThreadId?: (id: string) => void;
}

export const ChatWindowUseStream: React.FC<Props> = ({ assistantId, threadId, onThreadId }) => {
    const [input, setInput] = useState('');
    const [historyMessages, setHistoryMessages] = useState<any[]>([]);
    const apiUrl = `${window.location.origin}/api/chatproxy`;
    const token = localStorage.getItem('auth_token');

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

    const { messages, submit, isLoading, stop, error } = useStream({
        apiUrl,
        assistantId,
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        const msg = input;
        setInput('');
        
        // submit expects the input to the graph. 
        // Assuming the graph expects { messages: [...] }
        try {
            await submit({ messages: [{ role: 'user', content: msg }] });
        } catch (e) {
            console.error("Submit error:", e);
        }
    };

    // Combine history and new stream messages
    // Note: This is a simple concatenation. If useStream backfills, we might duplicate.
    // However, in "messages" mode, useStream typically starts fresh for the run.
    const allMessages = [...historyMessages, ...messages];

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {allMessages.map((m: any, idx: number) => {
                    // Map LangChain message types to roles
                    let role = 'user';
                    if (m.type === 'ai' || m.role === 'assistant') role = 'assistant';
                    else if (m.type === 'human' || m.role === 'user') role = 'user';
                    else if (m.type === 'system' || m.role === 'system') role = 'system';
                    
                    // Extract content
                    let content = '';
                    if (typeof m.content === 'string') content = m.content;
                    else if (Array.isArray(m.content)) {
                         content = m.content.map((c: any) => c.text || '').join('');
                    }

                    return (
                        <div key={m.id || idx} className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${role === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow-sm border'}`}>
                                {role === 'user' ? (
                                    <div className="whitespace-pre-wrap">{content}</div>
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            code({node, inline, className, children, ...props}: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={vscDarkPlus}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-lg shadow-sm border flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Thinking...
                        </div>
                    </div>
                )}
                
                {error != null && (
                    <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">
                        Error: {String(error)}
                    </div>
                )}
            </div>

            <div className="p-4 border-t bg-white">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    {isLoading ? (
                        <button 
                            type="button"
                            onClick={() => stop()}
                            className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                            <StopCircle className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                            type="submit" 
                            disabled={!input.trim()}
                            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};
