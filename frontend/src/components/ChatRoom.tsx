import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';

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
        width: '100%'
    }}>
        <style>
            {`
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            @keyframes pulse-soft {
                0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); }
                70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
                100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
            }
            .chat-card:hover .arrow-icon {
                transform: translateX(5px);
            }
            @media (max-width: 768px) {
                .chat-card {
                    flex-direction: column !important;
                    text-align: center;
                    padding: 2rem !important;
                }
                .chat-visual {
                    margin-top: 2rem;
                }
            }
            `}
        </style>
        <div 
            className="chat-card"
            style={{ 
                position: 'relative',
                width: '100%',
                maxWidth: '1000px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '4rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '4rem',
                border: '1px solid rgba(255,255,255,0.6)',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
            onClick={() => navigate('/chat')}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(99, 102, 241, 0.15), 0 10px 20px rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)';
            }}
        >
            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                opacity: 0.08,
                borderRadius: '50%',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
             <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '-50px',
                width: '200px',
                height: '200px',
                background: 'var(--primary-color)',
                opacity: 0.05,
                borderRadius: '50%',
                filter: 'blur(50px)',
                zIndex: 0
            }} />

            {/* Left Content */}
            <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '1.5rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600
                }}>
                    <Sparkles size={16} />
                    <span>AI Powered</span>
                </div>
                <h2 style={{ 
                    fontSize: '3rem', 
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
                        WebkitTextFillColor: 'transparent'
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
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    transition: 'transform 0.2s'
                }}>
                    立即体验 <ArrowRight className="arrow-icon" size={20} />
                </div>
            </div>

            {/* Right Visual */}
            <div className="chat-visual" style={{ 
                position: 'relative', 
                width: '320px', 
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
            }}>
                {/* Central Icon Background */}
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(255,255,255,0) 70%)',
                    animation: 'pulse-soft 3s infinite'
                }} />
                
                {/* Floating Bubbles */}
                <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '10px',
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '20px 20px 4px 20px',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'float 5s ease-in-out infinite',
                    animationDelay: '0s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    fontWeight: 500
                }}>
                    <Bot size={20} color="var(--primary-color)" />
                    <span>你好！我可以帮你什么？</span>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '0px',
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '20px 20px 20px 4px',
                    boxShadow: 'var(--shadow-lg)',
                    animation: 'float 5s ease-in-out infinite',
                    animationDelay: '2.5s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    fontWeight: 500
                }}>
                    <span>帮我写一段 Python 代码</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--secondary-color)' }}></div>
                    </div>
                </div>

                {/* Main Visual Circle */}
                <div style={{
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
                    zIndex: 2,
                    position: 'relative'
                }}>
                    <MessageCircle size={72} color="white" strokeWidth={1.5} />
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
