import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { motion } from 'framer-motion';
import { saveAs } from 'file-saver';

// Define mixing styles
const MIX_STYLES = [
  { id: 'normal', name: '重叠 (Overlay)', op: 'source-over' },
  { id: 'multiply', name: '正片叠底 (Multiply)', op: 'multiply' },
  { id: 'screen', name: '滤色 (Screen)', op: 'screen' },
  { id: 'overlay', name: '叠加 (Overlay Blend)', op: 'overlay' },
  { id: 'darken', name: '变暗 (Darken)', op: 'darken' },
  { id: 'lighten', name: '变亮 (Lighten)', op: 'lighten' },
  { id: 'color-dodge', name: '颜色减淡 (Color Dodge)', op: 'color-dodge' },
  { id: 'color-burn', name: '颜色加深 (Color Burn)', op: 'color-burn' },
  { id: 'difference', name: '差值 (Difference)', op: 'difference' },
  { id: 'exclusion', name: '排除 (Exclusion)', op: 'exclusion' },
  { id: 'hue', name: '色相 (Hue)', op: 'hue' },
  { id: 'saturation', name: '饱和度 (Saturation)', op: 'saturation' },
  { id: 'color', name: '颜色 (Color)', op: 'color' },
  { id: 'luminosity', name: '明度 (Luminosity)', op: 'luminosity' }
];

