import { useState } from 'react';

export default function DesktopIcon({ icon, label, onClick }) {
  const [selected, setSelected] = useState(false);

  function handleClick() {
    setSelected(true);
    setTimeout(() => setSelected(false), 300);
  }

  function handleDoubleClick() {
    onClick && onClick();
  }

  return (
    <div
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: 72, padding: '6px 4px', cursor: 'default',
        userSelect: 'none',
      }}
    >
      <div style={{
        fontSize: 36, marginBottom: 4, lineHeight: 1,
        filter: selected ? 'brightness(0.7)' : 'none',
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 11, color: '#fff', textAlign: 'center',
        textShadow: '1px 1px 2px #000, -1px -1px 2px #000',
        background: selected ? '#000080' : 'transparent',
        padding: '1px 3px',
        wordBreak: 'break-word',
        lineHeight: 1.3,
      }}>
        {label}
      </div>
    </div>
  );
}
