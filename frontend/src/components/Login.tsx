import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = identity.includes('@') ? { email: identity, password } : { username: identity, password };
      await login(payload);
      setError('');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || '登录失败，请检查用户名/邮箱和密码';
      setError(msg);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="comic-box" style={{ width: '100%', maxWidth: 420, padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>登录</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="用户名或邮箱"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          <button type="submit" className="comic-btn" style={{ background: 'var(--primary-color)', color: '#fff', padding: '0.8rem' }}>
            登录
          </button>
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--primary-color)' }}>忘记密码</a>
            <a href="/register" style={{ color: 'var(--primary-color)' }}>注册新用户</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
