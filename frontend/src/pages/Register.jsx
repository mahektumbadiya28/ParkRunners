import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, MapPin, ArrowRight, ArrowLeft, User, Car, Home, ClipboardList, AlertTriangle, UserPlus, FileText, Phone, Hash, Building2, Map } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ 
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', city: '',
    drivingLicense: '', aadhaarNumber: '', experience: '',
    businessName: '', gstNumber: '', totalSlots: '', businessAddress: '',
    termsAgreed: false
  });

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['owner', 'provider', 'valet'].includes(urlRole)) {
      setRole(urlRole);
      setStep(2);
    }
  }, [searchParams]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      return setError('Please fill in all basic fields.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (!form.termsAgreed) {
      return setError('You must agree to the Terms of Service.');
    }
    
    // Add role specific validation if needed
    if (role === 'owner' && (!form.phone || !form.city)) {
       return setError('Please provide phone and city.');
    }
    if (role === 'valet' && (!form.drivingLicense || !form.aadhaarNumber || !form.experience || !form.phone)) {
       return setError('Please fill in all valet details.');
    }
    if (role === 'provider' && (!form.businessName || !form.totalSlots || !form.businessAddress)) {
       return setError('Please fill in all provider details.');
    }

    setError('');
    setLoading(true);

    const result = await register({ 
      fullName: form.name, 
      email: form.email, 
      password: form.password, 
      role,
      additionalDetails: {
        phone: form.phone,
        city: form.city,
        drivingLicense: form.drivingLicense,
        aadhaarNumber: form.aadhaarNumber,
        experience: form.experience,
        businessName: form.businessName,
        gstNumber: form.gstNumber,
        totalSlots: form.totalSlots,
        businessAddress: form.businessAddress
      }
    });
    
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
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--bg-page)] p-4 sm:p-8 overflow-hidden">
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/12 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '-3s'}} />
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '-6s'}} />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-[var(--bg-card)]/80 backdrop-blur-xl rounded-3xl shadow-[var(--shadow-glow)] overflow-hidden min-h-[600px] flex flex-col p-6 sm:p-10 border border-[var(--glass-border)] hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] transition-shadow duration-500">
        
        {/* Header - Always visible */}
        <div className="relative text-center mb-10">
          {step === 1 && (
            <Link 
              to="/" 
              className="absolute left-0 top-0 sm:top-2 flex items-center gap-2 text-[var(--text-muted)] hover:text-indigo-500 transition-colors font-medium"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          )}
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-black tracking-widest text-indigo-500 uppercase">VOLENPARK</span>
          </Link>
          <p className="text-[var(--text-muted)] font-medium">Join the next-gen parking ecosystem</p>
        </div>

        {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto w-full mb-6 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm flex items-start gap-2 border border-red-500/20"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
        )}

        <div className="flex-1 w-full max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center h-full"
              >
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8 text-center">Choose Your Role</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  
                  {/* Car Owner Card */}
                  <button 
                    onClick={() => handleRoleSelect('owner')}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${role === 'owner' ? 'border-indigo-500 bg-indigo-500/10' : 'border-[var(--border-color)] hover:border-indigo-500/50'}`}
                  >
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20">
                      <Car className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Car Owner</h3>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed text-justify">Book smart parking spots, track your vehicle, and request valet services instantly.</p>
                  </button>

                  {/* Provider Card */}
                  <button 
                    onClick={() => handleRoleSelect('provider')}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${role === 'provider' ? 'border-purple-500 bg-purple-500/10' : 'border-[var(--border-color)] hover:border-purple-500/50'}`}
                  >
                    <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-purple-500/20">
                      <Home className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Parking Provider</h3>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed text-justify">List your parking spaces, manage bookings, and earn money easily.</p>
                  </button>

                  {/* Valet Card */}
                  <button 
                    onClick={() => handleRoleSelect('valet')}
                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${role === 'valet' ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border-color)] hover:border-blue-500/50'}`}
                  >
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Valet Driver</h3>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed text-justify">Accept pickup jobs, manage vehicle tracking, and earn daily.</p>
                  </button>

                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="flex items-center justify-between mb-8">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 text-[var(--text-muted)] hover:text-indigo-500 transition-colors font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Roles
                  </button>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    role === 'owner' ? 'bg-indigo-500/20 text-indigo-500' :
                    role === 'provider' ? 'bg-purple-500/20 text-purple-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {role} SETUP
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      name="name"
                      type="text"
                      label="FULL NAME"
                      icon={User}
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    <Input
                      name="email"
                      type="email"
                      label="EMAIL ADDRESS"
                      icon={Mail}
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                    <Input
                      name="password"
                      type="password"
                      label="PASSWORD"
                      icon={Key}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    <Input
                      name="confirmPassword"
                      type="password"
                      label="CONFIRM PASSWORD"
                      icon={Key}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="h-px bg-[var(--border-color)] my-8"></div>

                  <h3 className="text-lg font-bold text-indigo-500 mb-6">Additional Details</h3>
                  
                  {/* Role Specific Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {role === 'owner' && (
                      <>
                        <Input
                          name="phone"
                          type="tel"
                          label="PHONE"
                          value={form.phone}
                          onChange={handleChange}
                        />
                        <Input
                          name="city"
                          type="text"
                          label="CITY"
                          value={form.city}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    {role === 'valet' && (
                      <>
                        <Input
                          name="drivingLicense"
                          type="text"
                          label="DRIVING LICENSE NUMBER"
                          value={form.drivingLicense}
                          onChange={handleChange}
                          placeholder="DL-1420110012345"
                        />
                        <Input
                          name="aadhaarNumber"
                          type="text"
                          label="AADHAAR NUMBER"
                          value={form.aadhaarNumber}
                          onChange={handleChange}
                          placeholder="XXXX-XXXX-XXXX"
                        />
                        <Input
                          name="experience"
                          type="number"
                          label="YEARS OF EXPERIENCE"
                          value={form.experience}
                          onChange={handleChange}
                          placeholder="0"
                        />
                        <Input
                          name="phone"
                          type="tel"
                          label="PHONE"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    {role === 'provider' && (
                      <>
                        <Input
                          name="businessName"
                          type="text"
                          label="BUSINESS / PARKING NAME"
                          icon={Building2}
                          value={form.businessName}
                          onChange={handleChange}
                          placeholder="Central Mall Parking"
                        />
                        <Input
                          name="gstNumber"
                          type="text"
                          label="GST NUMBER (OPTIONAL)"
                          icon={Hash}
                          value={form.gstNumber}
                          onChange={handleChange}
                          placeholder="# 22AAAAA0000A1Z5"
                        />
                        <Input
                          name="totalSlots"
                          type="number"
                          label="TOTAL PARKING SLOTS"
                          value={form.totalSlots}
                          onChange={handleChange}
                          placeholder="1"
                        />
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">BUSINESS ADDRESS</label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 text-[var(--text-muted)]">
                              <Map className="w-5 h-5" />
                            </div>
                            <textarea
                              name="businessAddress"
                              value={form.businessAddress}
                              onChange={handleChange}
                              rows={3}
                              className="w-full bg-[var(--bg-page)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block pl-10 p-3 transition-colors resize-none"
                            ></textarea>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      name="termsAgreed"
                      checked={form.termsAgreed}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-indigo-500 bg-[var(--bg-page)] border-[var(--border-color)] rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="terms" className="text-sm text-[var(--text-muted)] leading-relaxed">
                      I agree to the Terms of Service and Privacy Policy. I confirm that the details provided above are accurate.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-glow w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl py-4 shadow-lg shadow-indigo-500/30 font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>

                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
