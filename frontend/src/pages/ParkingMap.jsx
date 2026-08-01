import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, IndianRupee, Star, ArrowLeft, CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { listSpots } from '../services/parking';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEMO_SPOTS = [
  { _id: '1', lat: 23.0225, lng: 72.5714, address: '12 SG Highway, Ahmedabad', pricePerHour: 30, rating: 4.5, isAvailable: true, slots: 3 },
  { _id: '2', lat: 23.033, lng: 72.585, address: 'Prahlad Nagar, Ahmedabad', pricePerHour: 20, rating: 4.2, isAvailable: true, slots: 5 },
  { _id: '3', lat: 23.015, lng: 72.565, address: 'Satellite, Ahmedabad', pricePerHour: 40, rating: 4.8, isAvailable: false, slots: 0 },
  { _id: '4', lat: 23.04, lng: 72.55, address: 'Vastrapur Lake', pricePerHour: 25, rating: 4.0, isAvailable: true, slots: 2 },
];

export default function ParkingMap() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);

  React.useEffect(() => {
    listSpots()
      .then(res => {
        setSpots(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setSpots([]);
        setLoading(false);
      });
  }, []);

  const handleBook = (spot) => {
    //     setToast(`✅ Booking request sent for "${spot.address.split(',')[0]}"!`);
    // setTimeout(() => setToast(''), 4000);
    navigate(`/book/${spot._id}`);
  };

  return (
    <div className="flex h-screen bg-[var(--bg-page)] overflow-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-color)] flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate('/owner')} className="p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all text-[var(--text-muted)]">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-black text-[var(--text-primary)] flex items-center gap-2">
                <MapPin className="w-4.5 h-4.5 text-indigo-500" /> Find Parking
              </h1>
              <p className="text-xs text-[var(--text-muted)]">{spots.filter(s => s.availableSlots > 0).length} spots available</p>
            </div>
          </div>

          <div className="space-y-3 mb-2">
            <div className="relative">
              <input type="text" placeholder="Search location..." className="input-premium w-full text-sm py-2.5" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <Badge variant="outline" className="cursor-pointer whitespace-nowrap bg-[var(--bg-card)]">💰 Price</Badge>
              <Badge variant="outline" className="cursor-pointer whitespace-nowrap bg-[var(--bg-card)]">📏 Distance</Badge>
              <Badge variant="outline" className="cursor-pointer whitespace-nowrap bg-[var(--bg-card)]">⭐ Rating</Badge>
              <Badge variant="info" className="cursor-pointer whitespace-nowrap bg-indigo-500/10">✨ AI Pick</Badge>
            </div>
          </div>
        </div>

        {/* Spot List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {spots.map((spot, i) => (
            <motion.div
              key={spot._id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(spot._id === selected ? null : spot._id)}
              className={`
                rounded-2xl border p-4 cursor-pointer transition-all
                ${selected === spot._id
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-[var(--border-color)] hover:border-indigo-500/25 hover:bg-[var(--bg-card-hover)]'}
                ${!spot.availableSlots ? 'opacity-50' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{spot.parkingName || spot.address}</p>
                <Badge variant={spot.availableSlots > 0 ? 'success' : 'danger'}>{spot.availableSlots > 0 ? 'Open' : 'Full'}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
                <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />₹{spot.hourlyPrice}/hr</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{spot.rating || '4.5'}</span>
                <span>{spot.availableSlots}/{spot.totalSlots} slots</span>
              </div>
              {spot.availableSlots > 0 && (
                <Button size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); handleBook(spot); }}>
                  Book Now
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </aside>

      {/* Map */}
      <main className="flex-1 relative">
        <MapContainer center={[23.0225, 72.5714]} zoom={13} className="w-full h-full z-0">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {spots.map(spot => {
            const latitude = spot.location?.latitude || spot.latitude || spot.lat;
            const longitude = spot.location?.longitude || spot.longitude || spot.lng;
            if (!latitude || !longitude) return null;
            return (
              <Marker key={spot._id} position={[latitude, longitude]}>
                <Popup>
                  <div className="min-w-[180px]">
                    <p className="font-bold text-sm mb-1">{spot.parkingName || spot.address}</p>
                    <p className="text-xs text-gray-500 mb-2">₹{spot.hourlyPrice}/hr · {spot.availableSlots > 0 ? '🟢 Available' : '🔴 Full'}</p>
                    {spot.availableSlots > 0 && (
                      <button onClick={() => handleBook(spot)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all">
                        Book This Spot
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </main>
    </div>
  );
}
