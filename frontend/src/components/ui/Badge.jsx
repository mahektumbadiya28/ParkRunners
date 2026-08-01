import React from 'react';

const variants = {
  default:  'bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]',
  success:  'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  warning:  'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  danger:   'bg-red-500/10 text-red-400 border border-red-500/20',
  info:     'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  purple:   'bg-purple-500/10 text-purple-400 border border-purple-500/20',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
