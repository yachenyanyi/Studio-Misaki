import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 类型定义 ---
interface GalleryItem {
  id: number;
  chapter: string;
  title: string;
  subTitle: string;
  src: string;
  desc: string;
  quote: string;      // 中文台词
  quoteJp: string;    // 日文台词
  color: string;
}

// --- 数据源：完全复刻《空之境界》剧场版章节 ---
const KNK_CHAPTERS: GalleryItem[] = [
  { 
    id: 1, 
    chapter: "Ⅰ", 
    title: "俯瞰风景", 
    subTitle: "Overlooking View", 
    src: "https://www.karanokyoukai.com/archive/images/images-c1/chapterKV01.jpg",
    desc: "在俯瞰风景的尽头，少女们选择坠落。飞翔与坠落，究竟有何区别？",
    quote: "“飞翔”与“坠落”是不同的。",
    quoteJp: "「空を飛ぶ」ことと「落ちる」ことは別物だ。",
    color: "#3498db" 
  },
  { 
    id: 2, 
    chapter: "Ⅱ", 
    title: "杀人考察（前）", 
    subTitle: "Murder Speculation (Part 1)", 
    src: "https://www.karanokyoukai.com/archive/images/images-c2/chapterKV02.jpg",
    desc: "雨夜中的白衣少女，与那一抹鲜红。杀人与杀戮的界限。 ",
    quote: "“我想，我大概一辈子都无法杀掉你。”",
    quoteJp: "君を、一生殺せない気がする。",
    color: "#c0392b" 
  },
  { 
    id: 3, 
    chapter: "Ⅲ", 
    title: "痛觉残留", 
    subTitle: "Remaining Sense of Pain", 
    src: "https://www.karanokyoukai.com/archive/images/images-c3/chapterKV03.jpg",
    desc: "失去痛觉的少女，在扭曲的视界中寻找存在。能够感觉到疼痛，是因为你还活着。",
    quote: "“痛……好痛。好痛啊。”",
    quoteJp: "痛い――痛い。痛いんだ。",
    color: "#8e44ad" 
  },
  { 
    id: 4, 
    chapter: "Ⅳ", 
    title: "伽蓝之洞", 
    subTitle: "The Hollow Shrine", 
    src: "https://www.karanokyoukai.com/archive/images/images-c4/chapterKV04.jpg",
    desc: "两年的空白。觉醒的魔眼，直视万物的终结。万物皆有裂缝。",
    quote: "“只要是活着的东西，即使是神我也杀给你看。”",
    quoteJp: "生きているのなら、神様だって殺してみせる。",
    color: "#2ecc71" 
  },
  { 
    id: 5, 
    chapter: "Ⅴ", 
    title: "矛盾螺旋", 
    subTitle: "Paradox Spiral", 
    src: "https://www.karanokyoukai.com/archive/images/images-c5/chapterKV05.jpg",
    desc: "荒耶、你在寻求什么？——真正的安宁。在无限循环的螺旋中，寻找出口。",
    quote: "“所谓存在，即是与其所在的场所紧密相连。”",
    quoteJp: "在るとは、その場所にあるということだ。",
    color: "#e74c3c" 
  },
  { 
    id: 6, 
    chapter: "Ⅵ", 
    title: "忘却录音", 
    subTitle: "Oblivion Recording", 
    src: "https://www.karanokyoukai.com/archive/images/images-c6/chapterKV06.jpg",
    desc: "女子学校的妖精，被夺走的记忆。为了不忘记这份心情，我将它记录下来。",
    quote: "“记忆会被隐藏，但绝不会消失。”",
    quoteJp: "記憶は隠されることはあっても、消えることはない。",
    color: "#f1c40f" 
  },
  { 
    id: 7, 
    chapter: "Ⅶ", 
    title: "杀人考察（后）", 
    subTitle: "Murder Speculation (Part 2)", 
    src: "https://www.karanokyoukai.com/archive/images/images-c7/chapterKV07.jpg",
    desc: "长达四年的漫长冬日。你的罪孽，由我来背负。",
    quote: "“只要你还活着，我就不会放过你。”",
    quoteJp: "君が生きてる限り、僕は君を逃がさない。",
    color: "#e67e22" 
  },
  { 
    id: 8, 
    chapter: "Ⅷ", 
    title: "空之境界", 
    subTitle: "the Garden of sinners", 
    src: "https://www.karanokyoukai.com/archive/images/images-cLC/chapterKVLC.jpg",
    desc: "在空无一物的原野上，唯有雪落的声音。所谓的幸福，是指死后的余韵。",
    quote: "“就像是，做了一个很长的梦。”",
    quoteJp: "とても、長い夢を見ていた気がする。",
    color: "#ffffff" 
  }
];

