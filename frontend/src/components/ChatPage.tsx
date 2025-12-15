import React from 'react';
import ChatRoom from './ChatRoom';

const ChatPage: React.FC = () => {
  return (
    <div style={{ 
        paddingTop: 'var(--header-height)', 
        height: '100vh',
        background: 'var(--bg-body)',
        display: 'flex',
        justifyContent: 'center'
    }}>
      <div style={{
          width: '100%',
          maxWidth: '1600px',
          height: '100%',
          padding: '1rem',
          boxSizing: 'border-box'
      }}>
          <ChatRoom height="100%" />
      </div>
    </div>
  );
};

export default ChatPage;
