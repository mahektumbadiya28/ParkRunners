import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  label, icon: Icon, type = 'text', error, success,
  className = '', ...props
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
          <Icon className="w-4 h-4" />
        </div>
      )}

      <input
        type={isPassword ? (showPw ? 'text' : 'password') : type}
        placeholder={label}
        className={`
          input-premium text-sm
          ${Icon ? '!pl-11' : '!pl-4'}
          ${isPassword ? '!pr-12' : '!pr-4'}
          ${error ? '!border-red-400 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''}
          ${success ? '!border-emerald-400 focus:!shadow-[0_0_0_3px_rgba(16,185,129,0.15)]' : ''}
        `}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPw(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}

      {error && <p className="mt-1.5 text-xs text-red-400 pl-1">{error}</p>}
    </div>
  );
}
