'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ComposeWindow {
  id: string;
  position: { x: number; y: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface ComposeContextType {
  windows: ComposeWindow[];
  addWindow: () => void;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<ComposeWindow>) => void;
  bringToFront: (id: string) => void;
  canAddWindow: boolean;
}

const ComposeContext = createContext<ComposeContextType | null>(null);

const MAX_WINDOWS = 5;
const INITIAL_POSITION = { x: 20, y: 20 };
const WINDOW_OFFSET = 30;

export function ComposeProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<ComposeWindow[]>([]);

  const canAddWindow = windows.length < MAX_WINDOWS;

  const addWindow = useCallback(() => {
    if (!canAddWindow) return;

    const newWindow: ComposeWindow = {
      id: Math.random().toString(36).slice(2),
      position: {
        x: INITIAL_POSITION.x + (windows.length * WINDOW_OFFSET),
        y: INITIAL_POSITION.y + (windows.length * WINDOW_OFFSET),
      },
      isMinimized: false,
      isMaximized: false,
      zIndex: windows.length,
    };

    setWindows((prev) => [...prev, newWindow]);
  }, [windows.length, canAddWindow]);

  const removeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWindow = useCallback((id: string, updates: Partial<ComposeWindow>) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      return prev.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
    });
  }, []);

  return (
    <ComposeContext.Provider
      value={{
        windows,
        addWindow,
        removeWindow,
        updateWindow,
        bringToFront,
        canAddWindow,
      }}
    >
      {children}
    </ComposeContext.Provider>
  );
}

export function useCompose() {
  const context = useContext(ComposeContext);
  if (!context) {
    throw new Error('useCompose must be used within a ComposeProvider');
  }
  return context;
} 