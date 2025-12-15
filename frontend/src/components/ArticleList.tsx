import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AddArticleModal from './AddArticleModal';

interface Article {
  id: number;
  title: string;
  content: string;
  cover_image: string | null;
  created_at: string;
}

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { isStaff } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchArticles = async () => {
    try {
      const response = await api.get('/articles/');
      setArticles(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch articles', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await api.delete(`/articles/${id}/`);
        fetchArticles();
      } catch (error) {
        alert('Failed to delete article');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading articles...</div>;
  }

  return (
    <div className="post-list">
        {isStaff && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <Link 
              to="/admin/dashboard"
              className="comic-btn"
              style={{ 
                background: 'var(--secondary-color)', 
                color: 'white', 
                padding: '1rem 2rem', 
                fontSize: '1.1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
            >
              <i className="fa fa-cog"></i> Go to Admin Dashboard
            </Link>
          </div>
        )}

        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
            No articles yet. {isStaff && 'Why not write one?'}
          </div>
        ) : (
          articles.map(article => (
            <article key={article.id} className="post-entry">
                <div className="feature-image">
                    <Link to={`/article/${article.id}`}>
                        <img 
                          src={article.cover_image || '/static/gallary/125633249_p0.jpg'} 
                          alt={article.title} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/static/gallary/125633249_p0.jpg';
                          }}
                        />
                    </Link>
                </div>
                <div className="entry-header">
                    <h1 className="entry-title">
                      <Link to={`/article/${article.id}`}>{article.title}</Link>
                    </h1>
                    <div className="p-time">
                      <i className="fa fa-calendar"></i> {new Date(article.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div className="entry-content">
                    {/* Use a regex to strip HTML tags for the preview text */}
                    <p>{article.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...</p>
                </div>
                <div className="post-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <i className="fa fa-ellipsis-h"></i>
                </div>
            </article>
          ))
        )}

        <AddArticleModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchArticles}
        />
    </div>
  );
};

export default ArticleList;
