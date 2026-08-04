import React from 'react';

const variants = {
  default:  'bg-[var(--bg-card-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]',
  success:  'status-emerald',
  warning:  'status-amber',
  danger:   'status-rose',
  info:     'status-indigo',
  purple:   'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
