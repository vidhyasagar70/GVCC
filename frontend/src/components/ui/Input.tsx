import React from 'react';
import type { InputProps, TextareaProps } from '../../types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, wrapperClassName = '', className = '', id, ...rest }, ref) => {
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-zinc-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-2.5 flex items-center text-zinc-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-md border bg-white text-zinc-900 placeholder-zinc-400',
              'text-sm transition-colors duration-150 outline-none',
              'focus:border-zinc-900 focus:ring-0',
              error ? 'border-red-400' : 'border-zinc-200 hover:border-zinc-300',
              icon ? 'pl-8 pr-3' : 'px-3',
              'py-1.5',
              className,
            ].join(' ')}
            {...rest}
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, wrapperClassName = '', className = '', id, ...rest }, ref) => {
    const textareaId = id ?? `textarea-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-zinc-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            'w-full rounded-md border bg-white text-zinc-900 placeholder-zinc-400',
            'text-sm transition-colors duration-150 outline-none resize-none',
            'focus:border-zinc-900 focus:ring-0',
            error ? 'border-red-400' : 'border-zinc-200 hover:border-zinc-300',
            'px-3 py-1.5',
            className,
          ].join(' ')}
          {...rest}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
