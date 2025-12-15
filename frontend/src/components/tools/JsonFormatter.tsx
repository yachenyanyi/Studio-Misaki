import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError('无效的JSON');
      setOutput('');
    }
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  return (
    <div style={{ paddingTop: 'calc(var(--header-height) + 2rem)', paddingBottom: '2rem', background: 'var(--bg-body)' }}>
      <div id="content" className="site-content">
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-main)' }}>JSON格式化工具</h1>
                <p style={{ color: 'var(--text-sub)' }}>美化、验证和压缩JSON数据</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', height: '600px' }}>
                {/* Input Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 500 }}>输入JSON</label>
                        <button onClick={clear} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <i className="fa fa-trash"></i> 清空
                        </button>
                    </div>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="在此粘贴JSON..."
                        style={{ 
                            flex: 1, 
                            padding: '1rem', 
                            borderRadius: '0.5rem', 
                            border: `2px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none'
                        }}
                    />
                    {error && <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</p>}
                </div>

                {/* Output Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 500 }}>格式化输出</label>
                        <button 
                            onClick={() => { navigator.clipboard.writeText(output); alert('已复制！'); }}
                            disabled={!output}
                            style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', opacity: output ? 1 : 0.5 }}
                        >
                            <i className="fa fa-copy"></i> 复制
                        </button>
                    </div>
                    <textarea 
                        value={output}
                        readOnly
                        placeholder="结果将显示在这里..."
                        style={{ 
                            flex: 1, 
                            padding: '1rem', 
                            borderRadius: '0.5rem', 
                            border: '2px solid #e2e8f0',
                            background: '#f8fafc',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            resize: 'none',
                            outline: 'none',
                            color: '#334155'
                        }}
                    />
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button 
                    onClick={formatJson}
                    className="comic-btn"
                    style={{ 
                        background: 'var(--primary-color)', 
                        color: 'white', 
                        padding: '1rem 3rem',
                        fontSize: '1.1rem'
                    }}
                >
                    <i className="fa fa-magic"></i> 格式化JSON
                </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JsonFormatter;