const Gallery: React.FC = () => {
  const [activeId, setActiveId] = useState<number | null>(null);

  // 滚动时背景微动效果 (Parallax)
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#050505', 
      color: '#f5f5f5',
      fontFamily: '"Noto Serif SC", "Songti SC", serif', 
      overflowX: 'hidden',
      position: 'relative',
      cursor: 'default'
    }}>
      {/* 2. 背景装饰：死之线 (更加抽象和流动) */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0
      }}>
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.02, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute', top: '20%', left: '-10%', width: '120%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(192, 57, 43, 0.2), transparent)',
            transform: `rotate(15deg) translateY(${scrollY * 0.05}px)`
          }} 
        />
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], rotate: [-5, -7, -5] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute', top: '70%', left: '-10%', width: '120%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.15), transparent)',
            transform: `translateY(${scrollY * -0.05}px)`
          }} 
        />
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          >
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1.5 }}
              style={{ 
                fontSize: '1.2rem', 
                letterSpacing: '0.8em', 
                marginBottom: '1.5rem', 
                color: '#7f8c8d',
                textTransform: 'uppercase',
                fontWeight: 300
              }}
            >
              Type-Moon Aesthetic
            </motion.h2>
            <h1 className="main-title" style={{ 
              fontSize: 'clamp(3rem, 8vw, 6rem)', 
              fontWeight: 900, 
              letterSpacing: '0.15em',
              marginBottom: '1rem',
              color: '#fff',
              position: 'relative',
              textShadow: '0 0 15px rgba(255, 255, 255, 0.5)'
            }}>
              <span style={{ position: 'relative', zIndex: 2 }}>空の境界</span>
              {/* 标题发光/重影效果 */}
              <motion.span 
                animate={{ opacity: [0, 0.5, 0], x: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  position: 'absolute', top: 0, left: 0, width: '100%', 
                  color: 'rgba(192, 57, 43, 0.5)', zIndex: 1
                }}
              >
                空の境界
              </motion.span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 2 }}
              style={{ 
                fontSize: '1.5rem', 
                fontStyle: 'italic', 
                fontFamily: '"Times New Roman", serif',
                color: '#c0392b',
                marginTop: '0.5rem',
                letterSpacing: '0.05em'
              }}
            >
              the Garden of sinners
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            style={{ position: 'absolute', bottom: '10%' }}
          >
             <motion.div
               animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
               transition={{ duration: 2, repeat: Infinity }}
               style={{ fontSize: '2rem', color: '#c0392b' }}
             >
               ↓
             </motion.div>
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
        borderTop: '1px solid rgba(255,255,255,0.05)',
        color: '#555',
        fontSize: '0.8rem',
        letterSpacing: '0.2em'
      }}>
        © STUDIO-MISAKI · YOUR AI STUDIO
      </footer>

      <style>{`
        /* 全局样式增强 */
        .main-title {
          babkgraund: cineag-gradient(toobottom, und: 30%, #95a5a6 100%);
          -webkit-background-clip: text;
          -webkit-text-iill-color: transparentnear-gradient(to bottom, #fff 30%, #95a5a6 100%);
          -webkit-backgroun3-clip: text;1
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(255,255,255,0.1);
        }
        
        ::selection {
          background: #c0392b;
          color: #fff;
          text-shadow: none;
        }
        
        /* 隐藏滚动条但保留功能 (可选，视风格而定，这里暂不强制隐藏) */
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
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 1.2 }}
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
        overflow: 'hidden' // 保持原有排版不溢出
      }}
    >
      {/* 背景文字装饰 (水印) - 增加视差微动 */}
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
        whiteSpace: 'nowrap',
        fontFamily: '"Times New Roman", serif'
      }}>
        {item.subTitle.split(' ')[0]}
      </div>

      <div style={{ 
        flex: 1, 
        height: '60vh',
        position: 'relative',
        zIndex: 1,
        margin: '0 2rem',
        maxWidth: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div style={{
          position: 'relative',
          maxHeight: '100%',
          maxWidth: '100%',
          overflow: 'hidden',
          border: isActive ? `1px solid ${item.color}` : '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.5s ease',
          boxShadow: isActive ? `0 0 50px ${item.color}30` : 'none',
          background: 'rgba(0,0,0,0.2)',
          display: 'flex' // 确保容器紧贴图片
        }}>
          {/* 暗色遮罩 */}
          <div style={{
            position: 'absolute', inset: 0, background: '#000', zIndex: 2, 
            opacity: isActive ? 0 : 0.4,
            transition: 'opacity 0.5s',
            pointerEvents: 'none'
          }} />
          
          <motion.img 
            src={item.src} 
            alt={item.title}
            style={{ 
              display: 'block',
              maxHeight: '60vh', // 限制高度
              maxWidth: '100%',   // 限制宽度
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              filter: isActive ? 'grayscale(0%) contrast(1.1)' : 'grayscale(100%) contrast(1.2)', 
              transition: 'filter 0.5s ease' 
            }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 1.5 }}
          />
          
          {/* 直死之魔眼 线条效果 - 增强版 */}
          <AnimatePresence>
            {isActive && (
              <>
                {/* 主切线 */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '120%', opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    position: 'absolute', top: '50%', left: '-10%', height: '2px',
                    background: '#c0392b',
                    boxShadow: '0 0 15px #c0392b, 0 0 5px #c0392b',
                    zIndex: 10,
                    transform: 'rotate(-5deg)'
                  }}
                />
                {/* 错位效果模拟 (Glitch Overlay) */}
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0, 0.8, 0] }}
                   transition={{ duration: 0.2, delay: 0.1 }}
                   style={{
                     position: 'absolute', top: 0, left: 0, width: '100%', height: '50%',
                     background: item.color,
                     mixBlendMode: 'overlay',
                     zIndex: 5,
                     transform: 'translateX(10px)'
                   }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 文字区域 */}
      <div style={{ 
        flex: 1, 
        zIndex: 2,
        textAlign: isEven ? 'left' : 'right',
        maxWidth: '600px',
        padding: '2rem'
      }}>
        <motion.h3 
          initial={{ opacity: 0, x: isEven ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ 
            fontSize: '1.2rem', 
            color: item.color, 
            marginBottom: '0.5rem',
            letterSpacing: '0.2em'
          }}
        >
          {item.chapter}
        </motion.h3>
        
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          style={{ 
            fontSize: 'clamp(2.5rem, 4vw, 4rem)', 
            fontWeight: 700, 
            margin: '0 0 1rem 0',
            lineHeight: 1.1,
            textShadow: '0 0 20px rgba(0,0,0,0.8)'
          }}
        >
          {item.title}
        </motion.h2>

        <motion.h4 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ 
            fontSize: '1.5rem', 
            fontFamily: '"Times New Roman", serif', 
            fontStyle: 'italic', 
            color: '#7f8c8d',
            marginBottom: '2rem'
          }}
        >
          {item.subTitle}
        </motion.h4>
        
        <motion.div 
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ 
            width: '50px', 
            height: '2px', 
            background: item.color, 
            margin: isEven ? '0 0 2rem 0' : '0 0 2rem auto',
            transformOrigin: isEven ? 'left' : 'right'
          }} 
        />

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{ 
            fontSize: '1.1rem', 
            lineHeight: 1.8, 
            color: '#bdc3c7', 
            marginBottom: '2rem',
            maxWidth: '400px',
            marginLeft: isEven ? 0 : 'auto'
          }}
        >
          {item.desc}
        </motion.p>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                padding: '1.5rem', 
                borderLeft: isEven ? `2px solid ${item.color}` : 'none',
                borderRight: !isEven ? `2px solid ${item.color}` : 'none',
                background: 'linear-gradient(to right, rgba(255,255,255,0.03), transparent)'
              }}>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{ 
                    fontSize: '1.3rem', 
                    fontFamily: '"Noto Serif SC", serif',
                    fontStyle: 'italic',
                    margin: 0,
                    color: '#fff',
                    textShadow: `0 0 10px ${item.color}`
                  }}
                >
                  {item.quote}
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  style={{ 
                    fontSize: '0.9rem', 
                    marginTop: '0.5rem',
                    color: '#bdc3c7' 
                  }}
                >
                  {item.quoteJp}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Gallery;