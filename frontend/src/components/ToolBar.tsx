import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const tools = [
  {
    id: 'json-formatter',
    title: 'JSON格式化工具',
    icon: 'fa-code',
    color: '#3b82f6',
    desc: '美化和验证JSON数据'
  },
  {
    id: 'color-picker',
    title: '调色板生成器',
    icon: 'fa-palette',
    color: '#ec4899',
    desc: '生成美丽的配色方案'
  },
  {
    id: 'base64',
    title: 'Base64转换器',
    icon: 'fa-exchange-alt',
    color: '#10b981',
    desc: '编码和解码Base64字符串'
  },
  {
    id: 'pomodoro',
    title: '番茄时钟',
    icon: 'fa-hourglass-half',
    color: '#f59e0b',
    desc: '使用番茄工作法保持专注'
  },
  {
    id: 'image-converter',
    title: '图片转换器',
    icon: 'fa-images',
    color: '#8b5cf6',
    desc: '在本地转换、调整大小和优化图片'
  },
  {
    id: 'emoji-mix',
    title: 'Emoji Mix 创意工坊',
    icon: 'fa-flask',
    color: '#ef4444',
    desc: '混合两个表情，创造独特的创意Emoji'
  }
];

const ToolBar: React.FC = () => {
  return (
    <div className="tool-bar" style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '3rem', maxWidth: '1200px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
        <i className="fa fa-toolbox" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}></i>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
            开发工具
        </h2>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            whileHover={{ y: -5, boxShadow: 'var(--shadow-md)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link to={`/tools/${tool.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'var(--bg-card)', 
                padding: '1.5rem', 
                borderRadius: '1rem', 
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ 
                  width: '3rem', 
                  height: '3rem', 
                  borderRadius: '0.8rem', 
                  background: `${tool.color}15`, 
                  color: tool.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  <i className={`fa ${tool.icon}`}></i>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    {tool.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>
                    {tool.desc}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ToolBar;
