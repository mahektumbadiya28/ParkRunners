import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, MapPin, Zap, ArrowRight, User, Car, Home, ClipboardList, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['owner', 'provider', 'valet'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !role) {
      return setError('Please fill in all fields');
    }
    setError('');
    setLoading(true);

    const result = await register({ fullName: form.name, email: form.email, password: form.password, role });
    setLoading(false);

    if (result.success) {
      if (role === 'provider') navigate('/provider');
      else if (role === 'valet') navigate('/valet');
      else navigate('/owner');
    } else {
      setError(result.message || 'Registration failed');
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
              Join the future<br />of parking.
            </h2>
            <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
              Create an account and start managing your parking or earning money today.
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <MapPin className="w-7 h-7 text-indigo-600" />
            <span className="font-black gradient-text">VOLENPARK</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">Create Account</h1>
            <p className="text-[var(--text-muted)]">Sign up to get started</p>
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
              name="name"
              type="text"
              label="Full Name"
              icon={User}
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
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
              autoComplete="new-password"
              error={form.password.length > 0 && form.password.length < 6}
            />

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Select Your Role</label>
              <div className="grid grid-cols-3 gap-3">
                {/* Owner Option */}
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    role === 'owner'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <Car className="w-5 h-5" />
                  <span className="text-[10px] tracking-wide uppercase">Owner</span>
                </button>

                {/* Provider Option */}
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    role === 'provider'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="text-[10px] tracking-wide uppercase">Host</span>
                </button>

                {/* Valet Option */}
                <button
                  type="button"
                  onClick={() => setRole('valet')}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    role === 'valet'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-[10px] tracking-wide uppercase">Valet</span>
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center h-8">
                {role === 'owner' && 'Find & book spaces, view tracking & inspect vehicles.'}
                {role === 'provider' && 'List driveways or garages, set pricing & withdraw.'}
                {role === 'valet' && 'Accept pickup tasks, scan check-in QR codes & run checks.'}
              </p>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full mt-2"
              iconRight={ArrowRight}
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
              Sign in instead
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
