import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ButtonProps } from '../../types';

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-zinc-900 text-white hover:bg-black border border-zinc-900',
  secondary:
    'bg-transparent text-zinc-900 border border-zinc-200 hover:bg-zinc-50',
  ghost:
    'bg-transparent text-zinc-600 border border-transparent hover:bg-zinc-100 hover:text-zinc-900',
  danger:
    'bg-transparent text-red-600 border border-red-200 hover:bg-red-50',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-7  px-2.5 text-xs  gap-1.5',
  md: 'h-8  px-3   text-sm  gap-2',
  lg: 'h-10 px-4   text-sm  gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant      = 'primary',
      size         = 'md',
      loading      = false,
      icon,
      iconPosition = 'left',
      disabled,
      className    = '',
      children,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center rounded-md font-medium',
          'transition-colors duration-150 cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className,
        ].join(' ')}
        {...rest}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={14} />
        ) : (
          iconPosition === 'left' && icon && <span className="flex-shrink-0 text-current">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconPosition === 'right' && icon && (
          <span className="flex-shrink-0 text-current">{icon}</span>
        )}
      </button>
    );
  },
);
Button.displayName = 'Button';
