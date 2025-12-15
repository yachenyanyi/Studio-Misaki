import React from 'react';
import { motion } from 'framer-motion';

interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

const ArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  // Deterministic random color based on post ID
  const bgColors = [
    'var(--primary)', 
    'var(--secondary)', 
    'var(--accent)', 
    '#FFDAC1', 
    '#E2F0CB', 
    '#B5EAD7'
  ];
  const bgColor = bgColors[post.id % bgColors.length];

  return (
    <motion.div
      className="comic-box article-card-responsive"
      whileHover={{ 
        scale: 1.02,
        rotate: 1,
        boxShadow: '8px 8px 0px var(--border-color)'
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '220px',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        marginBottom: '2rem'
      }}
    >
      {/* Left Image Section */}
      <div 
        className="article-card-image"
        style={{ 
          flex: '0 0 40%', 
          backgroundColor: bgColor,
          borderRight: 'var(--border-width) solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative pattern for the image placeholder */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 2px, transparent 2px)',
          backgroundSize: '15px 15px'
        }} />
        
        {/* Placeholder Icon/Emoji */}
        <span style={{ fontSize: '4rem', zIndex: 1 }}>
          {['✨', '🎮', '🍜', '🎏', '🌸', '🎌'][post.id % 6]}
        </span>
        
        {/* Comic "Speed Line" decoration */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-20px',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '50%',
        }} />
      </div>

      {/* Right Content Section */}
      <div style={{ 
        flex: 1, 
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'white'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-display)',
            lineHeight: 1.2
          }}>
            {post.title}
          </h3>
          <p style={{ 
            color: 'var(--text-light)', 
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontFamily: 'var(--font-body)',
            fontSize: '1.1rem'
          }}>
            {post.content}
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 'auto' 
        }}>
          <span style={{ 
            fontSize: '0.9rem', 
            fontWeight: 'bold',
            color: 'var(--primary-dark)',
            background: 'var(--bg-color)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '2px solid var(--primary-dark)'
          }}>
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          
          <motion.div 
            whileHover={{ x: 5 }}
            style={{ fontWeight: 'bold', color: 'var(--border-color)' }}
          >
            READ MORE →
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArticleCard;
