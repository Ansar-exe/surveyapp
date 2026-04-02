import { createContext, useContext, useState, useCallback } from 'react';

const WindowCtx = createContext(null);

export function useWindow() {
  return useContext(WindowCtx);
}

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([
    { id: 'surveys', props: {}, minimized: false, zIndex: 1, spawnX: 90, spawnY: 10 },
  ]);
  const [zTop, setZTop] = useState(2);

  const openWindow = useCallback((id, props = {}) => {
    setZTop(prev => {
      const newZ = prev + 1;
      setWindows(ws => {
        const exists = ws.find(w => w.id === id);
        if (exists) {
          return ws.map(w => w.id === id ? { ...w, minimized: false, zIndex: newZ } : w);
        }
        const spawnX = 90 + (ws.length % 6) * 30;
        const spawnY = 10 + (ws.length % 5) * 30;
        return [...ws, { id, props, minimized: false, zIndex: newZ, spawnX, spawnY }];
      });
      return newZ;
    });
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows(ws => ws.filter(w => w.id !== id));
  }, []);

  const focusWindow = useCallback((id) => {
    setZTop(prev => {
      const newZ = prev + 1;
      setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: false, zIndex: newZ } : w));
      return newZ;
    });
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true } : w));
  }, []);

  return (
    <WindowCtx.Provider value={{ windows, openWindow, closeWindow, focusWindow, minimizeWindow }}>
      {children}
    </WindowCtx.Provider>
  );
}
