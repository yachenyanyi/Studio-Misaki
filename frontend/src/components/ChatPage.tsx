import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatSidebar from './Chat/ChatSidebar';
import ChatWindow from './Chat/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_ASSISTANT_ID } from '../constants';

const ChatPage: React.FC = () => {
    const [selectedThreadId, setSelectedThreadId] = useState<string>('new');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login?next=/chat');
        }
    }, [navigate, isAuthenticated, loading]);

    if (loading) {
        return (
            <div style={{ 
                paddingTop: 'var(--header-height)', 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}>
                Loading...
            </div>
        );
    }

    const handleSelectThread = (threadId: string) => {
        setSelectedThreadId(threadId);
    };

    const handleThreadCreated = (newId: string) => {
        setSelectedThreadId(newId);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{ 
            paddingTop: 'var(--header-height)', 
            height: '100vh',
            background: 'var(--bg-body)',
            display: 'flex',
            overflow: 'hidden'
        }}>
            <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex',
                background: 'var(--bg-card)'
            }}>
                <ChatSidebar 
                    onSelectThread={handleSelectThread} 
                    currentThreadId={selectedThreadId} 
                    refreshTrigger={refreshTrigger}
                />
                <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                    <ChatWindow 
                        assistantId={DEFAULT_ASSISTANT_ID}
                        threadId={selectedThreadId} 
                        onThreadId={handleThreadCreated}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
