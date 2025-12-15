import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import api from '../../api';
import toast, { Toaster } from 'react-hot-toast';

interface ArticleEditorProps {
  articleId?: number; // If provided, edit mode. If undefined, create mode.
  onClose: () => void;
  onSuccess: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('**Hello world!!!**');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Auto-save key
  const storageKey = articleId ? `draft_article_${articleId}` : 'draft_new_article';

  useEffect(() => {
    // Load draft if exists
    const draft = localStorage.getItem(storageKey);
    if (draft && !articleId) {
       // Only load draft for new articles automatically to avoid overwriting fetched data with stale local data
       // For existing articles, we should probably compare timestamps or just load from server first.
       // For simplicity, let's load draft only for new articles.
       const parsed = JSON.parse(draft);
       setTitle(parsed.title || '');
       setContent(parsed.content || '');
       toast.success('Restored draft from local storage');
    }

    if (articleId) {
      fetchArticle(articleId);
    }
  }, [articleId]);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify({ title, content }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, storageKey]);

  const fetchArticle = async (id: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/articles/${id}/`);
      setTitle(res.data.title);
      setContent(res.data.content);
      if (res.data.cover_image) {
        setCoverPreview(res.data.cover_image);
      }
    } catch (error) {
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    try {
      if (articleId) {
        await api.patch(`/articles/${articleId}/`, formData);
        toast.success('Article updated successfully');
      } else {
        await api.post('/articles/', formData);
        toast.success('Article created successfully');
      }
      // Clear draft
      localStorage.removeItem(storageKey);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error('Operation failed: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toaster />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{articleId ? 'Edit Article' : 'New Article'}</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '0.5rem', background: 'white', cursor: 'pointer' }}>
                Cancel
            </button>
            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="comic-btn"
                style={{ padding: '0.5rem 1.5rem', background: 'var(--primary-color)', color: 'white', opacity: loading ? 0.7 : 1 }}
            >
                {loading ? 'Saving...' : 'Save Article'}
            </button>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <input 
            type="text" 
            placeholder="Article Title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                border: 'none', 
                borderBottom: '2px solid #eee',
                outline: 'none'
            }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Cover Image</label>
            <input type="file" onChange={handleImageUpload} accept="image/*" />
        </div>
        {coverPreview && (
            <div style={{ width: '100px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                <img src={coverPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
        )}
      </div>

      <div data-color-mode="light" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          height={500}
          preview="live"
        />
      </div>
    </div>
  );
};

export default ArticleEditor;
