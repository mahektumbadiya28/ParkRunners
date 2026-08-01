import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Car, CheckCircle, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { bookSpot } from '../services/parking';
import { getVehicles } from '../services/vehicle';
import toast from 'react-hot-toast';

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    duration: 2, // hours
    vehicleId: '',
    requireValet: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVehicles().then(res => {
      setVehicles(res.data || []);
      if(res.data?.length > 0) {
        setForm(f => ({ ...f, vehicleId: res.data[0]._id }));
      }
    });
  }, []);

  const handleNext = () => {
    if (step === 2 && !form.vehicleId) {
      toast.error('Please select a vehicle to continue');
      return;
    }
    setStep(s => s + 1);
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      // In a real app, we'd pass all booking details including startTime, duration, vehicle, valet
      // We will send this to a generalized booking endpoint.
      await bookSpot(id, form);
      toast.success('Booking confirmed successfully!');
      navigate('/owner');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const pricePerHour = 50; // Mock rate, should be fetched from spot details
  const totalPrice = pricePerHour * form.duration + (form.requireValet ? 100 : 0);

  return (
    <DashboardLayout title="Book Parking">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--border-color)] -z-10 rounded-full">
            <motion.div className="h-full bg-indigo-500 rounded-full" initial={{ width: '0%' }} animate={{ width: `${(step - 1) * 50}%` }} transition={{ duration: 0.3 }} />
          </div>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-[var(--bg-card)] border-2 border-[var(--border-color)] text-[var(--text-muted)]'}`}>
              {s}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-premium p-6 md:p-8">
          
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">When do you need parking?</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block uppercase tracking-wider">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-premium w-full pl-12 py-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block uppercase tracking-wider">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                      <input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="input-premium w-full pl-12 py-3" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block uppercase tracking-wider">Duration (Hours)</label>
                    <select value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} className="input-premium w-full py-3 px-4 bg-[var(--bg-card)]">
                      {[1,2,3,4,5,6,12,24].map(h => <option key={h} value={h}>{h} Hours</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Select Vehicle & Services</h2>
              
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] mb-3 block uppercase tracking-wider">Choose your vehicle</label>
                {vehicles.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-red-500/30 bg-red-500/5 text-red-400 text-sm">
                    No vehicles found. Please add a vehicle first.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicles.map(v => (
                      <div key={v._id} onClick={() => setForm({...form, vehicleId: v._id})} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${form.vehicleId === v._id ? 'border-indigo-500 bg-indigo-500/5' : 'border-[var(--border-color)] hover:border-indigo-500/30'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Car className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-primary)]">{v.brand} {v.model}</p>
                            <p className="text-xs text-[var(--text-muted)]">{v.vehicleNumber}</p>
                          </div>
                        </div>
                        {form.vehicleId === v._id && <CheckCircle className="w-6 h-6 text-indigo-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-500" /> Valet Service</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">A verified valet will park your car (+₹100)</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={form.requireValet} onChange={e => setForm({...form, requireValet: e.target.checked})} className="sr-only" />
                    <div className={`w-12 h-6 rounded-full transition-colors ${form.requireValet ? 'bg-indigo-500' : 'bg-[var(--border-color)]'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.requireValet ? 'translate-x-6.5 left-0' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Booking Summary</h2>
              
              <div className="bg-[var(--bg-page)] rounded-xl p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Date & Time</span>
                  <span className="font-semibold text-[var(--text-primary)]">{form.date} at {form.startTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Duration</span>
                  <span className="font-semibold text-[var(--text-primary)]">{form.duration} Hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Parking Fee</span>
                  <span className="font-semibold text-[var(--text-primary)]">₹{pricePerHour * form.duration}</span>
                </div>
                {form.requireValet && (
                  <div className="flex justify-between text-sm text-emerald-500">
                    <span>Valet Service</span>
                    <span className="font-semibold">₹100</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[var(--border-color)] flex justify-between">
                  <span className="font-bold text-[var(--text-primary)]">Total</span>
                  <span className="font-black text-xl text-indigo-500">₹{totalPrice}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex justify-end gap-3">
            {step === 3 ? (
              <Button onClick={handleBook} loading={loading} className="w-full md:w-auto px-8" icon={CheckCircle}>Confirm & Pay</Button>
            ) : (
              <Button onClick={handleNext} className="w-full md:w-auto px-8">Continue <ArrowRight className="w-4 h-4 ml-1" /></Button>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
