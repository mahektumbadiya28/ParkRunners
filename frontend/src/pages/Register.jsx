import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, ShieldAlert, CheckCircle, Car, Home, ClipboardList } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['owner', 'provider', 'valet'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      return setError('Please fill in all fields');
    }
    setError('');
    setLoading(true);

    const result = await register({ name, email, password, role });
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
    <div className="bg-[#0b0f19] text-gray-100 min-h-screen flex items-center justify-center py-12 px-4 relative">
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-md border border-gray-800/80 p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-widest">
            VOLENPARK
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Create an account to get started</p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500 rounded-xl py-3 pl-12 pr-4 text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Your Role</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Owner Option */}
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  role === 'owner'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                    : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                }`}
              >
                <Car className="w-5 h-5" />
                <span className="text-[10px] tracking-wide uppercase">Owner</span>
              </button>

              {/* Provider Option */}
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  role === 'provider'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                    : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px] tracking-wide uppercase">Host</span>
              </button>

              {/* Valet Option */}
              <button
                type="button"
                onClick={() => setRole('valet')}
                className={`py-3.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  role === 'valet'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                    : 'border-gray-800 bg-gray-950 text-gray-500 hover:border-gray-700'
                }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-[10px] tracking-wide uppercase">Valet</span>
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 text-center">
              {role === 'owner' && 'Find & book spaces, view tracking & inspect vehicles.'}
              {role === 'provider' && 'List driveways or garages, set pricing, view dashboard & withdraw.'}
              {role === 'valet' && 'Accept pickup tasks, scan check-in QR codes, run checks & return cars.'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Sign Up
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
