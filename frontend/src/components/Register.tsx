import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register({ username, email, password });
      setSuccess('注册成功，即将跳转登录...');
      setTimeout(() => {
        // Redirect to login, assuming the user will login there
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || '注册失败，请检查输入';
      setError(msg);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="comic-box" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>注册</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>{success}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          <input
            type="email"
            placeholder="邮箱（可选）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <input
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
            required
          />
          <button type="submit" className="comic-btn" style={{ background: 'var(--primary-color)', color: '#fff', padding: '0.8rem' }}>
            注册
          </button>
          <div style={{ textAlign: 'right' }}>
            <span 
              onClick={() => navigate('/login')} 
              style={{ color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              已有账号？去登录
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
