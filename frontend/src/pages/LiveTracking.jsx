import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { io } from 'socket.io-client';
import { ArrowLeft, MapPin, Navigation, Clock, CheckCircle, Car, Shield } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { bookingAction, listSpots } from '../services/parking'; // We'll need a getBooking call, wait, bookingAction is exported from parking.js
// Let's actually import `API` directly or add getBooking. Let's add getBooking.
import toast from 'react-hot-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';

const STATUS_STEPS = [
  { id: 'pending', label: 'Requested' },
  { id: 'confirmed', label: 'Valet Assigned' },
  { id: 'car_received', label: 'Vehicle Received' },
  { id: 'moving', label: 'Moving To Parking' },
  { id: 'parked', label: 'Parked Successfully' },
  { id: 'returning', label: 'Vehicle Returning' },
  { id: 'completed', label: 'Vehicle Delivered' },
];

export default function LiveTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('confirmed'); // Mock initial status
  const [eta, setEta] = useState('5 mins');
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    import('../services/api').then(({ default: API }) => {
      API.get(`/bookings/${id}`).then(res => {
        if (res.data?.success) {
          setStatus(res.data.data.bookingStatus || 'pending');
        }
      }).catch(err => console.error(err));
    });
    
    const socket = io(SOCKET_URL);
    
    socket.on('booking_update', (data) => {
      if (data.bookingId === id) {
        setStatus(data.status);
        if(data.status === 'parked') toast.success('Your car is safely parked!');
        if(data.status === 'completed') toast.success('Car delivered. Trip complete!');
      }
    });

    return () => socket.disconnect();
  }, [id]);

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === status) || 0;

  const handleBringMyCar = async () => {
    setLoadingAction(true);
    try {
      await bookingAction(id, 'bring_my_car');
      toast.success('Valet is on the way with your car!');
      setStatus('returning');
    } catch (e) {
      toast.error('Action failed. Try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleComplete = async () => {
    setLoadingAction(true);
    try {
      await bookingAction(id, 'complete');
      toast.success('Thanks for using VolenPark!');
      navigate(`/payment/${id}`);
    } catch (e) {
      toast.error('Action failed.');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <DashboardLayout title="Live Tracking">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/owner')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tracking Info & Timeline */}
          <div className="space-y-6">
            <div className="card-premium p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">Valet Tracking</h2>
                  <p className="text-[var(--text-muted)] text-sm mt-1">Booking #{id.slice(-6).toUpperCase()}</p>
                </div>
                <Badge variant="info" className="animate-pulse flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> Live ETA: {eta}</Badge>
              </div>

              {/* Valet Profile */}
              <div className="bg-[var(--bg-card-hover)] p-4 rounded-xl flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <span className="text-xl font-bold text-indigo-500">JD</span>
                </div>
                <div>
                  <p className="font-bold text-[var(--text-primary)] flex items-center gap-1">John Doe <Shield className="w-3.5 h-3.5 text-emerald-500" /></p>
                  <p className="text-xs text-[var(--text-muted)]">⭐ 4.9 • 120 Trips</p>
                </div>
                <Button size="sm" variant="outline" className="ml-auto">Contact</Button>
              </div>

              {/* Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-[var(--border-color)]">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isActive = index === currentStepIndex;
                  const isPending = index > currentStepIndex;

                  return (
                    <div key={step.id} className={`relative flex items-center gap-4 ${isPending ? 'opacity-40' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                        isCompleted ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 
                        isActive ? 'bg-indigo-500 shadow-lg shadow-indigo-500/40 animate-pulse' : 
                        'bg-[var(--bg-card)] border-2 border-[var(--border-color)]'
                      }`}>
                        {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        {isActive && <Clock className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <p className={`font-semibold text-sm ${isActive ? 'text-indigo-500' : 'text-[var(--text-primary)]'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-[var(--border-color)]">
                {status === 'parked' && (
                  <Button onClick={handleBringMyCar} loading={loadingAction} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 border-0" icon={Car}>
                    Bring My Car
                  </Button>
                )}
                {status === 'returning' && (
                  <Button onClick={handleComplete} loading={loadingAction} className="w-full bg-emerald-500 hover:bg-emerald-600 border-0 text-white" icon={CheckCircle}>
                    Mark as Received
                  </Button>
                )}
                {['pending', 'confirmed', 'car_received', 'moving'].includes(status) && (
                  <p className="text-sm text-center text-[var(--text-muted)]">Wait for valet to park your vehicle.</p>
                )}
                {status === 'completed' && (
                  <p className="text-sm text-center text-emerald-500 font-semibold">Booking Completed. Proceed to payment.</p>
                )}
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="h-[600px] rounded-2xl overflow-hidden border border-[var(--border-color)] relative z-0">
            <MapContainer center={[23.0225, 72.5714]} zoom={14} className="w-full h-full">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[23.0225, 72.5714]}>
                <Popup>Valet Location</Popup>
              </Marker>
            </MapContainer>
            
            {/* Overlay Gradient for aesthetics */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] z-[400]"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
