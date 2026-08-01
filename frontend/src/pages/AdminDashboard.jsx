import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, BarChart3, TrendingUp, ShieldAlert, LayoutDashboard, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import API from '../services/api';

import AdminUsers from './AdminUsers';
import AdminBookings from './AdminBookings';
import AdminSettings from './AdminSettings';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview', to: '/admin' },
  { icon: Users, label: 'Users', to: '/admin' },
  { icon: MapPin, label: 'Spots', to: '/admin' },
  { icon: BarChart3, label: 'Analytics', to: '/admin' },
  { icon: Settings, label: 'Settings', to: '/admin' },
];

export default function AdminDashboard() {
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

  const TABS = ['overview', 'users', 'bookings', 'settings', 'approvals'];

  return (
    <DashboardLayout navItems={NAV} title="Admin Console">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-[var(--text-primary)]">Command Center ⚡</h2>
        <p className="text-[var(--text-muted)] mt-1">Monitor platform health, manage users, and configure settings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-card-hover)] p-1 rounded-xl mb-8 w-fit overflow-x-auto max-w-full no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all ${activeTab === tab
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
          >
            {tab}
          </button>
        ))}
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
    </DashboardLayout>
  );
}
