import React, { useEffect, useState } from 'react';
import api from '../api';

interface Props {
  height?: string | number;
}

const ChatRoom: React.FC<Props> = ({ height }) => {
  const [chatUrl, setChatUrl] = useState<string>(import.meta.env.VITE_CHAT_BASE_URL || 'http://localhost:8001');

  useEffect(() => {
    (async () => {
      try {
        const resp = await api.get('/chat/config/');
        const url = resp.data?.chainlit_base_url;
        if (url) setChatUrl(url);
      } catch (e) {
        // keep fallback
      }
    })();
  }, []);

  return (
    <div className="chat-container" style={height ? { height } : undefined}>
        <div className="chat-box" style={{ padding: 0, overflow: 'hidden', height: '100%' }}>
            <iframe 
              src={chatUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Chainlit Chat"
            />
        </div>
    </div>
  );
};

export default ChatRoom;
