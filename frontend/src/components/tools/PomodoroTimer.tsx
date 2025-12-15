import React, { useState, useEffect } from 'react';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          alert("时间到！");
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem', paddingTop: 'calc(var(--header-height) + 4rem)', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '2rem' }}>番茄时钟</h2>
      <div style={{ fontSize: '6rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--primary-color)', marginBottom: '2rem' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          onClick={toggleTimer}
          className="comic-btn"
          style={{ padding: '1rem 3rem', background: isActive ? '#ef4444' : '#10b981', color: 'white', fontSize: '1.2rem' }}
        >
          {isActive ? '暂停' : '开始'}
        </button>
        <button 
          onClick={resetTimer}
          className="comic-btn"
          style={{ padding: '1rem 3rem', background: '#6b7280', color: 'white', fontSize: '1.2rem' }}
        >
          重置
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
