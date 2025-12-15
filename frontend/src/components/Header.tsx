import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const handleAvatarClick = () => {
      if (isAuthenticated) {
          // Simple toggle for now: if admin, go to dashboard; else logout confirm or simple logout
          // Or better: show a small menu. For now, let's implement a simple logic:
          // If admin -> go to dashboard
          // If user -> logout (temporary)
          if (isStaff) {
              navigate('/admin/dashboard');
          } else {
              if (window.confirm('是否退出登录？')) {
                  logout();
                  navigate('/');
              }
          }
      } else {
          setIsLoginModalOpen(true);
      }
  };

  return (
    <header className="site-header">
        <div className="site-branding">
            <h1 className="site-title"><Link to="/">Sakura AI</Link></h1>
            <p className="site-description">樱花树下的 AI 伙伴</p>
        </div>
        <nav className="site-navigation">
            <ul>
                <li><Link to="/"><i className="fa fa-home"></i> 首页</Link></li>
                <li><Link to="/chat"><i className="fa fa-comment"></i> 对话</Link></li>
                <li><Link to="/tools"><i className="fa fa-toolbox"></i> 工具</Link></li>
                <li><Link to="/gallery"><i className="fa fa-image"></i> 画廊</Link></li>
                <li><Link to="/game"><i className="fa fa-gamepad"></i> 游戏</Link></li>
                <li><Link to="/"><i className="fa fa-user"></i> 关于</Link></li>
            </ul>
        </nav>
        <div 
            className="header-user-avatar" 
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer' }}
            title={isAuthenticated ? (isStaff ? "管理后台" : "点击退出") : "点击登录"}
        >
            <img src="/static/images/avatar.jpg" alt="Avatar" />
        </div>
        
        {/* Render AdminLogin but control its visibility via prop or keep it hidden until triggered */}
        {/* Since AdminLogin component manages its own state, we might need to refactor it or just use it as is if it exposes a way to open.
            However, the current AdminLogin uses a local button to trigger.
            Let's adjust AdminLogin to accept an isOpen prop or we can just render it and use its internal state if we modify it.
            
            Actually, based on previous code, AdminLogin has a local isOpen state and a trigger button.
            To make it cleaner, let's just mount a modified version or pass a ref. 
            For simplicity in this step, let's assume we modify AdminLogin to be controlled or we just use a trick.
        */}
        <div style={{ display: 'none' }}>
            {/* We will refactor AdminLogin to be a Modal component that we can control from here,
                OR we update AdminLogin to take an `isOpen` prop.
                Let's update AdminLogin.tsx first.
            */}
        </div>
        <AdminLogin 
            externalOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
        />
    </header>
  );
};

export default Header;
