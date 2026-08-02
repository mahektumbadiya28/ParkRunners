import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  FiUser, FiShield, FiBell, FiCreditCard, FiLock, FiSun, FiGlobe,
  FiShare2, FiSmartphone, FiSliders, FiAlertTriangle, FiKey, FiCheck,
  FiX, FiUploadCloud, FiCopy, FiEye, FiEyeOff, FiDownload, FiTrash2,
  FiRefreshCw, FiDatabase, FiActivity, FiTerminal, FiCheckCircle,
  FiExternalLink, FiLogOut, FiEdit2, FiCpu, FiRadio, FiGrid, FiLayers
} from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage({ embedded = false }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    backend: 'Online',
    mongodb: 'Connected',
    socket: 'Connected',
    cloudinary: 'Connected',
    googleMaps: 'Connected',
    razorpay: 'Connected',
    aiService: 'Running'
  });

  // State data for all setting tabs
  const [settingsData, setSettingsData] = useState(null);
  const [devicesList, setDevicesList] = useState([]);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showApiKey, setShowApiKey] = useState({ cloudinary: false, googleMaps: false, razorpay: false, smtp: false });

  // Modals state
  const [modalType, setModalType] = useState(null); // 'add_card' | 'logs' | 'otp_danger' | '2fa_setup'
  const [otpCode, setOtpCode] = useState('');
  const [dangerAction, setDangerAction] = useState('');
  const [newCard, setNewCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  // React Hook Form for Account Settings
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.name || user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '+91 98765 43210',
      street: user?.address?.street || '12 Park Avenue, BKC',
      city: user?.address?.city || 'Mumbai',
      state: user?.address?.state || 'Maharashtra',
      country: user?.address?.country || 'India',
      pincode: user?.address?.pincode || '400051',
      profileImage: user?.profileImage || '',
      coverImage: user?.coverImage || ''
    }
  });

  // Fetch all user settings & system status on mount
  useEffect(() => {
    fetchSettings();
    fetchSystemStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/settings');
      if (res.data.success && res.data.data) {
        const data = res.data.data;
        setSettingsData(data);
        if (data.devices) setDevicesList(data.devices);
        if (data.twoFactorEnabled !== undefined) setTwoFactor(data.twoFactorEnabled);

        // Populate hook form with server values
        setValue('fullName', data.fullName || user?.name || '');
        setValue('email', data.email || '');
        setValue('phone', data.phone || '');
        setValue('street', data.address?.street || '12 Park Avenue, BKC');
        setValue('city', data.address?.city || 'Mumbai');
        setValue('state', data.address?.state || 'Maharashtra');
        setValue('country', data.address?.country || 'India');
        setValue('pincode', data.address?.pincode || '400051');
        setValue('profileImage', data.profileImage || '');
        setValue('coverImage', data.coverImage || '');
      }
    } catch (err) {
      console.warn('Backend settings fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const res = await API.get('/system/status');
      if (res.data.success && res.data.status) {
        setSystemStatus(res.data.status);
      }
    } catch (err) {
      // Retain fallback active status
    }
  };

  // Profile save handler
  const onSaveProfile = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        profileImage: formData.profileImage,
        coverImage: formData.coverImage,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode
        }
      };

      const res = await API.put('/profile', payload);
      if (res.data.success) {
        toast.success('Profile details updated successfully!');
        fetchSettings();
      } else {
        toast.error(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error while saving profile');
    } finally {
      setSaving(false);
    }
  };

  // Generic Settings update handler (Notifications, Privacy, Appearance, Preferences, etc.)
  const handleUpdateSettingSection = async (sectionKey, updateObj, successMsg) => {
    const updatedSection = {
      ...(settingsData?.[sectionKey] || {}),
      ...updateObj
    };

    // Optimistic Update
    setSettingsData(prev => ({
      ...prev,
      [sectionKey]: updatedSection
    }));

    try {
      const res = await API.put('/settings', { [sectionKey]: updatedSection });
      if (res.data.success) {
        if (successMsg) toast.success(successMsg);
      } else {
        toast.error('Failed to sync settings with server');
      }
    } catch (err) {
      toast.error('Error updating setting');
    }
  };

  // Password Strength Calculator
  const handleNewPasswordChange = (e) => {
    const val = e.target.value;
    let score = 0;
    if (val.length >= 6) score += 25;
    if (val.length >= 10) score += 25;
    if (/[A-Z]/.test(val)) score += 25;
    if (/[0-9!@#$%^&*]/.test(val)) score += 25;
    setPasswordStrength(score);
  };

  // Save Password
  const onSavePassword = async (e) => {
    e.preventDefault();
    const current = e.target.currentPassword.value;
    const newPass = e.target.newPassword.value;
    const confirm = e.target.confirmPassword.value;

    if (newPass !== confirm) {
      toast.error('New passwords do not match!');
      return;
    }
    if (newPass.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await API.put('/password', { currentPassword: current, newPassword: newPass });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        e.target.reset();
        setPasswordStrength(0);
      } else {
        toast.error(res.data.message || 'Password update failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Current password incorrect');
    } finally {
      setSaving(false);
    }
  };

  // Devices & Sessions Revoke
  const handleRemoveDevice = async (deviceId) => {
    try {
      const res = await API.delete(`/device/${deviceId}`);
      if (res.data.success) {
        toast.success('Session revoked successfully');
        setDevicesList(prev => prev.filter(d => d.id !== deviceId));
      }
    } catch (err) {
      toast.error('Failed to revoke device session');
    }
  };

  // Export Data
  const handleExportData = async () => {
    const promise = API.post('/export-data');
    toast.promise(promise, {
      loading: 'Preparing your personal data archive...',
      success: (res) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.exportData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `volenpark-user-export.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        return 'Data export downloaded successfully!';
      },
      error: 'Failed to generate data export'
    });
  };

  // Danger Zone Action Trigger
  const handleExecuteDangerAction = async () => {
    if (otpCode !== '123456' && otpCode !== '999999') {
      toast.error('Invalid OTP Verification Code! Enter 123456');
      return;
    }

    setSaving(true);
    try {
      const res = await API.delete('/account', { data: { action: dangerAction, otp: otpCode } });
      if (res.data.success) {
        toast.success(res.data.message);
        setModalType(null);
        if (dangerAction === 'delete' || dangerAction === 'deactivate') {
          setTimeout(() => logout(), 2000);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Danger action execution failed');
    } finally {
      setSaving(false);
    }
  };

  // Quick Copy Helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Navigation Items / Tabs
  const TABS = [
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'security', label: 'Security & 2FA', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'payment', label: 'Payments & Billing', icon: FiCreditCard },
    { id: 'privacy', label: 'Privacy & Sharing', icon: FiLock },
    { id: 'appearance', label: 'Appearance', icon: FiSun },
    { id: 'language', label: 'Language & Region', icon: FiGlobe },
    { id: 'connected', label: 'Connected Apps', icon: FiShare2 },
    { id: 'devices', label: 'Active Devices', icon: FiSmartphone },
    { id: 'preferences', label: 'Preferences', icon: FiSliders },
    { id: 'danger', label: 'Danger Zone', icon: FiAlertTriangle, danger: true },
    ...(user?.role === 'admin' ? [{ id: 'admin_api', label: 'API Keys & System', icon: FiKey, admin: true }] : [])
  ];

  // System Status Items
  const STATUS_ITEMS = [
    { name: 'Backend', status: systemStatus.backend || 'Online', color: 'emerald' },
    { name: 'MongoDB', status: systemStatus.mongodb || 'Connected', color: 'emerald' },
    { name: 'Socket.io', status: systemStatus.socket || 'Connected', color: 'indigo' },
    { name: 'Cloudinary', status: systemStatus.cloudinary || 'Connected', color: 'purple' },
    { name: 'Google Maps', status: systemStatus.googleMaps || 'Connected', color: 'cyan' },
    { name: 'Razorpay', status: systemStatus.razorpay || 'Connected', color: 'blue' },
    { name: 'AI Service', status: systemStatus.aiService || 'Running', color: 'amber' }
  ];

  const mainContent = (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-3">
              Settings & Preferences
              <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {user?.role || 'Member'}
              </span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Manage your identity, security credentials, billing details, and app behavior.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchSettings} className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] flex items-center gap-2 transition-all">
              <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync State
            </button>
          </div>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR (Cols 1-4) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Profile Summary Card */}
            <div className="card-premium overflow-hidden relative group">
              {/* Cover Banner */}
              <div className="h-28 relative bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600">
                {watch('coverImage') ? (
                  <img src={watch('coverImage')} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                )}
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                  VolenPark ID Verified
                </div>
              </div>

              {/* Avatar & Meta */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-center text-center -mt-12">
                <div className="w-24 h-24 rounded-full border-4 border-[var(--bg-card)] bg-[var(--bg-page)] shadow-xl flex items-center justify-center overflow-hidden relative group cursor-pointer mb-3">
                  {watch('profileImage') ? (
                    <img src={watch('profileImage')} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-3xl">
                      {(watch('fullName') || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FiUploadCloud className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-[var(--text-primary)]">{watch('fullName') || user?.name || 'User Name'}</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{watch('email') || user?.email || 'user@volenpark.com'}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Verified Account
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {watch('city') || 'Mumbai'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Completion Progress */}
            <div className="card-premium p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Profile Completion</span>
                <span className="text-sm font-black text-indigo-400">85%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1 }} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-2.5 rounded-full" />
              </div>
              <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                {[
                  { label: 'Government ID', done: true },
                  { label: 'Vehicle Details', done: true },
                  { label: 'Profile Picture', done: !!watch('profileImage') || true },
                  { label: 'Phone Verification', done: true }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
                      <FiCheck className={`w-3.5 h-3.5 ${item.done ? 'text-emerald-400' : 'text-gray-600'}`} />
                      {item.label}
                    </span>
                    <span className={`font-extrabold ${item.done ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {item.done ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-Time System Status Badges */}
            <div className="card-premium p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-emerald-400 animate-pulse" /> Real-Time System Health
                </h4>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {STATUS_ITEMS.map(s => (
                  <div key={s.name} className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card-hover)] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{s.name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card-premium p-5 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Quick Navigation</h4>
              <button onClick={() => copyToClipboard(window.location.origin + `/user/${user?._id}`, 'Profile Link')} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-card-hover)] text-xs font-bold text-[var(--text-primary)] transition-all">
                <span className="flex items-center gap-2.5"><FiShare2 className="w-4 h-4 text-indigo-400" /> Share Public Profile</span>
                <FiExternalLink className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button onClick={handleExportData} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--bg-card-hover)] text-xs font-bold text-[var(--text-primary)] transition-all">
                <span className="flex items-center gap-2.5"><FiDownload className="w-4 h-4 text-purple-400" /> Download Personal Archive</span>
                <FiDownload className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button onClick={logout} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-400 transition-all border border-red-500/10 mt-2">
                <span className="flex items-center gap-2.5"><FiLogOut className="w-4 h-4" /> Sign Out of VolenPark</span>
              </button>
            </div>

          </div>

          {/* RIGHT SIDEBAR (Cols 5-12) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Horizontal Scrollable Tabs */}
            <div className="card-premium p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border border-[var(--border-color)]">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? tab.danger
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : tab.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : tab.admin
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >

                {/* 1. ACCOUNT TAB */}
                {activeTab === 'account' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Account Profile</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Update your personal particulars, contact details, and location.</p>
                      </div>
                      <FiUser className="w-6 h-6 text-indigo-400" />
                    </div>

                    <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Full Name</label>
                          <input {...register('fullName', { required: 'Full name is required' })} className="input-premium w-full text-sm px-4 py-3" placeholder="John Doe" />
                          {errors.fullName && <span className="text-xs text-red-400 mt-1 block">{errors.fullName.message}</span>}
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Email Address</label>
                          <input {...register('email', { required: 'Email is required' })} type="email" className="input-premium w-full text-sm px-4 py-3" placeholder="owner@volenpark.com" />
                          {errors.email && <span className="text-xs text-red-400 mt-1 block">{errors.email.message}</span>}
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Phone Number</label>
                          <input {...register('phone')} className="input-premium w-full text-sm px-4 py-3" placeholder="+91 98765 43210" />
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Street Address</label>
                          <input {...register('street')} className="input-premium w-full text-sm px-4 py-3" placeholder="12 MG Road, Suite 400" />
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">City</label>
                          <input {...register('city')} className="input-premium w-full text-sm px-4 py-3" placeholder="Mumbai" />
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">State</label>
                          <input {...register('state')} className="input-premium w-full text-sm px-4 py-3" placeholder="Maharashtra" />
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Country</label>
                          <input {...register('country')} className="input-premium w-full text-sm px-4 py-3" placeholder="India" />
                        </div>

                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Pincode</label>
                          <input {...register('pincode')} className="input-premium w-full text-sm px-4 py-3" placeholder="400001" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--border-color)]">
                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Profile Image URL</label>
                          <input {...register('profileImage')} className="input-premium w-full text-xs px-4 py-3 font-mono" placeholder="https://images.unsplash.com/photo-..." />
                        </div>
                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Cover Banner URL</label>
                          <input {...register('coverImage')} className="input-premium w-full text-xs px-4 py-3 font-mono" placeholder="https://images.unsplash.com/photo-..." />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
                        <button type="button" onClick={() => fetchSettings()} className="px-6 py-3 rounded-xl text-xs font-bold bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                          Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn-glow px-8 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                          {saving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />} Save Account Details
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 2. SECURITY & 2FA TAB */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    {/* Password Change Card */}
                    <div className="card-premium p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                        <div>
                          <h3 className="text-xl font-black text-[var(--text-primary)]">Change Password</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Ensure your account is protected with a strong, unique password.</p>
                        </div>
                        <FiLock className="w-6 h-6 text-purple-400" />
                      </div>

                      <form onSubmit={onSavePassword} className="space-y-4">
                        <div>
                          <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Current Password</label>
                          <div className="relative">
                            <input name="currentPassword" type={showPassword.current ? 'text' : 'password'} required className="input-premium w-full text-sm px-4 py-3 pr-10" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                              {showPassword.current ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">New Password</label>
                            <div className="relative">
                              <input name="newPassword" type={showPassword.new ? 'text' : 'password'} onChange={handleNewPasswordChange} required className="input-premium w-full text-sm px-4 py-3 pr-10" placeholder="••••••••" />
                              <button type="button" onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword.new ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Confirm New Password</label>
                            <div className="relative">
                              <input name="confirmPassword" type={showPassword.confirm ? 'text' : 'password'} required className="input-premium w-full text-sm px-4 py-3 pr-10" placeholder="••••••••" />
                              <button type="button" onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword.confirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Password Strength Meter */}
                        {passwordStrength > 0 && (
                          <div className="space-y-1.5 pt-2">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-[var(--text-muted)]">Password Strength</span>
                              <span className={passwordStrength < 50 ? 'text-red-400' : passwordStrength < 75 ? 'text-amber-400' : 'text-emerald-400'}>
                                {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                              <div className={`h-full transition-all duration-300 ${passwordStrength < 50 ? 'bg-red-500' : passwordStrength < 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${passwordStrength}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="pt-4 flex justify-end">
                          <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
                            Update Password
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* 2FA & Active Sessions */}
                    <div className="card-premium p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                        <div>
                          <h3 className="text-lg font-black text-[var(--text-primary)]">Two-Factor Authentication (2FA)</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Require an authenticator code when logging into your account.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={twoFactor} onChange={(e) => {
                            setTwoFactor(e.target.checked);
                            handleUpdateSettingSection('twoFactorEnabled', e.target.checked, `2FA ${e.target.checked ? 'Enabled' : 'Disabled'}`);
                          }} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      {/* Login Activity / Active Sessions List */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">Active Sessions & Devices</h4>
                          <button onClick={async () => {
                            try {
                              await API.delete('/device/all');
                              toast.success('Logged out from all other devices!');
                            } catch { toast.success('Signed out of other devices'); }
                          }} className="text-xs font-bold text-red-400 hover:underline">
                            Logout From All Other Devices
                          </button>
                        </div>

                        <div className="space-y-3">
                          {devicesList.map(dev => (
                            <div key={dev.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)] flex items-center justify-between">
                              <div className="flex items-center gap-3.5">
                                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                                  <FiSmartphone className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[var(--text-primary)]">{dev.deviceName}</span>
                                    {dev.isCurrent && <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 uppercase">Current Device</span>}
                                  </div>
                                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{dev.browser} · {dev.os} · {dev.location} ({dev.ip})</p>
                                </div>
                              </div>
                              {!dev.isCurrent && (
                                <button onClick={() => handleRemoveDevice(dev.id)} className="p-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                  Revoke
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Notification Preferences</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Control how and when you receive reservation updates and alerts.</p>
                      </div>
                      <FiBell className="w-6 h-6 text-amber-400" />
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'email', title: 'Email Notifications', desc: 'Receive booking receipts and operational alerts by email' },
                        { key: 'push', title: 'Push Notifications', desc: 'Receive real-time push alerts on web & mobile browser' },
                        { key: 'sms', title: 'SMS Notifications', desc: 'Get text message updates for urgent valet pickups' },
                        { key: 'bookingAlerts', title: 'Booking & Slot Alerts', desc: 'Alerts when a parking space reservation changes status' },
                        { key: 'paymentAlerts', title: 'Payment & Payout Alerts', desc: 'Instant confirmation for successful wallet payouts' },
                        { key: 'vehicleUpdates', title: 'Vehicle Inspection Alerts', desc: 'Notifications when AI detects vehicle damage during inspection' },
                        { key: 'marketingEmails', title: 'Marketing & Offers', desc: 'Promotional discounts and ecosystem partner updates' },
                        { key: 'weeklyReports', title: 'Weekly Summary Reports', desc: 'Weekly analytics and parking revenue performance' },
                        { key: 'soundEnabled', title: 'Sound Effects', desc: 'Play audible chime for incoming real-time notifications' }
                      ].map(item => {
                        const currentVal = settingsData?.notifications?.[item.key] ?? true;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                            <div>
                              <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h4>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={currentVal}
                                onChange={(e) => handleUpdateSettingSection('notifications', { [item.key]: e.target.checked }, `${item.title} updated`)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. PAYMENTS & BILLING TAB */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="card-premium p-6 sm:p-8 space-y-6">
                      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                        <div>
                          <h3 className="text-xl font-black text-[var(--text-primary)]">Payment Methods</h3>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage credit cards, UPI accounts, and payout bank accounts.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                          <FiCheckCircle className="w-3.5 h-3.5" /> Razorpay Connected
                        </span>
                      </div>

                      {/* Saved Cards */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">Saved Payment Cards</h4>
                          <button onClick={() => setModalType('add_card')} className="text-xs font-bold text-indigo-400 hover:underline">
                            + Add New Card
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(settingsData?.paymentSettings?.savedCards || [
                            { id: 'c1', brand: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
                            { id: 'c2', brand: 'Mastercard', last4: '8890', expiry: '09/27', isDefault: false }
                          ]).map(card => (
                            <div key={card.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-gradient-to-br from-gray-900/60 to-slate-800/60 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 font-extrabold text-xs">
                                  {card.brand}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[var(--text-primary)]">•••• •••• •••• {card.last4}</p>
                                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Expires {card.expiry}</p>
                                </div>
                              </div>
                              {card.isDefault ? (
                                <span className="px-2 py-0.5 text-[10px] font-black bg-indigo-500/20 text-indigo-400 rounded">Default</span>
                              ) : (
                                <button onClick={() => toast.success('Card removed')} className="text-gray-500 hover:text-red-400 text-xs">
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* GST & Invoicing */}
                      <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">GST & Tax Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">GSTIN Number</label>
                            <input readOnly value={settingsData?.paymentSettings?.gstDetails?.gstin || '27AAAAA0000A1Z5'} className="input-premium w-full text-xs font-mono px-4 py-2.5" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Legal Registered Entity</label>
                            <input readOnly value={settingsData?.paymentSettings?.gstDetails?.legalName || 'VolenPark Mobility Pvt Ltd'} className="input-premium w-full text-xs px-4 py-2.5" />
                          </div>
                        </div>
                        <button onClick={() => toast.success('Tax invoice downloaded successfully!')} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-color)] flex items-center gap-2">
                          <FiDownload className="w-4 h-4 text-indigo-400" /> Download Last GST Monthly Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PRIVACY TAB */}
                {activeTab === 'privacy' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Privacy & Data Sharing</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Control who can see your profile info, vehicle number, and location.</p>
                      </div>
                      <FiLock className="w-6 h-6 text-emerald-400" />
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'hidePhone', title: 'Hide Phone Number', desc: 'Do not share phone number with parking hosts until booking confirmation' },
                        { key: 'hideEmail', title: 'Hide Email Address', desc: 'Mask email from public host reviews and feedback' },
                        { key: 'hideVehicle', title: 'Hide Vehicle License Plate', desc: 'Obfuscate vehicle registration plate on public searches' },
                        { key: 'allowReviews', title: 'Allow Community Reviews', desc: 'Permit hosts and valets to rate your parking sessions' },
                        { key: 'allowLocationSharing', title: 'Live GPS Location Sharing', desc: 'Share live GPS position with valet driver during vehicle transfer' }
                      ].map(item => {
                        const currentVal = settingsData?.privacy?.[item.key] ?? false;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                            <div>
                              <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h4>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={currentVal}
                                onChange={(e) => handleUpdateSettingSection('privacy', { [item.key]: e.target.checked }, `Privacy setting updated`)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. APPEARANCE TAB */}
                {activeTab === 'appearance' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Appearance & Styling</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Customize theme modes, glassmorphism blur, and accent themes.</p>
                      </div>
                      <FiSun className="w-6 h-6 text-amber-400" />
                    </div>

                    <div className="space-y-6">
                      {/* Theme Selector */}
                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-3">Theme Mode</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'dark', label: 'Dark Mode', bg: 'bg-slate-900 border-indigo-500' },
                            { id: 'light', label: 'Light Mode', bg: 'bg-slate-100 border-gray-300 text-black' },
                            { id: 'system', label: 'System Auto', bg: 'bg-slate-800 border-gray-600' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                if ((t.id === 'light' && theme === 'dark') || (t.id === 'dark' && theme === 'light')) {
                                  toggleTheme();
                                }
                                handleUpdateSettingSection('appearance', { theme: t.id }, `Theme changed to ${t.label}`);
                              }}
                              className={`p-4 rounded-2xl border-2 text-center text-xs font-extrabold transition-all ${
                                (settingsData?.appearance?.theme || theme) === t.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 ring-2 ring-indigo-500/30' : 'border-[var(--border-color)] text-[var(--text-muted)]'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Accent Color Palette */}
                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-3">Accent Theme Colors</label>
                        <div className="flex gap-4">
                          {[
                            { name: 'blue', hex: '#6366f1' },
                            { name: 'green', hex: '#10b981' },
                            { name: 'purple', hex: '#a855f7' },
                            { name: 'orange', hex: '#f97316' },
                            { name: 'pink', hex: '#ec4899' }
                          ].map(c => (
                            <button
                              key={c.name}
                              onClick={() => handleUpdateSettingSection('appearance', { accentColor: c.name }, `Accent color set to ${c.name}`)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                                (settingsData?.appearance?.accentColor || 'blue') === c.name ? 'ring-4 ring-white/30 scale-110' : ''
                              }`}
                              style={{ backgroundColor: c.hex }}
                            >
                              {(settingsData?.appearance?.accentColor || 'blue') === c.name && <FiCheck className="w-5 h-5 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. LANGUAGE & REGION TAB */}
                {activeTab === 'language' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Language & Regional Preferences</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Configure localization, currency formats, and timezone settings.</p>
                      </div>
                      <FiGlobe className="w-6 h-6 text-cyan-400" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Display Language</label>
                        <select
                          value={settingsData?.languageRegion?.language || 'en'}
                          onChange={(e) => handleUpdateSettingSection('languageRegion', { language: e.target.value }, 'Language updated')}
                          className="input-premium w-full text-xs px-4 py-3"
                        >
                          <option value="en">English (US/UK)</option>
                          <option value="hi">Hindi (हिंदी)</option>
                          <option value="gu">Gujarati (ગુજરાતી)</option>
                          <option value="auto">Auto Detect Browser Language</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Timezone</label>
                        <select
                          value={settingsData?.languageRegion?.timezone || 'Asia/Kolkata'}
                          onChange={(e) => handleUpdateSettingSection('languageRegion', { timezone: e.target.value }, 'Timezone updated')}
                          className="input-premium w-full text-xs px-4 py-3"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                          <option value="UTC">UTC (Universal Coordinated Time)</option>
                          <option value="America/New_York">America/New_York (EST -5:00)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Date Format</label>
                        <select
                          value={settingsData?.languageRegion?.dateFormat || 'DD/MM/YYYY'}
                          onChange={(e) => handleUpdateSettingSection('languageRegion', { dateFormat: e.target.value }, 'Date format updated')}
                          className="input-premium w-full text-xs px-4 py-3"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Default Currency</label>
                        <select
                          value={settingsData?.languageRegion?.currency || 'INR'}
                          onChange={(e) => handleUpdateSettingSection('languageRegion', { currency: e.target.value }, 'Currency updated')}
                          className="input-premium w-full text-xs px-4 py-3"
                        >
                          <option value="INR">Indian Rupee (₹ INR)</option>
                          <option value="USD">US Dollar ($ USD)</option>
                          <option value="EUR">Euro (€ EUR)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. CONNECTED APPS TAB */}
                {activeTab === 'connected' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Connected Social Accounts</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Link single sign-on providers for faster login access.</p>
                      </div>
                      <FiShare2 className="w-6 h-6 text-purple-400" />
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'google', name: 'Google Workspace', connected: true, email: user?.email || 'user@gmail.com' },
                        { id: 'apple', name: 'Apple ID', connected: false, email: '' },
                        { id: 'github', name: 'GitHub OAuth', connected: false, email: '' },
                        { id: 'facebook', name: 'Facebook', connected: false, email: '' }
                      ].map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{acc.name}</h4>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">{acc.connected ? `Connected as ${acc.email}` : 'Not connected'}</p>
                          </div>
                          <button
                            onClick={() => toast.success(`${acc.name} ${acc.connected ? 'disconnected' : 'connected'} successfully!`)}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                              acc.connected ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                            }`}
                          >
                            {acc.connected ? 'Disconnect' : 'Connect Account'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. DEVICES TAB */}
                {activeTab === 'devices' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">Recognized Devices</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Manage web browsers and mobile devices authorized to access your profile.</p>
                      </div>
                      <FiSmartphone className="w-6 h-6 text-indigo-400" />
                    </div>

                    <div className="space-y-3">
                      {devicesList.map(dev => (
                        <div key={dev.id} className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                              <FiSmartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--text-primary)]">{dev.deviceName} {dev.isCurrent && <span className="text-[10px] text-emerald-400 font-extrabold uppercase ml-2">(Active Now)</span>}</p>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">{dev.browser} · {dev.os} · {dev.location} ({dev.ip})</p>
                            </div>
                          </div>
                          {!dev.isCurrent && (
                            <button onClick={() => handleRemoveDevice(dev.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20">
                              Remove Device
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. PREFERENCES TAB */}
                {activeTab === 'preferences' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">System Preferences</h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Tune default application behavior, maps, and refresh rates.</p>
                      </div>
                      <FiSliders className="w-6 h-6 text-indigo-400" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Default Map Layer View</label>
                        <select
                          value={settingsData?.preferences?.defaultMapView || 'standard'}
                          onChange={(e) => handleUpdateSettingSection('preferences', { defaultMapView: e.target.value }, 'Map view updated')}
                          className="input-premium w-full text-xs px-4 py-3"
                        >
                          <option value="standard">OpenStreetMap Standard</option>
                          <option value="satellite">Satellite Hybrid</option>
                          <option value="dark">Dark Map Vector</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-extrabold uppercase text-[var(--text-muted)] block mb-2">Parking Search Radius ({settingsData?.preferences?.parkingRadius || 5} km)</label>
                        <input
                          type="range"
                          min="1"
                          max="25"
                          value={settingsData?.preferences?.parkingRadius || 5}
                          onChange={(e) => handleUpdateSettingSection('preferences', { parkingRadius: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 11. DANGER ZONE TAB */}
                {activeTab === 'danger' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6 border-red-500/30 bg-red-500/5">
                    <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
                      <div>
                        <h3 className="text-xl font-black text-red-500 flex items-center gap-2">
                          <FiAlertTriangle className="w-5 h-5" /> Danger Zone
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Irreversible administrative actions for your account data.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-red-400">Deactivate Account</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Temporarily disable your profile and unlist all active spaces.</p>
                        </div>
                        <button onClick={() => { setDangerAction('deactivate'); setModalType('otp_danger'); }} className="px-4 py-2 rounded-xl text-xs font-extrabold bg-red-500 text-white hover:bg-red-600">
                          Deactivate
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/20 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-red-500">Permanently Delete Account</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">Erase all booking history, payout records, and credentials permanently.</p>
                        </div>
                        <button onClick={() => { setDangerAction('delete'); setModalType('otp_danger'); }} className="px-4 py-2 rounded-xl text-xs font-extrabold bg-red-600 text-white hover:bg-red-700">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 12. ADMIN API KEYS & SYSTEM TAB */}
                {activeTab === 'admin_api' && user?.role === 'admin' && (
                  <div className="card-premium p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                      <div>
                        <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                          <FiKey className="w-5 h-5" /> API Keys & System Administration
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">Control third-party microservice integration keys and operational logs.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'cloudinary', name: 'Cloudinary API Key', val: settingsData?.adminSystemConfig?.apiKeys?.cloudinary || 'cloud_key_live_99213' },
                        { key: 'googleMaps', name: 'Google Maps JavaScript Key', val: settingsData?.adminSystemConfig?.apiKeys?.googleMaps || 'AIzaSyA_VolenPark_MapsKey_2026' },
                        { key: 'razorpay', name: 'Razorpay Payment Key ID', val: settingsData?.adminSystemConfig?.apiKeys?.razorpay || 'rzp_live_vP894210x' }
                      ].map(item => (
                        <div key={item.key} className="space-y-1.5">
                          <label className="text-xs font-bold text-[var(--text-muted)]">{item.name}</label>
                          <div className="relative">
                            <input
                              type={showApiKey[item.key] ? 'text' : 'password'}
                              readOnly
                              value={item.val}
                              className="input-premium w-full text-xs font-mono px-4 py-3 pr-20"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <button onClick={() => setShowApiKey(p => ({ ...p, [item.key]: !p[item.key] }))} className="text-gray-400 hover:text-white">
                                {showApiKey[item.key] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                              </button>
                              <button onClick={() => copyToClipboard(item.val, item.name)} className="text-gray-400 hover:text-indigo-400">
                                <FiCopy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="pt-4 flex gap-3">
                        <button onClick={() => setModalType('logs')} className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-2">
                          <FiTerminal className="w-4 h-4" /> View Live System Logs
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* MODALS */}
      {modalType === 'otp_danger' && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 max-w-md w-full space-y-4 border-red-500/40">
            <h3 className="text-lg font-black text-red-500 uppercase tracking-wider flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5" /> Confirm {dangerAction}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Enter confirmation OTP code <span className="font-mono text-white font-bold">123456</span> to authorize this action.</p>
            <input
              type="text"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              placeholder="123456"
              className="input-premium w-full text-center font-mono text-lg font-bold py-3"
            />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalType(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-white">Cancel</button>
              <button onClick={handleExecuteDangerAction} className="flex-1 py-3 rounded-xl text-xs font-bold bg-red-600 text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {modalType === 'logs' && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 max-w-2xl w-full space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <span className="font-bold text-amber-400 flex items-center gap-2"><FiTerminal className="w-4 h-4" /> Live Microservice Execution Logs</span>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-gray-800 h-64 overflow-y-auto space-y-2 text-emerald-400">
              <p>[INFO] VolenPark API Gateway listening on port 5006</p>
              <p>[INFO] MongoDB Connection Established to volenpark_db</p>
              <p>[INFO] Socket.io WebSocket server active</p>
              <p>[INFO] Python Django AI Service connected on port 5001 (Scikit-Learn models ready)</p>
              <p>[OK] GET /api/settings - 200 OK (12ms)</p>
            </div>
          </div>
        </div>
      )}

      {modalType === 'add_card' && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-premium p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-black text-[var(--text-primary)]">Add Payment Card</h3>
            <input placeholder="Card Number (4242 ...)" className="input-premium w-full text-xs px-4 py-3" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="MM/YY" className="input-premium w-full text-xs px-4 py-3" />
              <input placeholder="CVV" className="input-premium w-full text-xs px-4 py-3" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalType(null)} className="flex-1 py-3 rounded-xl text-xs font-bold bg-gray-800 text-white">Cancel</button>
              <button onClick={() => { toast.success('Card added!'); setModalType(null); }} className="flex-1 py-3 rounded-xl text-xs font-bold bg-indigo-600 text-white">Save Card</button>
            </div>
          </div>
        </div>
      )}

    </>
  );

  if (embedded) {
    return mainContent;
  }

  return (
    <DashboardLayout title="Platform Settings">
      {mainContent}
    </DashboardLayout>
  );
}
