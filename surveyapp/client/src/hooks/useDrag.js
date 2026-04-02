import { useState, useRef, useCallback } from 'react';

export default function useDrag(initialPos = { x: 0, y: 0 }) {
  const [pos, setPos] = useState(initialPos);
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, wx: 0, wy: 0 });

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, wx: pos.x, wy: pos.y };

    function onMove(e) {
      if (!dragging.current) return;
      setPos({
        x: start.current.wx + e.clientX - start.current.mx,
        y: start.current.wy + e.clientY - start.current.my,
      });
    }
    function onUp() {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [pos]);

  return { pos, onMouseDown, setPos };
}
