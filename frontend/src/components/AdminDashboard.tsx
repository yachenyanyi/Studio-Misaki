import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleManager from './admin/ArticleManager';
import UsersManager from './admin/UsersManager';
import ArticleEditor from './admin/ArticleEditor';
import api from '../api';

type ViewMode = 'dashboard' | 'articles' | 'editor';

interface SiteVisit {
    id: number;
    ip_address: string;
    path: string;
    user_agent: string;
    timestamp: string;
}

interface DashboardStats {
    total_visits: number;
    recent_visits: SiteVisit[];
    daily_visits: { date: string; count: number }[];
}

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, isStaff, logout, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('dashboard');
  const [editingArticleId, setEditingArticleId] = useState<number | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setAuthReady(true));
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authReady && (!isAuthenticated || !isStaff)) {
      navigate('/');
    }
  }, [authReady, isAuthenticated, isStaff, navigate]);

  useEffect(() => {
      if (view === 'dashboard' && isAuthenticated && isStaff) {
          api.get('/dashboard/stats/')
            .then(res => setStats(res.data))
            .catch(err => console.error('Failed to fetch stats', err));
      }
  }, [view, isAuthenticated, isStaff]);

  const handleEditArticle = (id: number) => {
    setEditingArticleId(id);
    setView('editor');
  };

  const handleCreateArticle = () => {
    setEditingArticleId(undefined);
    setView('editor');
  };

  const handleEditorClose = () => {
    setView('articles');
    setEditingArticleId(undefined);
  };

  const handleEditorSuccess = () => {
    setView('articles');
    setEditingArticleId(undefined);
  };

  // Sidebar Navigation Component
  const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <div 
        onClick={onClick}
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            cursor: 'pointer',
            background: active ? '#eff6ff' : 'transparent',
            color: active ? '#3b82f6' : 'var(--text-sub)',
            marginBottom: '0.5rem',
            transition: 'all 0.2s'
        }}
    >
        <i className={`fa ${icon}`} style={{ width: '20px', textAlign: 'center' }}></i>
        <span style={{ fontWeight: 500 }}>{label}</span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'white', borderRight: '1px solid #e2e8f0', height: '100vh', position: 'fixed', left: 0, top: 0, padding: '2rem 1rem', zIndex: 10 }}>
        <div style={{ padding: '0 1rem 2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>Sakura Admin</h2>
        </div>
        
        <nav>
            <SidebarItem 
                icon="fa-chart-pie" 
                label="Dashboard" 
                active={view === 'dashboard'} 
                onClick={() => setView('dashboard')} 
            />
            <SidebarItem 
                icon="fa-file-alt" 
                label="Articles" 
                active={view === 'articles' || view === 'editor'} 
                onClick={() => setView('articles')} 
            />
            {/* Future Modules */}
            <SidebarItem icon="fa-users" label="Users" active={view === 'users'} onClick={() => setView('users')} />
            <SidebarItem icon="fa-comments" label="Comments" onClick={() => {}} />
            <SidebarItem icon="fa-cog" label="Settings" onClick={() => {}} />
        </nav>

        <div style={{ position: 'absolute', bottom: '2rem', left: '1rem', right: '1rem' }}>
            <button 
                onClick={() => { logout(); navigate('/'); }}
                style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    border: '1px solid #fee2e2', 
                    background: '#fef2f2', 
                    color: '#ef4444', 
                    borderRadius: '0.5rem', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                }}
            >
                <i className="fa fa-sign-out"></i> Logout
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '260px', padding: '2rem 3rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {view === 'dashboard' && 'Dashboard Overview'}
                    {view === 'articles' && 'Article Management'}
                    {view === 'editor' && (editingArticleId ? 'Edit Article' : 'New Article')}
                </h1>
                <p style={{ color: 'var(--text-sub)', marginTop: '0.5rem' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', boxShadow: 'var(--shadow-sm)', fontSize: '0.9rem', color: 'var(--text-sub)' }}>
                    <i className="fa fa-clock" style={{ marginRight: '0.5rem' }}></i>
                    {currentTime.toLocaleTimeString()}
                 </div>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', cursor: 'pointer' }} onClick={() => navigate('/')} title="Go Home">
                    <i className="fa fa-home"></i>
                 </div>
            </div>
        </header>

        <AnimatePresence mode="wait">
            {view === 'dashboard' && (
                <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                >
                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>System Status</h3>
                            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: '#22c55e' }}>
                                <i className="fa fa-check-circle" style={{ marginRight: '0.5rem' }}></i> Running
                            </p>
                        </div>
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Visits</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                                {stats ? stats.total_visits : '...'}
                            </p>
                        </div>
                         <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Today's Activity</h3>
                            <p style={{ fontSize: '2rem', fontWeight: 700, color: '#f59e0b' }}>
                                {stats && stats.daily_visits.length > 0 
                                    ? stats.daily_visits[stats.daily_visits.length - 1].count 
                                    : 0}
                            </p>
                        </div>
                    </div>

                    {/* Recent Visits Table */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Recent Visits</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-sub)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', fontWeight: 500 }}>Time</th>
                                        <th style={{ padding: '1rem', fontWeight: 500 }}>IP Address</th>
                                        <th style={{ padding: '1rem', fontWeight: 500 }}>Path</th>
                                        <th style={{ padding: '1rem', fontWeight: 500 }}>User Agent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recent_visits.map(visit => (
                                        <tr key={visit.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '1rem', color: 'var(--text-sub)' }}>
                                                {new Date(visit.timestamp).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{visit.ip_address}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '0.3rem', fontSize: '0.85rem' }}>
                                                    {visit.path}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-sub)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={visit.user_agent}>
                                                {visit.user_agent}
                                            </td>
                                        </tr>
                                    ))}
                                    {!stats?.recent_visits.length && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>No visits recorded yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            )}

            {view === 'articles' && (
                <motion.div
                    key="articles"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <ArticleManager onEdit={handleEditArticle} onCreate={handleCreateArticle} />
                </motion.div>
            )}

            {view === 'editor' && (
                <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ height: 'calc(100vh - 180px)' }}
                >
                    <ArticleEditor 
                        articleId={editingArticleId} 
                        onClose={handleEditorClose} 
                        onSuccess={handleEditorSuccess} 
                    />
                </motion.div>
            )}

            {view === 'users' && (
                <motion.div
                    key="users"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <UsersManager />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
