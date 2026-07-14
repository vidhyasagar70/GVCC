import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useScreenshotProtection } from '../../hooks/useScreenshotProtection';
import type { ScreenshotShieldProps } from '../../types';

export const ScreenshotShield: React.FC<ScreenshotShieldProps> = ({ children, className = '' }) => {
  const { isBlurred, containerRef } = useScreenshotProtection();

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Shield overlay */}
      <div
        className={[
          'absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 rounded-lg',
          'transition-all duration-200',
          isBlurred ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden={!isBlurred}
      >
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <ShieldAlert size={32} className="text-zinc-400" />
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Content Protected</p>
            <p className="text-xs text-zinc-500 mt-0.5">Screenshot capture is disabled</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-200 ${isBlurred ? 'blur-lg opacity-20' : ''}`}>
        {children}
      </div>
    </div>
  );
};
