import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleManager from './admin/ArticleManager';
import UsersManager from './admin/UsersManager';
import ArticleEditor from './admin/ArticleEditor';
import { AdminSidebar, type ViewMode } from './admin/layout/AdminSidebar';
import { AdminHeader } from './admin/layout/AdminHeader';
import api from '../api';
import './admin/layout/AdminLayout.css';

interface SiteVisit {
    id: number;
    ip_address: string;
    path: string;
    user_agent: string;
    timestamp: string;
}

interface TokenStats {
    global_stats: {
        total: number;
        input: number;
        output: number;
    };
    daily_usage: {
        date: string;
        total_tokens: number;
        count: number;
    }[];
}

interface DashboardStats {
    total_visits: number;
    recent_visits: SiteVisit[];
    daily_visits: { date: string; count: number }[];
    token_stats?: TokenStats;
}

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, isStaff, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('dashboard');
  const [editingArticleId, setEditingArticleId] = useState<number | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isStaff)) {
      navigate('/');
    }
  }, [loading, isAuthenticated, isStaff, navigate]);

  useEffect(() => {
      if (view === 'dashboard' && !loading && isAuthenticated && isStaff) {
          Promise.all([
            api.get('/dashboard/stats/'),
            api.get('/admin/token-stats/')
          ])
          .then(([res1, res2]) => {
              setStats({
                  ...res1.data,
                  token_stats: res2.data
              });
          })
          .catch(err => console.error('Failed to fetch stats', err));
      }
  }, [view, isAuthenticated, isStaff, loading]);

  if (loading) {
      return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

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

  const getPageTitle = () => {
    switch (view) {
        case 'dashboard': return 'Dashboard Overview';
        case 'articles': return 'Article Management';
        case 'editor': return editingArticleId ? 'Edit Article' : 'New Article';
        case 'users': return 'Users Management';
        default: return '';
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar 
        currentView={view} 
        onViewChange={setView} 
        onLogout={() => { logout(); navigate('/'); }} 
      />

      <div className="admin-main">
        <AdminHeader 
            title={getPageTitle()}
            subTitle={new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            currentTime={currentTime}
            onHomeClick={() => navigate('/')}
        />

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
                    
                    {/* Token Usage Section */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Global Token Usage</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Total Tokens</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>{stats?.token_stats?.global_stats.total || 0}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Input Tokens</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>{stats?.token_stats?.global_stats.input || 0}</div>
                            </div>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
                                <div style={{ color: 'var(--text-sub)', fontSize: '0.9rem' }}>Output Tokens</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f59e0b' }}>{stats?.token_stats?.global_stats.output || 0}</div>
                            </div>
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Daily Usage (Last 7 Days)</h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>Date</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>Total Tokens</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>Requests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.token_stats?.daily_usage.map((day, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '1rem', color: 'var(--text-sub)' }}>
                                                {new Date(day.date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{day.total_tokens}</td>
                                            <td style={{ padding: '1rem' }}>{day.count}</td>
                                        </tr>
                                    ))}
                                    {!stats?.token_stats?.daily_usage.length && (
                                        <tr>
                                            <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-sub)' }}>No token usage recorded yet.</td>
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
