import React, { useEffect, useState } from 'react';
import { chatService } from '../../services/chatService';
import type { ChatThread } from '../../services/chatService';
import { Plus, MessageSquare, Trash2, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
    onSelectThread: (threadId: string) => void;
    currentThreadId?: string;
    refreshTrigger?: number;
}

const ChatSidebar: React.FC<Props> = ({ onSelectThread, currentThreadId, refreshTrigger }) => {
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const loadThreads = async () => {
        try {
            const data = await chatService.getThreads();
            setThreads(data);
        } catch (e) {
            const err = e as any;
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                await logout();
                navigate('/login?next=/chat');
                return;
            }
            console.error(e);
        }
    };

    useEffect(() => {
        loadThreads();
    }, [refreshTrigger]);

    useEffect(() => {
        // Set up an interval or listener to refresh threads if needed
        const interval = setInterval(loadThreads, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleNewChat = () => {
        onSelectThread('new');
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Delete this chat?')) {
            await chatService.deleteThread(id);
            loadThreads();
            if (currentThreadId === id) {
                onSelectThread('new');
            }
        }
    };

    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await logout();
            navigate('/login');
        }
    };

    return (
        <div className="chat-sidebar" style={{ 
            width: '280px', 
            background: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            color: 'var(--text-primary)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ padding: '1.25rem 1rem 1rem' }}>
                <button 
                    onClick={handleNewChat}
                    style={{
                        width: '100%',
                        padding: '0.875rem',
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, #a855f7 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.25)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} /> New Chat
                </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {threads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        暂无聊天历史
                    </div>
                ) : (
                    threads.map(thread => (
                        <div 
                            key={thread.thread_id}
                            onClick={() => onSelectThread(thread.thread_id)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                background: currentThreadId === thread.thread_id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                border: currentThreadId === thread.thread_id ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                                marginBottom: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={e => {
                                if (currentThreadId !== thread.thread_id) {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (currentThreadId !== thread.thread_id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <MessageSquare size={16} color={currentThreadId === thread.thread_id ? 'var(--primary-color)' : '#64748b'} />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: currentThreadId === thread.thread_id ? 600 : 500,
                                    color: currentThreadId === thread.thread_id ? 'var(--primary-color)' : '#334155',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis'
                                }}>
                                    {thread.title || '新对话'}
                                </div>
                                {thread.updated_at && (
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                                        {new Date(thread.updated_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={(e) => handleDelete(e, thread.thread_id)}
                                style={{
                                    padding: '0.4rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '0.4rem',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    opacity: currentThreadId === thread.thread_id ? 1 : 0,
                                    transition: 'opacity 0.2s, color 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                className="delete-btn"
                            >
                                <Trash2 size={14} />
                            </button>
                            <style>{`
                                div:hover > .delete-btn { opacity: 1 !important; }
                            `}</style>
                        </div>
                    ))
                )}
            </div>

            <div style={{ 
                padding: '1rem', 
                borderTop: '1px solid rgba(0,0,0,0.05)',
                background: 'rgba(255,255,255,0.4)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '0.5rem',
                    marginBottom: '0.5rem'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b'
                    }}>
                        <User size={16} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user?.username || 'Guest'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {user?.email || '在线'}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '0.6rem',
                        background: 'transparent',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.6rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#fff1f2';
                        e.currentTarget.style.color = '#e11d48';
                        e.currentTarget.style.borderColor = '#fecdd3';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                >
                    <LogOut size={14} /> 退出登录
                </button>
            </div>
        </div>
    );
};

export default ChatSidebar;
