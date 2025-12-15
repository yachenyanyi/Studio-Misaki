import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// 类型定义
interface GalleryItem {
  id: number;
  title: string;
  category: string;
  src: string;
  desc: string;
  width: number; // 用于模拟不同宽高比
  height: number;
}

// 模拟数据
const MOCK_IMAGES: GalleryItem[] = [
  { id: 1, title: "樱花树下", category: "风景", src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80", desc: "春日里盛开的樱花", width: 800, height: 600 },
  { id: 2, title: "未来都市", category: "科幻", src: "https://images.unsplash.com/photo-1515630278258-407f66498911?w=800&q=80", desc: "赛博朋克风格的街道", width: 600, height: 800 },
  { id: 3, title: "午后时光", category: "人物", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80", desc: "悠闲的下午茶", width: 800, height: 800 },
  { id: 4, title: "星空", category: "风景", src: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80", desc: "璀璨的银河系", width: 1200, height: 800 },
  { id: 5, title: "战斗天使", category: "人物", src: "https://images.unsplash.com/photo-1569779213435-ba3167dde7cc?w=800&q=80", desc: "准备战斗的姿态", width: 600, height: 900 },
  { id: 6, title: "神秘森林", category: "风景", src: "https://images.unsplash.com/photo-1448375240586-dfd8f3793371?w=800&q=80", desc: "迷雾缭绕的古老森林", width: 800, height: 500 },
  { id: 7, title: "像素冒险", category: "像素", src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80", desc: "复古游戏风格", width: 800, height: 600 },
  { id: 8, title: "机甲", category: "科幻", src: "https://images.unsplash.com/photo-1612151855475-877969f4a6cc?w=800&q=80", desc: "重型机甲单位", width: 800, height: 800 },
  { id: 9, title: "夏日祭", category: "人物", src: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80", desc: "烟火与浴衣", width: 1000, height: 600 },
];

const CATEGORIES = ["全部", "风景", "人物", "科幻", "像素"];

const Gallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [filteredImages, setFilteredImages] = useState(MOCK_IMAGES);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  // 过滤逻辑
  useEffect(() => {
    if (selectedCategory === "全部") {
      setFilteredImages(MOCK_IMAGES);
    } else {
      setFilteredImages(MOCK_IMAGES.filter(img => img.category === selectedCategory));
    }
  }, [selectedCategory]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageId === null) return;
      
      const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setSelectedImageId(filteredImages[prevIndex].id);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setSelectedImageId(filteredImages[nextIndex].id);
      } else if (e.key === 'Escape') {
        setSelectedImageId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageId, filteredImages]);

  // 切换图片
  const navigateImage = (direction: 'prev' | 'next', e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageId === null) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
    if (currentIndex === -1) return;

    if (direction === 'prev') {
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setSelectedImageId(filteredImages[prevIndex].id);
    } else {
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setSelectedImageId(filteredImages[nextIndex].id);
    }
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <div className="site-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}
          >
            二次元画廊
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ color: 'var(--text-sub)', fontSize: '1.1rem' }}
          >
            探索精美的动漫艺术世界
          </motion.p>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCategory(cat)}
              className="comic-btn"
              style={{
                background: selectedCategory === cat ? 'var(--primary-color)' : 'var(--bg-card)',
                color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '2rem',
                cursor: 'pointer',
                boxShadow: selectedCategory === cat ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'var(--shadow-sm)',
                transition: 'all 0.3s ease'
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Image Grid */}
        <motion.div 
            layout
            style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '2rem',
                paddingBottom: '4rem'
            }}
        >
            <AnimatePresence mode='popLayout'>
                {filteredImages.map((image) => (
                    <GalleryCard 
                        key={image.id} 
                        image={image} 
                        onClick={() => setSelectedImageId(image.id)} 
                    />
                ))}
            </AnimatePresence>
        </motion.div>

        {/* Lightbox */}
        <AnimatePresence>
            {selectedImageId !== null && (
                <Lightbox 
                    image={filteredImages.find(img => img.id === selectedImageId)!} 
                    onClose={() => setSelectedImageId(null)}
                    onPrev={(e) => navigateImage('prev', e)}
                    onNext={(e) => navigateImage('next', e)}
                />
            )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// 单个图片卡片组件
const GalleryCard: React.FC<{ image: GalleryItem; onClick: () => void }> = ({ image, onClick }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <motion.div
            layout
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            onClick={onClick}
            style={{ 
                background: 'var(--bg-card)', 
                borderRadius: '1rem', 
                overflow: 'hidden', 
                boxShadow: 'var(--shadow-md)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ position: 'relative', paddingTop: '75%', overflow: 'hidden' }}>
                <motion.img 
                    src={image.src} 
                    alt={image.title}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                        position: 'absolute', 
                        top: 0, left: 0, 
                        width: '100%', height: '100%', 
                        objectFit: 'cover' 
                    }}
                    loading="lazy"
                />
                <div style={{
                    position: 'absolute',
                    top: '1rem', right: '1rem',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    backdropFilter: 'blur(4px)'
                }}>
                    {image.category}
                </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{image.title}</h3>
                <p style={{ margin: 0, color: 'var(--text-sub)', fontSize: '0.9rem' }}>{image.desc}</p>
            </div>
        </motion.div>
    );
};

// 灯箱组件
const Lightbox: React.FC<{ 
    image: GalleryItem; 
    onClose: () => void;
    onPrev: (e: React.MouseEvent) => void;
    onNext: (e: React.MouseEvent) => void;
}> = ({ image, onClose, onPrev, onNext }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.9)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
            }}
        >
            {/* Controls */}
            <button 
                onClick={onClose}
                style={{ 
                    position: 'absolute', top: '2rem', right: '2rem', 
                    background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer', zIndex: 100 
                }}
            >
                <i className="fa fa-times"></i>
            </button>

            <button 
                onClick={onPrev}
                style={{ 
                    position: 'absolute', left: '2rem', 
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                    color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <i className="fa fa-chevron-left"></i>
            </button>

            <button 
                onClick={onNext}
                style={{ 
                    position: 'absolute', right: '2rem', 
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '50px', height: '50px',
                    color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(4px)'
                }}
            >
                <i className="fa fa-chevron-right"></i>
            </button>

            {/* Image Content */}
            <div 
                onClick={(e) => e.stopPropagation()} 
                style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }}
            >
                <motion.img 
                    key={image.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    src={image.src} 
                    alt={image.title}
                    style={{ 
                        maxWidth: '100%', maxHeight: '80vh', 
                        objectFit: 'contain', 
                        borderRadius: '0.5rem',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
                    }}
                />
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginTop: '1rem', textAlign: 'center', color: 'white' }}
                >
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{image.title}</h2>
                    <p style={{ color: '#cbd5e1' }}>{image.desc}</p>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Gallery;
