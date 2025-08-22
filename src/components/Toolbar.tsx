import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Eraser, Pipette, Undo, Redo, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  tool: 'pencil' | 'eraser' | 'eyedropper';
  onToolChange: (tool: 'pencil' | 'eraser' | 'eyedropper') => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function Toolbar({
  tool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: ToolbarProps) {
  const tools = [
    { id: 'pencil' as const, icon: Pencil, label: 'Paint (B)' },
    { id: 'eraser' as const, icon: Eraser, label: 'Erase (E)' },
    { id: 'eyedropper' as const, icon: Pipette, label: 'Pick Color (I)' },
  ];

  return (
    <div className="glass-panel p-3 flex items-center gap-2">
      <div className="flex gap-1">
        {tools.map((t) => (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToolChange(t.id)}
            className={cn(
              'p-2 rounded-lg transition-all',
              tool === t.id
                ? 'bg-brand-500 text-white shadow-lg'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
            )}
            title={t.label}
          >
            <t.icon className="h-5 w-5" />
          </motion.button>
        ))}
      </div>

      <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700 mx-2" />

      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'p-2 rounded-lg transition-all',
            canUndo
              ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              : 'opacity-50 cursor-not-allowed'
          )}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-5 w-5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'p-2 rounded-lg transition-all',
            canRedo
              ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              : 'opacity-50 cursor-not-allowed'
          )}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
