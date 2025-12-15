import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const ChainlitDialog: React.FC = () => {
  return (
    <motion.div 
      className="comic-box"
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
      style={{
        height: '80vh',
        width: '100%',
        maxWidth: '1000px',
        margin: '6rem auto 4rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Decorative "Window" Header */}
      <div style={{
        padding: '0.75rem 1.5rem',
        background: 'var(--primary)',
        borderBottom: 'var(--border-width) solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['#ff5f56', '#ffbd2e', '#27c93f'].map(color => (
            <div key={color} style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: color,
              border: '2px solid rgba(0,0,0,0.2)'
            }} />
          ))}
        </div>
        <div style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 'bold',
          color: 'white',
          fontSize: '1.2rem',
          textShadow: '1px 1px 0 rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <MessageCircle size={20} />
          <span>Sakura AI Chat Room</span>
        </div>
        <div style={{ width: '60px' }} /> {/* Spacer for balance */}
      </div>

      {/* Chat Content */}
      <div style={{ flex: 1, background: '#fff' }}>
        <iframe 
          src="http://localhost:8001" 
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Chainlit Dialog"
        />
      </div>

      {/* Decorative corner accent */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '40px',
        height: '40px',
        background: 'linear-gradient(135deg, transparent 50%, var(--accent) 50%)',
        opacity: 0.5,
        pointerEvents: 'none'
      }} />
    </motion.div>
  );
};

export default ChainlitDialog;
