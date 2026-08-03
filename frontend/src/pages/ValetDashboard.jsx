import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Clock, CheckCircle, LayoutDashboard, Settings, Briefcase, User, MapPin } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { listAvailableJobs, bookingAction } from '../services/parking';
import { useAuth } from '../context/AuthContext';
import SettingsPage from './SettingsPage';
import { io } from 'socket.io-client';

export default function ValetDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = location.pathname.split('/')[2] || 'dashboard';
  
  const setActiveTab = (tab) => navigate(`/valet/${tab}`);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  // const [actionLoading, setActionLoading] = useState(null);

  const fetchJobs = async () => {
    try {
      const data = await listAvailableJobs();
      setJobs(Array.isArray(data) ? data : data.data || []);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchJobs();

    // Socket.io for live updates
    const socket = io('http://localhost:5006', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Valet connected to real-time socket');
    });

    socket.on('booking_update', () => {
      // Refresh list when a booking updates
      fetchJobs();
    });

    return () => socket.disconnect();
  }, []);

  const handleAction = async (id, action) => {
    // setActionLoading(id + action);
    try { await bookingAction(id, action); fetchJobs(); }
    catch (e) { alert('Action failed: ' + e.message); }
    // finally { setActionLoading(null); }
  };

  const accepted = jobs.filter(j => j.bookingStatus === 'confirmed' || j.bookingStatus === 'active').length;
  const pending = jobs.filter(j => j.bookingStatus === 'pending').length;

  const SIDEBAR_ITEMS = [
    { icon: Briefcase, label: 'Available Jobs', activeId: 'jobs' },
    { icon: Settings, label: 'Settings', to: '/settings' }
  ];

  const TOP_NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', activeId: 'dashboard' },
    { icon: User, label: 'Profile', activeId: 'profile' },
    { icon: Settings, label: 'Settings', to: '/settings' }
  ];

  return (
    <DashboardLayout
      title=""
      navItems={SIDEBAR_ITEMS.map(item => (item.activeId ? {
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      } : { icon: item.icon, label: item.label, to: item.to }))}
      topNavItems={TOP_NAV_ITEMS.map(item => (item.to ? { icon: item.icon, label: item.label, to: item.to } : {
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      }))}
    >
      {activeTab === 'dashboard' && (
        <>
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">Job Board</h2>
              <p className="text-[var(--text-muted)] mt-1">Accept jobs, inspect vehicles, and complete bookings.</p>
            </div>

            <div className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-2 rounded-xl">
              <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-gray-400'}`}></span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{isOnline ? 'Online' : 'Offline'}</span>
              <label className="relative ml-2">
                <input type="checkbox" checked={isOnline} onChange={() => setIsOnline(!isOnline)} className="sr-only" />
                <div className={`w-10 h-5 rounded-full transition-colors ${isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${isOnline ? 'translate-x-5.5 left-0' : 'translate-x-0.5'}`} />
                </div>
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard title="Total Jobs" value={jobs.length} icon={Briefcase} color="purple" delay={0} />
            <StatCard title="Open" value={pending} icon={Clock} color="cyan" delay={0.1} />
            <StatCard title="Accepted" value={accepted} icon={CheckCircle} color="green" delay={0.2} />
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton h-44 w-full rounded-2xl" />)
            ) : jobs.length === 0 ? (
              <div className="card-premium py-16 text-center">
                <Car className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
                <p className="font-semibold text-[var(--text-primary)]">No jobs right now</p>
                <p className="text-sm text-[var(--text-muted)]">New bookings will appear here automatically.</p>
              </div>
            ) : (
              jobs.map((job, i) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="card-premium p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{job.parkingId?.parkingName || job.parkingId?.address || 'Parking Spot'}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {job.startTime} → {job.endTime} ({job.duration} hr)
                      </p>
                      {job.ownerId && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          Customer: <span className="font-semibold text-[var(--text-primary)]">{job.ownerId.fullName}</span>
                        </p>
                      )}
                    </div>
                    <Badge variant={job.bookingStatus === 'pending' ? 'warning' : job.bookingStatus === 'confirmed' ? 'info' : 'success'}>
                      {job.bookingStatus || 'pending'}
                    </Badge>
                  </div>
                  <div className="flex gap-3 mt-5">
                    {job.bookingStatus === 'pending' ? (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => handleAction(job._id, 'accept')}
                      >
                        Accept Job
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-indigo-500 border-indigo-500 hover:bg-indigo-500 hover:text-white"
                        onClick={() => navigate(`/valet/job/${job._id}`)}
                      >
                        View Active Job
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'jobs' && (
        <div className="card-premium p-6 text-center">
          <Car className="w-10 h-10 mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Available Jobs</h3>
          <p className="text-[var(--text-muted)]">Check your dashboard for active jobs.</p>
          <Button size="sm" onClick={() => setActiveTab('dashboard')} className="mt-4">Go to Dashboard</Button>
        </div>
      )}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500">
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
            <div className="px-6 pb-6 sm:px-10 relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 sm:-mt-16">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--bg-page)] bg-[var(--bg-card)] flex items-center justify-center shadow-xl overflow-hidden relative group cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-4xl">
                  {(user?.name || user?.fullName || 'Valet Driver').charAt(0).toUpperCase()}
                </div>
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                </div>
              </div>
              <div className="flex-1 pb-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{user?.name || user?.fullName || 'Valet Driver'}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> KYC Verified</Badge>
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-4 h-4" /> Assigned: Park Runners Hub</span>
                </div>
              </div>
              <div className="pb-2 flex gap-3 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none">View Rating</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> Driver Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.email || 'valet@volenpark.com'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Phone Number</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.phone || '+91 88888 77777'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Experience</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">3 Years</p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6 bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">Active Status</h4>
                    <p className="text-xs text-[var(--text-muted)]">Currently online and accepting jobs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-6">Identity & Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" placeholder="Alex Valet" value={user?.name || user?.fullName || 'Alex Valet'} readOnly />
                  <Input label="Driving License" placeholder="DL-14-XXXXXXX" value="DL-14-XXXXXXX" readOnly />
                  <Input label="Aadhaar Number" placeholder="XXXX-XXXX-1234" value="XXXX-XXXX-1234" readOnly />
                  <Input label="Employee ID" placeholder="VP-VAL-001" value="VP-VAL-001" readOnly />
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex justify-end">
                  <Button variant="primary" className="bg-blue-600 hover:bg-blue-500 shadow-blue-500/30">Update Documents</Button>
                </div>
              </div>

              <div className="card-premium p-6 border-red-500/20 bg-red-500/5">
                <h4 className="font-bold text-red-500 mb-2">Resignation Request</h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">Request termination of your valet contract. Requires 14 days notice period.</p>
                <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white">Submit Request</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* {activeTab === 'settings' && (
        <div className="card-premium p-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Account Settings</h3>
          <p className="text-[var(--text-muted)]">Account settings are coming soon.</p>
        </div>
      )} */}
      {activeTab === 'settings' && <SettingsPage embedded={true} />}
    </DashboardLayout>
  );
}
