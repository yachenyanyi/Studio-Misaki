import React, { useState } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface AddArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddArticleModal: React.FC<AddArticleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (image) {
      formData.append('cover_image', image);
    }

    try {
      // Don't set Content-Type header manually for FormData
      // Axios will set it correctly with boundary
      await api.post('/articles/', formData);
      onSuccess();
      onClose();
      setTitle('');
      setContent('');
      setImage(null);
    } catch (error: any) {
      console.error('Failed to add article', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(`Failed to add article: ${error.response.status} ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        alert('Failed to add article: No response from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        alert(`Failed to add article: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={onClose}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            style={{
              background: 'white', padding: '2rem', borderRadius: '1rem',
              width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Add New Article</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cover Image</label>
                <input
                  type="file"
                  onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                  This image will be used as the cover card and the article detail background.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  rows={10}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={onClose} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="comic-btn" 
                  style={{ background: 'var(--primary-color)', color: 'white', padding: '0.8rem 1.5rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddArticleModal;
