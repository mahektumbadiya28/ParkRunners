import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, BarChart3, TrendingUp, ShieldAlert, LayoutDashboard, Settings, User, CheckCircle, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Input from '../components/ui/Input';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AdminUsers from './AdminUsers';
import AdminBookings from './AdminBookings';
import AdminSettings from './AdminSettings';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        const s = await API.get('/admin/dashboard');
        setStats(s.data.data);
      } catch {
        setStats({ totalUsers: 0, totalSpots: 0, totalBookings: 0, totalRevenue: 0, pendingSpots: 0, chartData: [] });
      } finally { setLoading(false); }
    })();
  }, []);

  const SIDEBAR_ITEMS = [
    { icon: Users, label: 'Users', activeId: 'users' },
    { icon: MapPin, label: 'Spots', activeId: 'approvals' },
    { icon: BarChart3, label: 'Bookings', activeId: 'bookings' },
  ];

  const TOP_NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Overview', activeId: 'overview' },
    { icon: User, label: 'Profile', activeId: 'profile' },
    { icon: Settings, label: 'Settings', activeId: 'settings' }
  ];

  return (
    <DashboardLayout 
      title=""
      navItems={SIDEBAR_ITEMS.map(item => ({
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      }))}
      topNavItems={TOP_NAV_ITEMS.map(item => ({
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      }))}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[var(--text-primary)]">Command Center</h2>
        <p className="text-[var(--text-muted)] mt-1">Monitor platform health, manage users, and configure settings.</p>
      </div>

      {activeTab === 'overview' && (
        <>
          {stats?.pendingSpots > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 text-amber-500 p-4 rounded-xl text-sm font-semibold mb-6"
            >
              <ShieldAlert className="w-5 h-5" />
              {stats.pendingSpots} parking spot(s) awaiting your approval. Switch to the "Approvals" tab.
            </motion.div>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)
            ) : stats && [
              { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'indigo' },
              { title: 'Total Spots', value: stats.totalSpots, icon: MapPin, color: 'purple' },
              { title: 'Total Bookings', value: stats.totalBookings, icon: BarChart3, color: 'cyan' },
              { title: 'Revenue (₹)', value: stats.totalRevenue, icon: TrendingUp, color: 'green' },
            ].map((s, i) => (
              <StatCard key={s.title} {...s} delay={i * 0.1} />
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Revenue Overview</h3>
            <div className="h-[300px] w-full">
              {loading ? (
                <div className="skeleton w-full h-full rounded-xl"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.chartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'var(--bg-card)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </>
      )}

      {activeTab === 'users' && <AdminUsers />}

      {activeTab === 'bookings' && <AdminBookings />}

      {activeTab === 'settings' && <AdminSettings />}

      {activeTab === 'approvals' && (
        <div className="card-premium py-16 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
          <p className="font-semibold text-[var(--text-primary)]">Approval System</p>
          <p className="text-sm text-[var(--text-muted)]">Spot approval controls will be displayed here.</p>
        </div>
      )}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-cyan-600 via-blue-500 to-indigo-600">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
            <div className="px-6 pb-6 sm:px-10 relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 sm:-mt-16">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--bg-page)] bg-[var(--bg-card)] flex items-center justify-center shadow-xl overflow-hidden relative group cursor-pointer">
                 <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-4xl">
                   {(user?.name || user?.fullName || 'System Admin').charAt(0).toUpperCase()}
                 </div>
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                 </div>
              </div>
              <div className="flex-1 pb-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{user?.name || user?.fullName || 'System Admin'}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="info" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Root Access</Badge>
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-4 h-4"/> Global Server</span>
                </div>
              </div>
              <div className="pb-2 flex gap-3 w-full sm:w-auto">
                 <Button variant="outline" className="flex-1 sm:flex-none">Audit Logs</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><User className="w-4 h-4 text-cyan-500"/> Admin Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.email || 'admin@volenpark.com'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Security Clearance</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">Level 5 (Max)</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Last Login</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">Just Now</p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">System Normal</h4>
                    <p className="text-xs text-[var(--text-muted)]">All services operational.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-6">Security & Authentication</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Admin Name" placeholder="Super Admin" value={user?.name || user?.fullName || 'Super Admin'} readOnly />
                  <Input label="Admin Email" placeholder="admin@volenpark.com" value={user?.email || 'admin@volenpark.com'} readOnly />
                  <Input label="2FA Status" placeholder="Enabled via Authenticator" value="Enabled via Authenticator" readOnly />
                  <Input label="Session Timeout" placeholder="30 Minutes" value="30 Minutes" readOnly />
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex justify-end">
                  <Button variant="primary" className="bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/30">Update Security Settings</Button>
                </div>
              </div>

              <div className="card-premium p-6 border-red-500/20 bg-red-500/5">
                <h4 className="font-bold text-red-500 mb-2">Emergency Lockdown</h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">Temporarily freeze all user actions across the platform in case of a critical security breach.</p>
                <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white">Initiate Lockdown</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
