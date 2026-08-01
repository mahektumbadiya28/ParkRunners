import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

export default function StatCard({ title, value, suffix = '', prefix = '', icon: Icon, trend, color = 'indigo', delay = 0 }) {
  const num = useCountUp(typeof value === 'number' ? value : parseInt(value) || 0);
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
    cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-500',   border: 'border-cyan-500/20' },
    green:  { bg: 'bg-emerald-500/10',text: 'text-emerald-500',border: 'border-emerald-500/20' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="card-premium p-6 flex items-start gap-4"
    >
      {Icon && (
        <div className={`w-12 h-12 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-black text-[var(--text-primary)] tabular-nums">
          {prefix}{typeof value === 'number' ? num.toLocaleString() : value}{suffix}
        </p>
        {trend && (
          <span className={`text-xs font-semibold mt-1 inline-block ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
