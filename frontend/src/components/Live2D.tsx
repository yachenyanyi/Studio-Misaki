import React, { useEffect } from 'react';

declare global {
  interface Window {
    initWidget: (config: any) => void;
  }
}

const Live2D: React.FC = () => {
  useEffect(() => {
    // Check if the script is already loaded
    if (document.getElementById('live2d-widget-script')) {
      return;
    }

    const loadWidget = async () => {
      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/waifu.css';
      document.head.appendChild(link);

      // Load JS
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'live2d-widget-script';
        script.src = 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/waifu-tips.js';
        script.type = 'module';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });

      // Initialize
      if (window.initWidget) {
        window.initWidget({
          waifuPath: 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/waifu-tips.json',
          cdnPath: 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/',
          cubism2Path: 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/live2d.min.js',
          cubism5Path: 'https://fastly.jsdelivr.net/npm/live2d-widgets@1.0.0/dist/live2dcubismcore.min.js',
          tools: ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit'],
          logLevel: 'warn',
          drag: false,
        });
      } else {
        console.error('initWidget is not defined.');
      }
    };

    loadWidget();

    // 等待脚本加载完成后，调整 Live2D 元素的 z-index
    const checkAndAdjustZIndex = () => {
      // 库生成的容器通常具有 'waifu' 类名
      const live2dContainer = document.querySelector('.waifu');
      if (live2dContainer) {
        (live2dContainer as HTMLElement).style.zIndex = '2147483647'; // 设置最高层级
        (live2dContainer as HTMLElement).style.position = 'fixed'; // 确保固定定位
        // 同时也尝试设置 canvas 的 z-index，以防万一
        const canvas = document.querySelector('#live2d');
        if (canvas) {
           (canvas as HTMLElement).style.zIndex = '2147483647';
        }
        console.log('Live2D layer adjusted');
        clearInterval(checkInterval);
      }
    };

    // 每 500ms 检查一次，最多检查 10 次
    const checkInterval = setInterval(checkAndAdjustZIndex, 500);
    setTimeout(() => clearInterval(checkInterval), 5000); // 5 秒后停止检查

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  return null; // The widget renders itself into the DOM directly
};

export default Live2D;