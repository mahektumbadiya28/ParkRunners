import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Clock, CheckCircle, LayoutDashboard, Settings, Briefcase } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { listAvailableJobs, bookingAction } from '../services/parking';
import { io } from 'socket.io-client';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/valet' },
  { icon: Briefcase, label: 'Available Jobs', to: '/valet' },
  { icon: Settings, label: 'Settings', to: '/valet' },
];

export default function ValetDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  // const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

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
    setActionLoading(id + action);
    try { await bookingAction(id, action); fetchJobs(); }
    catch (e) { alert('Action failed: ' + e.message); }
    finally { setActionLoading(null); }
  };

  const accepted = jobs.filter(j => j.bookingStatus === 'confirmed' || j.bookingStatus === 'active').length;
  const pending = jobs.filter(j => j.bookingStatus === 'pending').length;

  return (
    <DashboardLayout navItems={NAV} title="Valet Command">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Job Board 🔑</h2>
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
    </DashboardLayout>
  );
}
