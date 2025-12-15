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
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem' }}>
                <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: 'var(--text-secondary)',
                    marginBottom: '0.5rem',
                    padding: '0 0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Recent
                </div>
                {threads.map(t => (
                    <div 
                        key={t.thread_id}
                        onClick={() => onSelectThread(t.thread_id)}
                        className="sidebar-item"
                        style={{
                            padding: '0.75rem 0.875rem',
                            cursor: 'pointer',
                            background: currentThreadId === t.thread_id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            borderRadius: '0.625rem',
                            marginBottom: '0.25rem',
                            transition: 'background 0.2s',
                            color: currentThreadId === t.thread_id ? 'var(--primary-color)' : 'inherit',
                            fontWeight: currentThreadId === t.thread_id ? 500 : 400
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                            <MessageSquare size={18} style={{ flexShrink: 0, opacity: currentThreadId === t.thread_id ? 1 : 0.6 }} />
                            <span style={{ 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                fontSize: '0.9rem'
                            }}>
                                {t.title || 'New Chat'}
                            </span>
                        </div>
                        <Trash2 
                            size={16} 
                            style={{ opacity: 0.4, cursor: 'pointer' }}
                            onClick={(e) => handleDelete(e, t.thread_id)} 
                            className="hover-icon"
                        />
                    </div>
                ))}
            </div>

            {/* User Profile Footer */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.4)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--primary-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <User size={18} />
                    </div>
                    <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {user?.username || 'User'}
                    </span>
                </div>
                <button 
                    onClick={handleLogout}
                    title="Logout"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatSidebar;
