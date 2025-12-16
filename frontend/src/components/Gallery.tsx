import React, { useState } from 'react';
import { motion } from 'framer-motion';

// --- 类型定义 ---
interface GalleryItem {
  id: number;
  chapter: string;    // e.g., "第一章", "Chapter 1"
  title: string;      // e.g., "俯瞰风景"
  subTitle: string;   // e.g., "Overlooking View"
  src: string;
  desc: string;
  quote: string;      // 经典台词
  color: string;      // 主题色
}

// --- 数据源：完全复刻《空之境界》剧场版章节 ---
const KNK_CHAPTERS: GalleryItem[] = [
  { 
    id: 1, 
    chapter: "第一章", 
    title: "俯瞰风景", 
    subTitle: "Overlooking View", 
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80", // 城市俯瞰/高楼
    desc: "选择死亡的少女们，与在空中飞舞的幽灵。",
    quote: "“只要是在空中的东西，就算是神我也杀给你看。”",
    color: "#3498db" 
  },
  { 
    id: 2, 
    chapter: "第二章", 
    title: "杀人考察（前）", 
    subTitle: "Murder Speculation (Part A)", 
    src: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=1200&q=80", // 雨夜/血迹感
    desc: "雨夜中的连环杀人鬼，与少年的相遇。",
    quote: "“我，想要杀了你。”",
    color: "#c0392b" 
  },
  { 
    id: 3, 
    chapter: "第三章", 
    title: "痛觉残留", 
    subTitle: "Remaining Sense of Pain", 
    src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&q=80", // 扭曲/酒吧/夜晚
    desc: "无痛觉的少女，与无法逃离的螺旋。",
    quote: "“好痛——好痛啊。”",
    color: "#8e44ad" 
  },
  { 
    id: 4, 
    chapter: "第四章", 
    title: "伽蓝之洞", 
    subTitle: "The Hollow Shrine", 
    src: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=1200&q=80", // 医院/虚空/花
    desc: "两年的沉睡，醒来后眼中映出的“死”。",
    quote: "“只要是活著的东西，就算是神我也杀给你看。”",
    color: "#2ecc71" 
  },
  { 
    id: 5, 
    chapter: "第五章", 
    title: "矛盾螺旋", 
    subTitle: "Paradox Spiral", 
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80", // 螺旋楼梯/建筑
    desc: "无限循环的公寓，追求根源的魔术师。",
    quote: "“你真正想要的，到底是什么？”",
    color: "#e74c3c" 
  },
  { 
    id: 6, 
    chapter: "第六章", 
    title: "忘却录音", 
    subTitle: "Oblivion Recording", 
    src: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=1200&q=80", // 学校/雪/教堂
    desc: "女子学院的妖精，被夺走的记忆。",
    quote: "“为了不忘记这份心情，我将它记录下来。”",
    color: "#f1c40f" 
  },
  { 
    id: 7, 
    chapter: "第七章", 
    title: "杀人考察（后）", 
    subTitle: "Murder Speculation (Part B)", 
    src: "https://images.unsplash.com/photo-1505506874110-6a7a69069a08?w=1200&q=80", // 森林/月光/血
    desc: "起源的觉醒，长达四年的杀意终结。",
    quote: "“只要你还活着，我就不会放过你。”",
    color: "#e67e22" 
  },
  { 
    id: 8, 
    chapter: "终章", 
    title: "空之境界", 
    subTitle: "the Garden of sinners", 
    src: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80", // 雪景/宁静
    desc: "在此处，唯有宁静的雪。",
    quote: "“就像是，做了一个很长的梦。”",
    color: "#ecf0f1" 
  }
];