const EmojiMix: React.FC = () => {
  const [emoji1, setEmoji1] = useState<EmojiClickData | null>(null);
  const [emoji2, setEmoji2] = useState<EmojiClickData | null>(null);
  const [activePicker, setActivePicker] = useState<1 | 2>(1);
  const [mixStyle, setMixStyle] = useState(MIX_STYLES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [googleMixUrl, setGoogleMixUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set default emojis on load
  useEffect(() => {
    // We can't easily trigger the picker click, but we can set initial state if needed
    // or just leave them empty waiting for user input
  }, []);

  useEffect(() => {
    if (emoji1 && emoji2) {
      generateMix();
    }
  }, [emoji1, emoji2, mixStyle]);

  const generateMix = async () => {
    if (!emoji1 || !emoji2 || !canvasRef.current) return;

    setIsGenerating(true);
    
    // Try Google Emoji Kitchen first (only if style is normal, or maybe always prioritize?)
    // User probably expects Google Mix if available.
    // We'll prioritize Google Mix unless user specifically chose a style that implies "custom mixing"
    // But currently styles are only applied in canvas. 
    // Let's say if style is 'normal', we try Google. If user selects 'multiply', they want custom.
    // However, to "enhance" with emoji-mixer, usually means showing the high quality one.
    // Let's try Google Mix first. If found, we use it. 
    // BUT if the user explicitly changes the mix style, maybe they WANT the canvas effect?
    // Let's stick to: Try Google Mix. If found, use it. 
    // If user changes style, we might need to force canvas? 
    // For now, let's keep it simple: Try Google Mix first.
    
    setGoogleMixUrl(null);
    
    try {
        // Only try google mix if we are in 'normal' mode or if we treat google mix as the best "normal"
        // If user selected a specific blend mode, they might want that specific effect.
        // But Google Mixes are unique art, not just blends.
        // Let's assume if Google Mix exists, it's better than any canvas blend.
        const { default: getEmojiMixUrl } = await import('emoji-mixer');
        const url = getEmojiMixUrl(emoji1.emoji, emoji2.emoji);
        if (url) {
            setGoogleMixUrl(url);
            setPreviewUrl(url);
            setIsGenerating(false);
            return;
        }
    } catch (e) {
        // Fallback to canvas
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Performance: Ensure async operations don't block UI
    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const size = 256;
      canvas.width = size;
      canvas.height = size;

      // Draw Function
      const drawEmoji = (emoji: EmojiClickData, isBackground: boolean) => {
        return new Promise<void>((resolve) => {
            // Since we can't easily get the image URL from the picker data reliably without external service,
            // we will render the emoji as TEXT. This is the most robust "pure frontend" way.
            // However, different systems render emojis differently.
            // To make it look good, we center it.
            
            ctx.font = `${size * 0.8}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Apply style for the second emoji
            if (!isBackground) {
               const style = MIX_STYLES.find(s => s.id === mixStyle);
               if (style) {
                   ctx.globalCompositeOperation = style.op as GlobalCompositeOperation;
               }
               
               // Special transformation for variety
               // If it's the second emoji, maybe scale it slightly differently or flip it
               // to create more interesting "mixes" rather than just exact overlay
               ctx.save();
               ctx.translate(size/2, size/2);
               // Add a subtle scale/rotate for the top layer to make it look more like a "mix"
               ctx.scale(0.9, 0.9); 
               ctx.fillText(emoji.emoji, 0, size * 0.05); // slight offset
               ctx.restore();
            } else {
               ctx.globalCompositeOperation = 'source-over';
               ctx.fillText(emoji.emoji, size/2, size/2 + size * 0.05);
            }
            
            resolve();
        });
      };

      // Draw Bottom Layer
      await drawEmoji(emoji1, true);
      
      // Draw Top Layer
      await drawEmoji(emoji2, false);

      // Generate Preview
      const url = canvas.toDataURL('image/png');
      setPreviewUrl(url);

    } catch (err) {
      console.error("Mix generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (googleMixUrl) {
        try {
            const response = await fetch(googleMixUrl);
            const blob = await response.blob();
            saveAs(blob, `emojimix_${emoji1?.names[0]}_${emoji2?.names[0]}.png`);
        } catch (e) {
            console.error("Download failed", e);
        }
        return;
    }

    if (previewUrl && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `emojimix_${emoji1?.names[0]}_${emoji2?.names[0]}.png`);
        }
      });
    }
  };

  const handleEmojiClick = (data: EmojiClickData) => {
    if (activePicker === 1) {
      setEmoji1(data);
      // 自动跳转到第二个选择框，如果它还是空的
      if (!emoji2) {
        setActivePicker(2);
      }
    } else {
      setEmoji2(data);
    }
  };



  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '3rem', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <div className="site-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>Emoji Mix 创意工坊</h1>
          <p style={{ color: 'var(--text-sub)' }}>选择两个表情，混合出无限可能</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          {/* Left Side: Pickers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             {/* Selection Display */}
             <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', alignItems: 'center' }}>
                <div 
                    onClick={() => setActivePicker(1)}
                    style={{ 
                        width: '100px', height: '100px', 
                        borderRadius: '1rem', 
                        border: activePicker === 1 ? '3px solid var(--primary-color)' : '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem',
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        boxShadow: activePicker === 1 ? 'var(--shadow-md)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {emoji1 ? emoji1.emoji : <span style={{fontSize: '2rem', opacity: 0.3}}>1</span>}
                </div>
                
                <i className="fa fa-plus" style={{ fontSize: '1.5rem', color: 'var(--text-sub)' }}></i>
                
                <div 
                    onClick={() => setActivePicker(2)}
                    style={{ 
                        width: '100px', height: '100px', 
                        borderRadius: '1rem', 
                        border: activePicker === 2 ? '3px solid var(--primary-color)' : '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '4rem',
                        cursor: 'pointer',
                        background: 'var(--bg-card)',
                        boxShadow: activePicker === 2 ? 'var(--shadow-md)' : 'none',
                        transition: 'all 0.2s'
                    }}
                >
                    {emoji2 ? emoji2.emoji : <span style={{fontSize: '2rem', opacity: 0.3}}>2</span>}
                </div>
             </div>

             {/* The Picker */}
             <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                 <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                     <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                        选择第 {activePicker} 个表情
                     </h3>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                     <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        autoFocusSearch={false}
                        width="100%"
                        height={400}
                        previewConfig={{ showPreview: false }}
                     />
                 </div>
             </div>
          </div>

          {/* Right Side: Preview & Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Preview Card */}
              <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '6rem' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>混合预览</h3>
                  
                  <div style={{ 
                      width: '100%', aspectRatio: '1/1', 
                      background: '#f8fafc', 
                      borderRadius: '1rem', 
                      border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '1.5rem',
                      position: 'relative',
                      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                  }}>
                      {/* Hidden Canvas for Processing */}
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                      
                      {googleMixUrl && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.7rem', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}>
                              <i className="fab fa-google"></i> Emoji Kitchen
                          </div>
                      )}

                      {previewUrl ? (
                          <motion.img 
                            key={previewUrl}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={previewUrl} 
                            alt="Mix Result" 
                            style={{ width: '80%', height: '80%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                          />
                      ) : (
                          <div style={{ color: 'var(--text-sub)', textAlign: 'center' }}>
                              <i className="fa fa-flask" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}></i>
                              <p>选择两个表情开始混合</p>
                          </div>
                      )}
                      
                      {isGenerating && (
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '1rem' }}>
                              <i className="fa fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                          </div>
                      )}
                  </div>

                  {/* Controls */}
                  <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                          混合风格 {googleMixUrl && <span style={{fontSize: '0.8rem', color: 'var(--text-sub)', fontWeight: 'normal'}}>(Emoji Kitchen 不支持自定义风格)</span>}
                      </label>
                      <select 
                        value={mixStyle} 
                        onChange={(e) => setMixStyle(e.target.value)}
                        disabled={!!googleMixUrl}
                        style={{ 
                            width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', 
                            background: googleMixUrl ? '#f1f5f9' : 'white',
                            opacity: googleMixUrl ? 0.6 : 1,
                            cursor: googleMixUrl ? 'not-allowed' : 'pointer'
                        }}
                      >
                          {MIX_STYLES.map(style => (
                              <option key={style.id} value={style.id}>{style.name}</option>
                          ))}
                      </select>
                  </div>

                  <button 
                    onClick={handleDownload}
                    disabled={!previewUrl || isGenerating}
                    className="comic-btn"
                    style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        background: 'var(--primary-color)', 
                        color: 'white',
                        opacity: (!previewUrl || isGenerating) ? 0.6 : 1,
                        cursor: (!previewUrl || isGenerating) ? 'not-allowed' : 'pointer'
                    }}
                  >
                      <i className="fa fa-download"></i> 下载 PNG
                  </button>
                  
                  <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-sub)', textAlign: 'center' }}>
                      分辨率: 256x256 px | 格式: PNG
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmojiMix;
