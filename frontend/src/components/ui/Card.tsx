import React from 'react';
import type { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={[
        'rounded-lg border border-zinc-200 bg-white',
        className,
      ].join(' ')}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <div>
            {title && <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};
