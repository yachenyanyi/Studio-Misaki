import React, { useState } from 'react';

const Base64Converter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (e) {
      setOutput('错误：无效的解码输入');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', paddingTop: 'calc(var(--header-height) + 2rem)' }}>
      <h2 style={{ marginBottom: '2rem' }}>Base64转换器</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ marginRight: '1rem' }}>
          <input type="radio" checked={mode === 'encode'} onChange={() => setMode('encode')} /> 编码
        </label>
        <label>
          <input type="radio" checked={mode === 'decode'} onChange={() => setMode('decode')} /> 解码
        </label>
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encode' ? "输入要编码的文本..." : "输入要解码的Base64..."}
        style={{ width: '100%', height: '150px', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
      />
      <button 
        onClick={handleConvert}
        className="comic-btn"
        style={{ padding: '0.8rem 2rem', background: 'var(--primary-color)', color: 'white', marginBottom: '1rem' }}
      >
        转换
      </button>
      <textarea
        readOnly
        value={output}
        placeholder="转换结果将显示在这里..."
        style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc', background: '#f9f9f9' }}
      />
    </div>
  );
};

export default Base64Converter;
