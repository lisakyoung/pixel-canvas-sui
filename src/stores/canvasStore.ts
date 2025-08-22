import { create } from 'zustand';
import { Canvas, Pixel } from '@/lib/types';

interface CanvasStore {
  canvases: Canvas[];
  currentCanvas: Canvas | null;
  selectedColor: string;
  pendingPixels: Pixel[];
  history: Pixel[][];
  historyIndex: number;
  
  setCanvases: (canvases: Canvas[]) => void;
  setCurrentCanvas: (canvas: Canvas | null) => void;
  setSelectedColor: (color: string) => void;
  addPendingPixel: (pixel: Pixel) => void;
  clearPendingPixels: () => void;
  undo: () => void;
  redo: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  canvases: [],
  currentCanvas: null,
  selectedColor: '#FF0000',
  pendingPixels: [],
  history: [[]],
  historyIndex: 0,
  
  setCanvases: (canvases) => set({ canvases }),
  
  setCurrentCanvas: (canvas) => set({ currentCanvas: canvas }),
  
  setSelectedColor: (color) => set({ selectedColor: color }),
  
  addPendingPixel: (pixel) => set((state) => ({
    pendingPixels: [...state.pendingPixels, pixel],
  })),
  
  clearPendingPixels: () => set({ pendingPixels: [] }),
  
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      set({
        historyIndex: historyIndex - 1,
        pendingPixels: history[historyIndex - 1],
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({
        historyIndex: historyIndex + 1,
        pendingPixels: history[historyIndex + 1],
      });
    }
  },
}));