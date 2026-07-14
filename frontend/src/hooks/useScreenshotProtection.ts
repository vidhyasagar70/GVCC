import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { UseScreenshotProtectionReturn } from '../types';

export function useScreenshotProtection(): UseScreenshotProtectionReturn {
  const [isBlurred, setIsBlurred]   = useState<boolean>(false);
  const containerRef                 = useRef<HTMLDivElement | null>(null);
  const blurTimeoutRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const activateBlur = useCallback(() => {
    setIsBlurred(true);
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
  }, []);

  const deactivateBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => setIsBlurred(false), 300);
  }, []);

  const showWarning = useCallback(() => {
    toast('🛡️ Screenshot protection active', {
      icon: '🔒',
      style: {
        background: '#1a1a27',
        color:      '#a5b4fc',
        border:     '1px solid #4338ca',
        fontWeight: '600',
      },
      duration: 2500,
    });
  }, []);

  // ── Print / PDF protection — inject @media print style ───────────────────────
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.id    = 'screenshot-shield-print';
    styleTag.textContent = `
      @media print {
        body { display: none !important; }
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  // ── Visibility / Focus events ─────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        activateBlur();
      } else {
        deactivateBlur();
      }
    };

    const handleBlur = () => activateBlur();
    const handleFocus = () => deactivateBlur();

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) {
        e.preventDefault();
        showWarning();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [activateBlur, deactivateBlur, showWarning]);

  // ── Keyboard interception ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === 'PrintScreen';
      const isMacScreen3  = e.metaKey && e.shiftKey && e.key === '3';
      const isMacScreen4  = e.metaKey && e.shiftKey && e.key === '4';
      const isMacScreen5  = e.metaKey && e.shiftKey && e.key === '5';
      const isCtrlP       = e.ctrlKey && e.key === 'p';
      const isCtrlS       = e.ctrlKey && e.key === 's';

      if (isPrintScreen || isMacScreen3 || isMacScreen4 || isMacScreen5 || isCtrlP || isCtrlS) {
        e.preventDefault();
        activateBlur();
        showWarning();
        // Auto-restore after warning
        setTimeout(deactivateBlur, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [activateBlur, deactivateBlur, showWarning]);

  // ── CSS select-none on container ─────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.style.userSelect    = 'none';
      el.style.webkitUserSelect = 'none';
    }
  }, []);

  // ── Cleanup ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  return { isBlurred, containerRef };
}
