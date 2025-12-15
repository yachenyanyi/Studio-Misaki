import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  externalOpen?: boolean;
  onClose?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ externalOpen, onClose }) => {
  const { login, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  // Remove the auto-redirect useEffect as we handle navigation in handleSubmit
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate('/admin/dashboard');
  //   }
  // }, [isAuthenticated, navigate]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Login
      const userData = await login({ username, password });
      
      // 2. Check staff status
      if (userData?.is_staff) {
          setError('');
          // 3. Navigate first
          navigate('/admin/dashboard');
          // 4. Close modal after a short delay to allow navigation to start
          // and prevent "unmount" issues
          setTimeout(() => {
             handleClose();
          }, 50);
      } else {
          // If not admin, logout immediately and show error
          await logout();
          setError('权限不足：仅允许管理员登录');
      }
    } catch (err) {
      setError('登录失败，请检查用户名/密码');
    }
  };

  // If already authenticated, this component doesn't render anything 
  // (logic handled by useEffect redirect or parent component)
  // FIX: Do NOT return null here, otherwise the modal will disappear immediately 
  // before the handleSubmit can finish its logic (like navigation).
  // if (isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={handleClose}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              background: 'white', padding: '2rem', borderRadius: '1rem',
              width: '90%', maxWidth: '400px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-main)' }}>管理员登录</h2>
            {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="用户名/邮箱"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <button type="submit" className="comic-btn" style={{ background: 'var(--primary-color)', color: 'white', padding: '0.8rem' }}>
                登录
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminLogin;
