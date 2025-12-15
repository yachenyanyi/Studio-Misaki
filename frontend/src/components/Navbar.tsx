import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Home, Book, User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: '1rem 2rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(5px)',
      zIndex: 1000,
      borderBottom: 'var(--border-width) solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 0 rgba(0,0,0,0.05)'
    }}>
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '1.8rem',
          fontFamily: 'var(--font-display)',
          color: 'var(--primary-dark)',
          cursor: 'pointer',
          textShadow: '2px 2px 0px var(--secondary)'
        }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Sparkles size={36} color="var(--pop)" strokeWidth={3} />
        </motion.div>
        <span>Sakura Blog</span>
      </motion.div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {[
          { icon: Home, label: 'Home', color: 'var(--accent)' },
          { icon: Book, label: 'Articles', color: 'var(--secondary)' },
          { icon: User, label: 'About', color: 'var(--primary)' }
        ].map((item, index) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.1, rotate: 3, y: -2 }}
            whileTap={{ scale: 0.9, y: 2 }}
            className="comic-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              background: item.color,
              fontSize: '1.1rem',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          >
            <item.icon size={20} strokeWidth={2.5} />
            {item.label}
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
