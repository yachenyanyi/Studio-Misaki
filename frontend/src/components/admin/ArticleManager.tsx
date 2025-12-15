import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast, { Toaster } from 'react-hot-toast';

interface Article {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ArticleManagerProps {
  onEdit: (id: number) => void;
  onCreate: () => void;
}

const ArticleManager: React.FC<ArticleManagerProps> = ({ onEdit, onCreate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles/');
      setArticles(res.data.results || res.data);
    } catch (error) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        try {
            await api.delete(`/articles/${id}/`);
            toast.success('Article deleted');
            fetchArticles();
        } catch (error) {
            toast.error('Failed to delete article');
        }
    }
  };

  return (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)' }}>
      <Toaster />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Articles</h2>
        <button 
            onClick={onCreate}
            className="comic-btn"
            style={{ background: 'var(--secondary-color)', color: 'white', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
        >
            <i className="fa fa-plus"></i> New Article
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-sub)' }}>ID</th>
                        <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-sub)' }}>Title</th>
                        <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-sub)' }}>Created</th>
                        <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-sub)' }}>Last Updated</th>
                        <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-sub)', textAlign: 'right' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map(article => (
                        <tr key={article.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }}>
                            <td style={{ padding: '1rem', color: 'var(--text-light)' }}>#{article.id}</td>
                            <td style={{ padding: '1rem', fontWeight: 500 }}>{article.title}</td>
                            <td style={{ padding: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                {new Date(article.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--text-sub)', fontSize: '0.9rem' }}>
                                {new Date(article.updated_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <button 
                                    onClick={() => onEdit(article.id)}
                                    style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: 'pointer', color: '#3b82f6' }}
                                >
                                    <i className="fa fa-edit"></i> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(article.id)}
                                    style={{ padding: '0.4rem 0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'white', cursor: 'pointer', color: '#ef4444' }}
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {articles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    No articles found. Create your first one!
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ArticleManager;
