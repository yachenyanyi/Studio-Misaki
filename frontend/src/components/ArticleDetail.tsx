import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Article {
  id: number;
  title: string;
  content: string;
  cover_image: string | null;
  created_at: string;
}

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(`/articles/${id}/`);
        setArticle(response.data);
      } catch (error) {
        console.error('Failed to fetch article', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading...</div>;
  }

  if (!article) {
    return <div style={{ textAlign: 'center', padding: '5rem' }}>Article not found</div>;
  }

  const bgImage = article.cover_image 
    ? `url('${article.cover_image}')` 
    : `url('/static/gallary/125633249_p0.jpg')`;

  return (
    <>
      {/* Article Header (Hero Section) */}
      <div className="headertop article-header" style={{ '--bg-hero-image': bgImage } as React.CSSProperties}>
        <div className="center-image"></div>
        <div className="focusinfo">
            <h1 className="center-text sakura-title" data-text={article.title}>{article.title}</h1>
            <div className="header-info">
                <p><i className="fa fa-calendar"></i> {new Date(article.created_at).toLocaleDateString()}</p>
            </div>
        </div>
        {/* Wave Effect */}
        <div className="wave-container">
            <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" />
            <use xlinkHref="#gentle-wave" x="48" y="3" />
            <use xlinkHref="#gentle-wave" x="48" y="5" />
            <use xlinkHref="#gentle-wave" x="48" y="7" />
            </g>
            </svg>
        </div>
      </div>

      {/* Main Content */}
      <div id="content" className="site-content single-content">
        <article className="post-content">
            <div className="entry-content" data-color-mode="light">
                {/* 
                  ReactMarkdown with rehypeRaw allows rendering HTML inside Markdown.
                  This is useful for embedding iframes like Spotify/YouTube or custom HTML.
                  Note: Be cautious about XSS if users are untrusted. Since only admins post, it's relatively safe.
                */}
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {article.content}
                </ReactMarkdown>
            </div>

            <div className="post-tags">
                <a href="#">#Sakura</a>
                <a href="#">#Article</a>
            </div>

            <div className="post-navigation">
                <div className="nav-previous">
                    <Link to="/">
                        <span className="nav-subtitle"><i className="fa fa-chevron-left"></i> Return</span> 
                        <span className="nav-title">Home</span>
                    </Link>
                </div>
            </div>
        </article>
      </div>
    </>
  );
};

export default ArticleDetail;
