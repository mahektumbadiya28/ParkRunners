import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, MapPin, Clock, CheckCircle, XCircle, LayoutDashboard, Settings, User } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { listMyBookings, bookingAction } from '../services/parking';
import { useAuth } from '../context/AuthContext';
import SettingsPage from './SettingsPage';

const statusVariant = {
  pending: 'warning', confirmed: 'info', completed: 'success', cancelled: 'danger',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 }
});

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchBookings = async () => {
    try {
      const data = await listMyBookings();
      setBookings(Array.isArray(data) ? data : data.data || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    completed: bookings.filter(b => b.bookingStatus === 'completed').length,
    spent: bookings.filter(b => b.bookingStatus === 'completed').reduce((s, b) => s + (b.totalAmount || 0), 0),
  };

  const handleCancel = async (id) => {
    try { await bookingAction(id, 'cancel'); fetchBookings(); }
    catch (e) { alert(e.message); }
  };

  const SIDEBAR_ITEMS = [
    { icon: MapPin, label: 'Find Parking', to: '/map' },
    { icon: Car, label: 'My Vehicles', activeId: 'vehicles' },
    { icon: Settings, label: 'Settings', activeId: 'settings' }
  ];

  const TOP_NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', activeId: 'dashboard' },
    { icon: User, label: 'Profile', activeId: 'profile' },
    { icon: Settings, label: 'Settings', to: '/settings' }
  ];

  return (
    <DashboardLayout
      title=""
      navItems={SIDEBAR_ITEMS.map(item => item.activeId ? {
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      } : { icon: item.icon, label: item.label, to: item.to })}
      topNavItems={TOP_NAV_ITEMS.map(item => ({
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      }))}
    >
      {activeTab === 'dashboard' && (
        <>
          {/* Welcome */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Your Parking Hub</h2>
            <p className="text-[var(--text-muted)] mt-1">Track bookings, find spots, and manage your garage from one place.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Bookings" value={stats.total} icon={Car} color="indigo" delay={0} />
            <StatCard title="Active Now" value={stats.active} icon={Clock} color="cyan" delay={0.1} />
            <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" delay={0.2} />
            <StatCard title="Total Spent" value={stats.spent} prefix="₹" icon={MapPin} color="purple" delay={0.3} />
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <motion.div {...fadeUp(0.1)} className="card-premium p-6 cursor-pointer group" onClick={() => navigate('/map')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">Find Parking</p>
                  <p className="text-sm text-[var(--text-muted)]">Browse spots on interactive map</p>
                </div>
              </div>
            </motion.div>
            <motion.div {...fadeUp(0.15)} className="card-premium p-6 cursor-pointer group" onClick={() => navigate('/payment')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)]">My Vehicles</p>
                  <p className="text-sm text-[var(--text-muted)]">Manage your garage & history</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bookings Table */}
          <motion.div {...fadeUp(0.2)} className="card-premium overflow-hidden">
            <div className="px-6 py-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="font-bold text-[var(--text-primary)]">Recent Bookings</h3>
              <Badge variant="info">{bookings.length} total</Badge>
            </div>

            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center">
                <Car className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                <p className="font-semibold text-[var(--text-primary)]">No bookings yet</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Find a spot on the map to get started!</p>
                <Button size="sm" onClick={() => navigate('/map')} icon={MapPin}>Browse Map</Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {bookings.map(b => (
                  <div key={b._id} onClick={() => ['pending', 'confirmed', 'active', 'moving', 'parked', 'returning'].includes(b.bookingStatus) && navigate(`/tracking/${b._id}`)} className={`flex items-center justify-between px-6 py-4 transition-colors ${['pending', 'confirmed', 'active', 'moving', 'parked', 'returning'].includes(b.bookingStatus) ? 'cursor-pointer hover:bg-[var(--bg-card-hover)]' : ''}`}>
                    <div>
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{b.parkingId?.parkingName || b.parkingId?.address || 'Parking Spot'}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">₹{b.totalAmount} · {new Date(b.startTime).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[b.bookingStatus] || 'info'}>{b.bookingStatus ? b.bookingStatus.replace('_', ' ') : 'unknown'}</Badge>
                      {b.bookingStatus === 'pending' && (
                        <button onClick={(e) => { e.stopPropagation(); handleCancel(b._id); }} className="text-red-400 hover:text-red-300 transition-colors p-1">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}

      {activeTab === 'vehicles' && (
        <div className="card-premium p-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">My Vehicles</h3>
          <p className="text-[var(--text-muted)]">Vehicle management is coming soon.</p>
        </div>
      )}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
            <div className="px-6 pb-6 sm:px-10 relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 sm:-mt-16">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--bg-page)] bg-[var(--bg-card)] flex items-center justify-center shadow-xl overflow-hidden relative group cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-4xl">
                  {(user?.name || user?.fullName || 'Car Owner').charAt(0).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                </div>
              </div>
              <div className="flex-1 pb-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{user?.name || user?.fullName || 'Car Owner'}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified Member</Badge>
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-4 h-4" /> Default: Mumbai</span>
                </div>
              </div>
              <div className="pb-2 flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">Share Profile</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> Personal Info</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.email || 'owner@volenpark.com'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Phone Number</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.phone || '+91 98765 43210'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Member Since</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">August 2026</p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">Trusted Parker</h4>
                    <p className="text-xs text-[var(--text-muted)]">Completed {stats.completed} bookings seamlessly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-6">Account Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" placeholder="John Doe" value={user?.name || user?.fullName || 'John Doe'} readOnly />
                  <Input label="Email" placeholder="owner@volenpark.com" value={user?.email || 'owner@volenpark.com'} readOnly />
                  <Input label="Phone Number" placeholder="+91 98765 43210" value={user?.phone || '+91 98765 43210'} readOnly />
                  <Input label="Default City" placeholder="Mumbai" value="Mumbai" readOnly />
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex justify-end">
                  <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30">Save Changes</Button>
                </div>
              </div>

              <div className="card-premium p-6 border-red-500/20 bg-red-500/5">
                <h4 className="font-bold text-red-500 mb-2">Danger Zone</h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">Permanently delete your account and all booking history. This action cannot be undone.</p>
                <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white">Delete Account</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === 'settings' && <SettingsPage embedded={true} />}
    </DashboardLayout>
  );
}
