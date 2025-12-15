import React, { useEffect, useState } from 'react';
import api from '../../api';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface UserSummary {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  date_joined: string;
  last_login: string | null;
  threads_count: number;
}

interface UserDetail extends Omit<UserSummary, 'threads_count'> {
  chat_threads: Array<{ id: number; thread_id: string; assistant_id: string; title: string; created_at: string; updated_at: string }>;
}

const UsersManager: React.FC = () => {
  const { isAuthenticated, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [isStaffFilter, setIsStaffFilter] = useState<'all'|'true'|'false'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: pageSize };
      if (query.trim()) params.q = query.trim();
      if (isStaffFilter !== 'all') params.is_staff = isStaffFilter;
      const resp = await api.get('/admin/users/', { params });
      setUsers(resp.data.results || []);
      setTotal(resp.data.total || 0);
      setPages(resp.data.pages || 0);
    } catch (e) {
      console.error('Failed to fetch users', e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const resp = await api.get(`/admin/users/${id}/`);
      setDetail(resp.data);
    } catch (e) {
      console.error('Failed to fetch detail', e);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isStaff) {
      fetchUsers();
    }
  }, [page, pageSize, isStaffFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="按用户名/邮箱搜索"
          style={{ padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', width: '280px' }}
        />
        <select
          value={isStaffFilter}
          onChange={(e) => setIsStaffFilter(e.target.value as any)}
          style={{ padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}
        >
          <option value="all">全部</option>
          <option value="true">管理员</option>
          <option value="false">普通用户</option>
        </select>
        <button
          onClick={() => { setPage(1); fetchUsers(); }}
          className="comic-btn"
          style={{ background: 'var(--primary-color)', color: 'white', padding: '0.6rem 1rem' }}
        >
          搜索
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-sub)' }}>共 {total} 位用户</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ color: 'var(--text-sub)' }}>每页</label>
            <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-sub)', textAlign: 'left' }}>
                <th style={{ padding: '0.8rem' }}>用户名</th>
                <th style={{ padding: '0.8rem' }}>邮箱</th>
                <th style={{ padding: '0.8rem' }}>角色</th>
                <th style={{ padding: '0.8rem' }}>注册时间</th>
                <th style={{ padding: '0.8rem' }}>最近登录</th>
                <th style={{ padding: '0.8rem' }}>线程数</th>
                <th style={{ padding: '0.8rem' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center' }}>加载中...</td></tr>
              )}
              {!loading && users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.8rem' }}>{u.username}</td>
                  <td style={{ padding: '0.8rem' }}>{u.email || '-'}</td>
                  <td style={{ padding: '0.8rem' }}>{u.is_staff ? '管理员' : '用户'}</td>
                  <td style={{ padding: '0.8rem' }}>{new Date(u.date_joined).toLocaleString()}</td>
                  <td style={{ padding: '0.8rem' }}>{u.last_login ? new Date(u.last_login).toLocaleString() : '-'}</td>
                  <td style={{ padding: '0.8rem' }}>{u.threads_count}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <button onClick={() => openDetail(u.id)} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '0.4rem', cursor: 'pointer' }}>
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-sub)' }}>暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-sub)' }}>第 {page} / {Math.max(pages, 1)} 页</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} style={{ padding: '0.4rem 0.8rem' }}>上一页</button>
            <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} style={{ padding: '0.4rem 0.8rem' }}>下一页</button>
          </div>
        </div>
      </div>

      {detail && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', padding: '1rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem' }}>用户详情：{detail.username}</h3>
            <button onClick={()=>setDetail(null)} style={{ padding: '0.4rem 0.8rem' }}>关闭</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.8rem' }}>
            <div><div style={{ color: 'var(--text-sub)' }}>邮箱</div><div>{detail.email || '-'}</div></div>
            <div><div style={{ color: 'var(--text-sub)' }}>角色</div><div>{detail.is_staff ? '管理员' : '用户'}</div></div>
            <div><div style={{ color: 'var(--text-sub)' }}>注册时间</div><div>{new Date(detail.date_joined).toLocaleString()}</div></div>
            <div><div style={{ color: 'var(--text-sub)' }}>最近登录</div><div>{detail.last_login ? new Date(detail.last_login).toLocaleString() : '-'}</div></div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-sub)' }}>最近会话线程（最多20条）</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: 'var(--text-sub)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>标题</th>
                    <th style={{ padding: '0.6rem' }}>助手</th>
                    <th style={{ padding: '0.6rem' }}>线程ID</th>
                    <th style={{ padding: '0.6rem' }}>更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.chat_threads.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.6rem' }}>{t.title || '-'}</td>
                      <td style={{ padding: '0.6rem' }}>{t.assistant_id}</td>
                      <td style={{ padding: '0.6rem' }}>{t.thread_id}</td>
                      <td style={{ padding: '0.6rem' }}>{new Date(t.updated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {detail.chat_threads.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--text-sub)' }}>暂无线程</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UsersManager;
