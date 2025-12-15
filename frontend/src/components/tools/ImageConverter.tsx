import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Types
interface ProcessedFile {
  id: string;
  originalFile: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  processedBlob?: Blob;
  outputName?: string;
  sizeDiff?: number; // bytes diff
  processTime?: number; // ms
}

interface ImageSettings {
  format: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/bmp';
  quality: number; // 0-1
  width: number | null; // null means original
  height: number | null;
  scale: number; // 1 means 100%
  rotate: number; // degrees
  flipX: boolean;
  flipY: boolean;
  brightness: number; // 100 is default
  contrast: number; // 100 is default
  saturation: number; // 100 is default
  crop: { x: number; y: number; width: number; height: number } | null;
}

const ImageConverter: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [settings, setSettings] = useState<ImageSettings>({
    format: 'image/jpeg',
    quality: 0.9,
    width: null,
    height: null,
    scale: 1,
    rotate: 0,
    flipX: false,
    flipY: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    crop: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load settings from local storage
  useEffect(() => {
    const saved = localStorage.getItem('image-converter-settings');
    if (saved) {
        try {
            setSettings({ ...JSON.parse(saved), crop: null });
        } catch (e) {}
    }
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem('image-converter-settings', JSON.stringify(settings));
  }, [settings]);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const processedFiles: ProcessedFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...processedFiles]);
  };

  // Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Image Processing Logic (Canvas)
  const processImage = async (fileItem: ProcessedFile): Promise<ProcessedFile> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const img = new Image();
      img.src = fileItem.previewUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            resolve({ ...fileItem, status: 'error' });
            return;
        }

        // 1. Calculate Dimensions (Resize/Scale)
        let targetWidth = img.width;
        let targetHeight = img.height;

        if (settings.width && settings.height) {
            targetWidth = settings.width;
            targetHeight = settings.height;
        } else if (settings.scale !== 1) {
            targetWidth = img.width * settings.scale;
            targetHeight = img.height * settings.scale;
        }

        // 2. Handle Rotation Dimensions
        // If rotated 90 or 270, swap width/height
        const isRotated90 = Math.abs(settings.rotate % 180) === 90;
        canvas.width = isRotated90 ? targetHeight : targetWidth;
        canvas.height = isRotated90 ? targetWidth : targetHeight;

        // 3. Draw & Transform
        ctx.save();
        
        // Filters
        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;

        // Translate to center for rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((settings.rotate * Math.PI) / 180);
        ctx.scale(settings.flipX ? -1 : 1, settings.flipY ? -1 : 1);
        
        // Draw Image (centered)
        ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
        
        ctx.restore();

        // 4. Export
        // Note: 'image/bmp' might not be supported by toBlob in all browsers, 
        // fallback usually png/jpeg. For robust BMP, we'd need a library. 
        // We'll trust browser implementation or fallback.
        let mimeType = settings.format;
        if (mimeType === 'image/bmp' && !canvas.toDataURL('image/bmp').startsWith('data:image/bmp')) {
             // Fallback or simple warning? For now let's assume standard formats work.
        }

        canvas.toBlob((blob) => {
          const endTime = performance.now();
          if (blob) {
            resolve({
              ...fileItem,
              status: 'done',
              processedBlob: blob,
              sizeDiff: blob.size - fileItem.originalFile.size,
              processTime: endTime - startTime,
              outputName: fileItem.originalFile.name.replace(/\.[^/.]+$/, "") + getExtension(settings.format)
            });
          } else {
            resolve({ ...fileItem, status: 'error' });
          }
        }, mimeType, settings.quality);
      };
      img.onerror = () => {
        resolve({ ...fileItem, status: 'error' });
      };
    });
  };

  const getExtension = (mime: string) => {
    switch (mime) {
      case 'image/jpeg': return '.jpg';
      case 'image/png': return '.png';
      case 'image/webp': return '.webp';
      case 'image/bmp': return '.bmp';
      default: return '.jpg';
    }
  };

  const filesRef = useRef<ProcessedFile[]>([]);
  filesRef.current = files;

  useEffect(() => {
    return () => {
      filesRef.current.forEach(file => {
        URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, []);

  const handleProcessAll = async () => {
    setIsProcessing(true);
    const newFiles = [...files];
    
    // Process sequentially to avoid memory spikes and UI freezing
    let totalTime = 0;
    let processedCount = 0;

    for (let i = 0; i < newFiles.length; i++) {
        if (newFiles[i].status !== 'done') {
            // Update status to processing
            newFiles[i] = { ...newFiles[i], status: 'processing' };
            setFiles([...newFiles]);
            
            // Allow UI to update
            await new Promise(r => setTimeout(r, 20));

            const start = performance.now();
            const result = await processImage(newFiles[i]);
            const end = performance.now();
            
            newFiles[i] = result;
            setFiles([...newFiles]);

            // Estimate remaining time
            processedCount++;
            totalTime += (end - start);
            const avgTime = totalTime / processedCount;
            const remaining = newFiles.length - (i + 1); // approximate
            // Count pending
            const pending = newFiles.filter((f, idx) => idx > i && f.status !== 'done').length;
            setEstimatedTime(pending * avgTime);
        }
    }
    setIsProcessing(false);
    setEstimatedTime(null);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    let count = 0;
    files.forEach(file => {
      if (file.status === 'done' && file.processedBlob) {
        zip.file(file.outputName || 'image', file.processedBlob);
        count++;
      }
    });

    if (count === 0) return;

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'converted_images.zip');
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '3rem', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <div className="site-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>图片转换器专业版</h1>
          <p style={{ color: 'var(--text-sub)' }}>在浏览器中转换、调整大小和优化您的图片</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
          
          {/* Settings Panel */}
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '6rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>设置</h3>
            
            {/* Format */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>输出格式</label>
              <select 
                value={settings.format}
                onChange={(e) => setSettings({...settings, format: e.target.value as any})}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/bmp">BMP</option>
              </select>
            </div>

            {/* Quality */}
            {(settings.format === 'image/jpeg' || settings.format === 'image/webp') && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quality: {Math.round(settings.quality * 100)}%</label>
                <input 
                  type="range" min="0.1" max="1" step="0.05"
                  value={settings.quality}
                  onChange={(e) => setSettings({...settings, quality: parseFloat(e.target.value)})}
                  style={{ width: '100%' }}
                />
              </div>
            )}
            
            {/* EXIF Placeholder */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'not-allowed', opacity: 0.6 }}>
                    <input type="checkbox" disabled /> 
                    <span>保留EXIF数据</span>
                </label>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>当前Canvas实现会移除EXIF。</div>
            </div>

            {/* Resize */}
            <div style={{ marginBottom: '1.5rem' }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>调整大小（缩放）</label>
               <input 
                  type="range" min="0.1" max="2" step="0.1"
                  value={settings.scale}
                  onChange={(e) => setSettings({...settings, scale: parseFloat(e.target.value), width: null, height: null})}
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-sub)' }}>{Math.round(settings.scale * 100)}%</div>
            </div>

            {/* Rotate */}
            <div style={{ marginBottom: '1.5rem' }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>旋转</label>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button onClick={() => setSettings(s => ({...s, rotate: (s.rotate - 90) % 360}))} style={btnStyle}><i className="fa fa-undo"></i></button>
                 <button onClick={() => setSettings(s => ({...s, rotate: 0}))} style={btnStyle}>{settings.rotate}°</button>
                 <button onClick={() => setSettings(s => ({...s, rotate: (s.rotate + 90) % 360}))} style={btnStyle}><i className="fa fa-redo"></i></button>
               </div>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '1rem' }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>调整</label>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>亮度</span>
                    <span>{settings.brightness}%</span>
                 </div>
                 <input type="range" min="0" max="200" value={settings.brightness} onChange={e => setSettings({...settings, brightness: parseInt(e.target.value)})} />
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>对比度</span>
                    <span>{settings.contrast}%</span>
                 </div>
                 <input type="range" min="0" max="200" value={settings.contrast} onChange={e => setSettings({...settings, contrast: parseInt(e.target.value)})} />
               </div>
            </div>

            <button 
              onClick={handleProcessAll}
              disabled={files.length === 0 || isProcessing}
              className="comic-btn"
              style={{ width: '100%', padding: '0.8rem', background: 'var(--primary-color)', color: 'white', marginTop: '1rem' }}
            >
              {isProcessing ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-cog"></i>} 处理全部
            </button>
            
            {estimatedTime !== null && (
                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    预计剩余时间: {(estimatedTime / 1000).toFixed(1)}秒
                </div>
            )}
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Drop Zone */}
            <div 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: '3px dashed #cbd5e1', 
                borderRadius: '1rem', 
                padding: '3rem', 
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f8fafc',
                transition: 'all 0.2s'
              }}
            >
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              <i className="fa fa-cloud-upload-alt" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '1rem' }}></i>
              <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-main)' }}>拖拽图片到这里</p>
              <p style={{ color: 'var(--text-sub)' }}>或点击浏览文件</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div style={{ background: 'var(--bg-card)', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>文件 ({files.length})</h3>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setFiles([])} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>清空全部</button>
                    <button onClick={handleDownloadAll} disabled={files.filter(f => f.status === 'done').length === 0} style={{ color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        <i className="fa fa-download"></i> 下载压缩包
                    </button>
                  </div>
                </div>

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {files.map(file => (
                    <motion.div 
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        padding: '1rem', 
                        background: '#f8fafc', 
                        borderRadius: '0.5rem',
                        alignItems: 'center',
                        border: file.status === 'done' ? '1px solid #10b981' : '1px solid #e2e8f0'
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={file.previewUrl} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 500 }}>{file.originalFile.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{formatSize(file.originalFile.size)}</span>
                        </div>
                        
                        {file.status === 'pending' && <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>就绪</span>}
                        {file.status === 'processing' && <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}><i className="fa fa-spinner fa-spin"></i> 处理中...</span>}
                        {file.status === 'done' && (
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', alignItems: 'center' }}>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>完成 ({file.processTime?.toFixed(0)}ms)</span>
                                <span style={{ color: file.sizeDiff && file.sizeDiff < 0 ? '#10b981' : '#ef4444' }}>
                                    {file.sizeDiff && file.sizeDiff > 0 ? '+' : ''}{formatSize(file.sizeDiff || 0)}
                                </span>
                                {file.processedBlob && (
                                    <span style={{ color: 'var(--text-sub)' }}>输出: {formatSize(file.processedBlob.size)}</span>
                                )}
                            </div>
                        )}
                        {file.status === 'error' && <span style={{ color: '#ef4444' }}>处理图片时出错</span>}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {file.status === 'done' && file.processedBlob && (
                             <a 
                               href={URL.createObjectURL(file.processedBlob)} 
                               download={file.outputName}
                               className="comic-btn"
                               style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary-color)', color: 'white', textDecoration: 'none', textAlign: 'center' }}
                             >
                                <i className="fa fa-download"></i>
                             </a>
                        )}
                        <button onClick={() => removeFile(file.id)} style={{ padding: '0.4rem', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '4px', background: 'none', cursor: 'pointer' }}>
                            <i className="fa fa-trash"></i>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const btnStyle = {
    padding: '0.5rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: 'white',
    cursor: 'pointer',
    color: 'var(--text-main)'
};

export default ImageConverter;
