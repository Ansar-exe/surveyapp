import { useState, useEffect } from 'react';

export default function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    'Initializing hardware...',
    'Loading SurveyPro 98...',
    'Starting Windows subsystem...',
    'Connecting to network...',
    'Ready.',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 12 + 4;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onDone, 600);
          return 100;
        }
        setPhase(Math.floor(next / 22));
        return next;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, fontFamily: 'monospace',
    }}>
      <div style={{ color: '#ccc', fontSize: 13, marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 8, fontFamily: 'Arial' }}>
          🪟 SurveyPro 98
        </div>
        <div style={{ color: '#888' }}>Starting Windows 98...</div>
      </div>

      <div style={{ width: 300 }}>
        <div style={{
          border: '2px solid #555', height: 20, background: '#111',
          overflow: 'hidden', marginBottom: 12,
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'repeating-linear-gradient(90deg, #000080 0, #000080 10px, #1084d0 10px, #1084d0 12px)',
            transition: 'width 0.1s',
          }} />
        </div>
        <div style={{ color: '#aaa', fontSize: 11, textAlign: 'center' }}>
          {phases[Math.min(phase, phases.length - 1)]}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 20, color: '#333', fontSize: 11 }}>
        Copyright © 1998–2025 SurveyPro Inc.
      </div>
    </div>
  );
}
