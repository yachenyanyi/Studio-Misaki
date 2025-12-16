import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';

interface Props {
  height?: string | number;
}

const ChatRoom: React.FC<Props> = ({ height }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-container" style={{ 
        height: height || 'auto',
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        background: 'transparent',
        boxShadow: 'none'
    }}>
        <div 
            className="chat-card"
            style={{ 
                position: 'relative',
                width: '100%',
                maxWidth: '1000px',
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '3rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '3rem',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                backgroundImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.04), rgba(236, 72, 153, 0.04))'
            }}
            onClick={() => navigate('/chat')}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
        >
            <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '1.5rem',
                    background: 'rgba(99, 102, 241, 0.06)',
                    color: 'var(--primary-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600
                }}>
                    <Sparkles size={16} />
                    <span>AI Chat</span>
                </div>
                <h2 style={{ 
                    fontSize: '2.4rem', 
                    fontWeight: 800, 
                    color: 'var(--text-main)', 
                    marginBottom: '1.5rem',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
                }}>
                    随时随地<br/>
                    <span style={{ 
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-block'
                    }}>智能对话</span>
                </h2>
                <p style={{ 
                    color: 'var(--text-sub)', 
                    fontSize: '1.125rem', 
                    lineHeight: 1.6, 
                    marginBottom: '2.5rem',
                    maxWidth: '480px'
                }}>
                    体验全新的流式对话引擎，支持多种角色扮演与 Markdown 实时渲染。让 AI 成为你的得力助手。
                </p>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '2rem',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                }}>
                    立即体验 <ArrowRight className="arrow-icon" size={20} />
                </div>
            </div>

            <div className="chat-visual" style={{ 
                position: 'relative', 
                width: '260px', 
                height: '260px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
            }}>
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255,255,255,0) 70%)'
                }} />
                <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 18px 30px rgba(99, 102, 241, 0.35)',
                    zIndex: 2,
                    position: 'relative'
                }}>
                    <MessageCircle size={64} color="white" strokeWidth={1.5} />
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        animation: 'pulse-soft 2s infinite'
                    }} />
                </div>
            </div>
        </div>
    </div>
  );
};

export default ChatRoom;