const Gallery: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050505', 
      color: '#f5f5f5',
      fontFamily: '"Noto Serif SC", "Songti SC", serif', // 强制衬线体
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* 背景装饰：死之线 */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '-10%', width: '120%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(192, 57, 43, 0.3), transparent)',
          transform: 'rotate(15deg)'
        }} />
         <div style={{
          position: 'absolute', top: '70%', left: '-10%', width: '120%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.2), transparent)',
          transform: 'rotate(-5deg)'
        }} />
      </div>

      <div className="site-content" style={{ position: 'relative', zIndex: 1, padding: '0' }}>
        
        {/* Header: 极简，巨大标题 */}
        <header style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <h2 style={{ 
              fontSize: '1.2rem', 
              letterSpacing: '0.5em', 
              marginBottom: '1rem', 
              color: '#bdc3c7',
              textTransform: 'uppercase'
            }}>
              Type-Moon Aesthetic
            </h2>
            <h1 style={{ 
              fontSize: 'clamp(3rem, 8vw, 6rem)', 
              fontWeight: 900, 
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              background: 'linear-gradient(to bottom, #fff, #95a5a6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(255,255,255,0.1)'
            }}>
              空の境界
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              fontStyle: 'italic', 
              fontFamily: '"Times New Roman", serif',
              color: '#c0392b',
              marginTop: '0'
            }}>
              the Garden of sinners
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{ position: 'absolute', bottom: '10%', fontSize: '2rem', color: '#c0392b', animation: 'pulse 2s infinite' }}
          >
            ↓
          </motion.div>
        </header>

        {/* Chapter List */}
        <div style={{ paddingBottom: '10vh' }}>
          {KNK_CHAPTERS.map((item, index) => (
            <ChapterItem 
              key={item.id} 
              item={item} 
              index={index} 
              isActive={activeId === item.id}
              onClick={() => setActiveId(activeId === item.id ? null : item.id)}
            />
          ))}
        </div>

      </div>
      
      {/* 底部装饰 */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '4rem', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#555',
        fontSize: '0.8rem',
        letterSpacing: '0.1em'
      }}>
        © STUDIO-MISAKI · YOUR AI STUDIO
      </footer>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(10px); }
          100% { opacity: 0.3; transform: translateY(0); }
        }
        ::selection {
          background: #c0392b;
          color: #fff;
        }
      `}</style>
    </div>
  );
};

// 单个章节组件
const ChapterItem: React.FC<{ 
  item: GalleryItem; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
}> = ({ item, index, isActive, onClick }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: isEven ? 'row' : 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '2rem',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      {/* 背景文字装饰 (水印) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '20vw',
        fontWeight: 900,
        color: 'rgba(255,255,255,0.02)',
        zIndex: 0,
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}>
        {item.subTitle.split(' ')[0]}
      </div>

      {/* 图片区域 */}
      <div style={{ 
        flex: 1, 
        height: '60vh',
        position: 'relative',
        zIndex: 1,
        margin: '0 2rem',
        maxWidth: '800px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '100%', height: '100%',
          overflow: 'hidden',
          border: isActive ? `1px solid ${item.color}` : '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.5s ease',
          boxShadow: isActive ? `0 0 30px ${item.color}40` : 'none'
        }}>
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 2, transition: 'opacity 0.5s',
            opacity: isActive ? 0 : 0.3
          }} />
          <motion.img 
            src={item.src} 
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isActive ? 'grayscale(0%)' : 'grayscale(80%) contrast(1.2)', transition: 'filter 0.5s ease' }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7 }}
          />
          
          {/* 直死之魔眼 线条效果 */}
          {isActive && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                position: 'absolute', top: '50%', left: 0, height: '1px',
                background: '#c0392b',
                boxShadow: '0 0 10px #c0392b',
                zIndex: 10,
                transform: 'rotate(-5deg)'
              }}
            />
          )}
        </div>
      </div>

      {/* 文字区域 */}
      <div style={{ 
        flex: 1, 
        zIndex: 2,
        textAlign: isEven ? 'left' : 'right',
        maxWidth: '600px',
        padding: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.2rem', 
          color: item.color, 
          marginBottom: '0.5rem',
          letterSpacing: '0.2em'
        }}>
          {item.chapter}
        </h3>
        <h2 style={{ 
          fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
          fontWeight: 700, 
          margin: '0 0 1rem 0',
          lineHeight: 1.1,
          textShadow: '0 0 10px rgba(0,0,0,0.8)'
        }}>
          {item.title}
        </h2>
        <h4 style={{ 
          fontSize: '1.5rem', 
          fontFamily: '"Times New Roman", serif', 
          fontStyle: 'italic', 
          color: '#7f8c8d',
          marginBottom: '2rem'
        }}>
          {item.subTitle}
        </h4>
        
        <div style={{ 
          width: '50px', 
          height: '2px', 
          background: item.color, 
          margin: isEven ? '0 0 2rem 0' : '0 0 2rem auto'
        }} />

        <p style={{ 
          fontSize: '1.1rem', 
          lineHeight: 1.8, 
          color: '#bdc3c7', 
          marginBottom: '2rem',
          maxWidth: '400px',
          marginLeft: isEven ? 0 : 'auto'
        }}>
          {item.desc}
        </p>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ 
              padding: '1.5rem', 
              borderLeft: isEven ? `2px solid ${item.color}` : 'none',
              borderRight: !isEven ? `2px solid ${item.color}` : 'none',
              background: 'rgba(255,255,255,0.03)'
            }}
          >
            <p style={{ 
              fontSize: '1.2rem', 
              fontFamily: '"Noto Serif SC", serif',
              fontStyle: 'italic',
              margin: 0,
              color: '#fff' 
            }}>
              {item.quote}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Gallery;