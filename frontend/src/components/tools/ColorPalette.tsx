import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ColorPalette: React.FC = () => {
  const [colors, setColors] = useState(['#FF5733', '#33FF57', '#3357FF', '#F333FF']);

  const generateColors = () => {
    const newColors = Array(4).fill(0).map(() => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
    setColors(newColors);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', paddingTop: 'calc(var(--header-height) + 2rem)' }}>
      <h2 style={{ marginBottom: '2rem' }}>调色板生成器</h2>
      <div style={{ display: 'flex', height: '200px', borderRadius: '1rem', overflow: 'hidden', marginBottom: '2rem' }}>
        {colors.map((color, index) => (
          <div key={index} style={{ flex: 1, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: 'rgba(255,255,255,0.8)', padding: '0.5rem', borderRadius: '0.5rem', fontWeight: 'bold' }}>
              {color}
            </span>
          </div>
        ))}
      </div>
      <button 
        onClick={generateColors}
        className="comic-btn"
        style={{ padding: '1rem 2rem', background: 'var(--primary-color)', color: 'white' }}
      >
        <i className="fa fa-sync"></i> 生成新调色板
      </button>
    </div>
  );
};

export default ColorPalette;
