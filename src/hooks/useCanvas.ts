import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getCanvas, listCanvases } from '@/lib/sui';
import { Canvas } from '@/lib/types';

export function useCanvas(canvasId?: string) {
  const {
    data: canvas,
    error,
    mutate,
  } = useSWR(canvasId ? `canvas-${canvasId}` : null, () => getCanvas(canvasId!), {
    refreshInterval: 5000, // Poll every 5 seconds
  });

  return {
    canvas,
    isLoading: !error && !canvas,
    isError: error,
    refresh: mutate,
  };
}

export function useCanvases() {
  const {
    data: canvases,
    error,
    mutate,
  } = useSWR('canvases', listCanvases, {
    refreshInterval: 10000, // Poll every 10 seconds
  });

  return {
    canvases: canvases || [],
    isLoading: !error && !canvases,
    isError: error,
    refresh: mutate,
  };
}
