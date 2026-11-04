'use client';

import { useEffect, useRef } from 'react';

// Chama a função a cada intervalMs, só enquanto a aba estiver visível.
// A função fica num ref: cada chamada usa a versão mais recente (página e filtro atuais)
// sem precisar reiniciar o intervalo a cada mudança de estado.
export function useAutoRefresh(callback: () => void, intervalMs: number) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        callbackRef.current();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}