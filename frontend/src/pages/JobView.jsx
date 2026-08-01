import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, Camera, CheckCircle, Shield, Key, Navigation } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { bookingAction } from '../services/parking';
import toast from 'react-hot-toast';

export default function JobView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [status, setStatus] = useState('confirmed');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [inspection, setInspection] = useState({ front: false, back: false, left: false, right: false, interior: false });
  const [otp, setOtp] = useState('');

  // AI Damage Check State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [damageReport, setDamageReport] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/bookings/${id}`);
        setJob(res.data.data);
        setStatus(res.data.data.bookingStatus);
      } catch (err) {
        toast.error('Failed to load job');
        navigate('/valet');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      await bookingAction(id, action);

      // Update local state based on action
      if (action === 'receive_car') setStatus('active');
      if (action === 'moving') setStatus('moving');
      if (action === 'parked') {
        setStatus('parked');
        // also submit inspection here in a real flow
      }

      toast.success('Status updated successfully!');
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveCar = (e) => {
    e.preventDefault();
    if (otp !== '1234') {
      toast.error('Invalid OTP. Please check with customer.');
      return;
    }
    handleAction('receive_car');
  };

  const runAiInspection = () => {
    const allChecked = Object.values(inspection).every(Boolean);
    if (!allChecked) {
      toast.error('Please capture all required angles first.');
      return;
    }

    setAiAnalyzing(true);
    // Mock calling the Django AI Service
    setTimeout(() => {
      setAiAnalyzing(false);
      setDamageReport({
        detected: true,
        issues: ['Minor scratch on front bumper', 'Dent on left door'],
        confidence: '94%'
      });
      toast('AI Inspection Complete', { icon: '🤖' });
    }, 2500);
  };

  return (
    <DashboardLayout title="Active Job">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/valet')} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {loading || !job ? (
          <div className="card-premium p-6 mb-6">
            <div className="skeleton h-24 w-full rounded-xl"></div>
          </div>
        ) : (
          <div className="card-premium p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)]">Booking #{job.bookingId || job._id.slice(-6).toUpperCase()}</h2>
                <p className="text-[var(--text-muted)] mt-1 flex items-center gap-1.5"><Car className="w-4 h-4" /> {job.vehicleId?.brand} {job.vehicleId?.model} • {job.vehicleId?.vehicleNumber}</p>
              </div>
              <Badge variant="info">{status.replace('_', ' ').toUpperCase()}</Badge>
            </div>

            <div className="bg-[var(--bg-card-hover)] p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Customer</p>
                <p className="font-semibold text-[var(--text-primary)]">{job.ownerId?.fullName || 'Unknown'}</p>
                <p className="text-xs text-[var(--text-muted)]">{job.ownerId?.phone || 'No phone'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1">Destination</p>
                <p className="font-semibold text-[var(--text-primary)]">{job.parkingId?.parkingName || 'Parking Spot'}</p>
                <p className="text-xs text-[var(--text-muted)]">{job.parkingId?.address}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Handover & OTP */}
        {status === 'confirmed' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2"><Key className="text-indigo-500" /> Customer Handover</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Verify the customer's OTP before taking the keys.</p>

            <form onSubmit={handleReceiveCar} className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Enter 4-digit OTP (e.g. 1234)"
                maxLength={4}
                required
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="input-premium flex-1 text-center tracking-[0.5em] text-lg py-3 font-mono"
              />
              <Button type="submit" loading={actionLoading}>Verify & Receive</Button>
            </form>
          </motion.div>
        )}

        {/* Step 2: Inspection */}
        {status === 'active' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2"><Shield className="text-emerald-500" /> Vehicle Inspection</h3>
              <p className="text-sm text-[var(--text-muted)]">Capture images of the vehicle for AI Damage Analysis before parking.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(inspection).map(angle => (
                <div key={angle} onClick={() => setInspection(prev => ({ ...prev, [angle]: !prev[angle] }))} className={`p-4 rounded-xl border-2 border-dashed cursor-pointer text-center transition-all ${inspection[angle] ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--border-color)] hover:border-indigo-500/50 hover:bg-[var(--bg-card-hover)]'}`}>
                  {inspection[angle] ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  ) : (
                    <Camera className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
                  )}
                  <p className="text-xs font-bold text-[var(--text-primary)] capitalize">{angle}</p>
                </div>
              ))}
            </div>

            {damageReport ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <p className="font-bold text-red-500 flex items-center gap-2 mb-2"><Shield className="w-4 h-4" /> AI Damage Report</p>
                <ul className="text-sm text-red-400 list-disc list-inside mb-2">
                  {damageReport.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                </ul>
                <p className="text-xs text-red-500/70">Confidence: {damageReport.confidence}</p>
              </div>
            ) : (
              <Button variant="outline" className="w-full border-dashed" onClick={runAiInspection} loading={aiAnalyzing}>
                {aiAnalyzing ? 'Analyzing Images via AI...' : 'Run AI Damage Check'}
              </Button>
            )}

            <Button className="w-full" onClick={() => handleAction('moving')} loading={actionLoading}>
              Inspection Complete - Move Vehicle
            </Button>
          </motion.div>
        )}

        {/* Step 3: Moving to Park */}
        {status === 'moving' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 text-center py-12">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-500 border-t-transparent animate-spin"></div>
              <Car className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Moving to Parking</h3>
            <p className="text-[var(--text-muted)] text-sm mb-8">Drive carefully to SG Highway Parking, Slot A-12.</p>

            <Button size="lg" className="px-12" onClick={() => handleAction('parked')} loading={actionLoading}>
              Mark as Parked
            </Button>
          </motion.div>
        )}

        {/* Step 4: Parked (Waiting for return request) */}
        {status === 'parked' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 text-center py-12">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Parked Successfully</h3>
            <p className="text-[var(--text-muted)] text-sm mb-4">The vehicle is secure. You will be notified when the owner requests it back.</p>
            <Button variant="outline" onClick={() => navigate('/valet')}>Return to Dashboard</Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
