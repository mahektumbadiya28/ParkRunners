import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Plus, X, Shield, FileText, Image as ImageIcon, LayoutDashboard, MapPin, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getVehicles, addVehicle, deleteVehicle } from '../services/vehicle';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/owner' },
  { icon: MapPin, label: 'Find Parking', to: '/map' },
  { icon: Car, label: 'My Vehicles', to: '/owner/vehicles' },
  { icon: Settings, label: 'Settings', to: '/owner' },
];

export default function OwnerVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    vehicleNumber: '',
    brand: '',
    model: '',
    color: '',
    year: new Date().getFullYear(),
    vehicleType: 'Sedan',
    images: '',
    registrationCertificate: ''
  });

  const fetchVehicles = async () => {
    try {
      const res = await getVehicles();
      setVehicles(res.data || []);
    } catch (e) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        images: form.images ? form.images.split(',').map(s => s.trim()) : []
      };
      await addVehicle(data);
      toast.success('Vehicle added successfully!');
      setIsAddOpen(false);
      setForm({ vehicleNumber: '', brand: '', model: '', color: '', year: 2024, vehicleType: 'Sedan', images: '', registrationCertificate: '' });
      fetchVehicles();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Remove this vehicle?')) return;
    try {
      await deleteVehicle(id);
      toast.success('Vehicle removed');
      fetchVehicles();
    } catch(e) {
      toast.error('Failed to remove vehicle');
    }
  };

  return (
    <DashboardLayout navItems={NAV} title="My Vehicles">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">My Garage 🏎️</h2>
          <p className="text-[var(--text-muted)] mt-1">Manage your vehicles and documents.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} icon={Plus}>Add Vehicle</Button>
      </div>

      {loading ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="skeleton h-48 rounded-2xl"></div>)}
         </div>
      ) : vehicles.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <Car className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Vehicles Yet</h3>
          <p className="text-[var(--text-muted)] mb-6">Add a vehicle to start booking parking spots and valet services.</p>
          <Button onClick={() => setIsAddOpen(true)} icon={Plus}>Add First Vehicle</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map(v => (
            <motion.div key={v._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-5 flex flex-col group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="info" className="mb-2">{v.vehicleNumber}</Badge>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{v.brand} {v.model}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{v.year} • {v.color} • {v.vehicleType}</p>
                </div>
                <button onClick={() => handleDelete(v._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  {v.registrationCertificate ? (
                     <span className="flex items-center gap-1 text-emerald-500"><Shield className="w-4 h-4"/> RC Verified</span>
                  ) : (
                     <span className="flex items-center gap-1 text-amber-500"><Shield className="w-4 h-4"/> No RC</span>
                  )}
                </div>
                {v.images?.length > 0 && (
                  <span className="flex items-center gap-1 text-sm text-[var(--text-muted)]"><ImageIcon className="w-4 h-4"/> {v.images.length} Photos</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] border border-[var(--border-color)] p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2"><Car className="text-indigo-500"/> Add New Vehicle</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"><X className="w-6 h-6"/></button>
            </div>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Vehicle Number</label>
                  <input required type="text" value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})} placeholder="MH 01 AB 1234" className="input-premium w-full text-sm px-4 py-2.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Vehicle Type</label>
                  <select required value={form.vehicleType} onChange={e => setForm({...form, vehicleType: e.target.value})} className="input-premium w-full text-sm px-4 py-2.5 bg-[var(--bg-card)]">
                    <option value="Hatchback">Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Brand</label>
                  <input required type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Honda" className="input-premium w-full text-sm px-4 py-2.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Model</label>
                  <input required type="text" value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="City" className="input-premium w-full text-sm px-4 py-2.5" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Year</label>
                  <input required type="number" min="1990" max="2025" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="input-premium w-full text-sm px-4 py-2.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Color</label>
                <input required type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="White" className="input-premium w-full text-sm px-4 py-2.5" />
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">Vehicle Images (Comma separated URLs)</label>
                <textarea value={form.images} onChange={e => setForm({...form, images: e.target.value})} placeholder="https://res.cloudinary.com/..." className="input-premium w-full text-sm px-4 py-2.5 h-20" />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block">RC Book URL</label>
                <input type="text" value={form.registrationCertificate} onChange={e => setForm({...form, registrationCertificate: e.target.value})} placeholder="https://res.cloudinary.com/..." className="input-premium w-full text-sm px-4 py-2.5" />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsAddOpen(false)} type="button">Cancel</Button>
                <Button type="submit" loading={submitting}>Save Vehicle</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
