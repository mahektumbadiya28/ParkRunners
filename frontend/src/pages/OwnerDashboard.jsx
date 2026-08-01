import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, MapPin, Clock, CheckCircle, XCircle, LayoutDashboard, Settings, User } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { listMyBookings, bookingAction } from '../services/parking';

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
  ];

  const TOP_NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', activeId: 'dashboard' },
    { icon: User, label: 'Profile', activeId: 'profile' },
    { icon: Settings, label: 'Settings', activeId: 'settings' }
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
        <div className="card-premium p-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Owner Profile</h3>
          <p className="text-[var(--text-muted)]">Profile settings are coming soon.</p>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="card-premium p-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Account Settings</h3>
          <p className="text-[var(--text-muted)]">Account settings are coming soon.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
