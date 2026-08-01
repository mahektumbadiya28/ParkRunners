import React from 'react';
import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true, glass = false, gradient = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.18)' } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`
        rounded-2xl border overflow-hidden transition-all duration-300
        ${glass ? 'glass' : 'bg-[var(--bg-card)]'}
        ${gradient ? 'gradient-border' : 'border-[var(--border-color)]'}
        shadow-[var(--shadow-sm)]
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-6 pt-6 pb-4 border-b border-[var(--border-color)] ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
