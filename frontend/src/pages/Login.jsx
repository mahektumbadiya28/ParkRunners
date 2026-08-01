import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, MapPin, Zap, ArrowRight, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      const routes = { owner: '/owner', provider: '/provider', valet: '/valet', admin: '/admin' };
      navigate(routes[user.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)]">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{animationDelay:'-4s'}} />
        {/* Grid */}
        <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',backgroundSize:'32px 32px'}} />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2.5">
            <MapPin className="w-8 h-8 text-white" />
            <span className="text-xl font-black text-white tracking-tight">VOLENPARK</span>
          </Link>

          <div className="text-white">
            <Zap className="w-12 h-12 text-indigo-300 mb-8 animate-pulse" />
            <h2 className="text-4xl font-black mb-4 leading-tight">
              Park smarter,<br />earn faster.
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
              The premium P2P parking marketplace connecting thousands of drivers, hosts, and valets every day.
            </p>
            <div className="mt-10 flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-indigo-900 bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white">
                  <User className="w-4 h-4 opacity-80" />
                </div>
              ))}
              <div className="ml-3 flex items-center text-sm text-indigo-300 font-medium">48k+ users</div>
            </div>
          </div>

          <p className="text-indigo-400 text-xs">© {new Date().getFullYear()} VolenPark · All rights reserved</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <MapPin className="w-7 h-7 text-indigo-600" />
            <span className="font-black gradient-text">VOLENPARK</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Welcome back</h1>
            <p className="text-[var(--text-muted)]">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              label="Email address"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
            <Input
              name="password"
              type="password"
              label="Password"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-indigo-500 rounded" />
                <span className="text-sm text-[var(--text-muted)]">Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
              iconRight={ArrowRight}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
