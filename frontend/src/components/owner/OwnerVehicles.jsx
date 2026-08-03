import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CarFront, Car, Bike, Plus, Edit2, Trash2, CheckCircle, X, Check } from 'lucide-react';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../../services/vehicle';
import { updateUserProfile } from '../../services/user';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

export default function OwnerVehicles() {
  const { user, setUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    vehicleNumber: '',
    vehicleType: 'Sedan',
    color: '#000000',
    isPrimary: false,
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        vehicleNumber: vehicle.vehicleNumber,
        vehicleType: vehicle.vehicleType || 'Sedan',
        color: vehicle.color || '#000000',
        isPrimary: user?.preferences?.defaultVehicle === vehicle.vehicleNumber,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        brand: '',
        model: '',
        vehicleNumber: '',
        vehicleType: 'Sedan',
        color: '#000000',
        isPrimary: vehicles.length === 0, // Auto-primary if it's the first vehicle
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
  };

  const handleSetPrimary = async (vehicleNumber) => {
    try {
      const updatedUser = {
        ...user,
        preferences: {
          ...(user?.preferences || {}),
          defaultVehicle: vehicleNumber,
        },
      };
      await updateUserProfile(user._id, { preferences: updatedUser.preferences });
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Primary vehicle updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update primary vehicle');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let savedVehicle;
      if (editingVehicle) {
        const res = await updateVehicle(editingVehicle._id, formData);
        savedVehicle = res.data;
        toast.success('Vehicle updated successfully');
      } else {
        const res = await addVehicle(formData);
        savedVehicle = res.data;
        toast.success('Vehicle added successfully');
      }

      // Handle Primary Checkbox
      if (formData.isPrimary && user?.preferences?.defaultVehicle !== savedVehicle.vehicleNumber) {
        await handleSetPrimary(savedVehicle.vehicleNumber);
      } else if (!formData.isPrimary && user?.preferences?.defaultVehicle === savedVehicle.vehicleNumber) {
        // If they unchecked it and it was primary, clear it
        await handleSetPrimary('');
      }

      fetchVehicles();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleDelete = async (id, vehicleNumber) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await deleteVehicle(id);
      toast.success('Vehicle removed');
      if (user?.preferences?.defaultVehicle === vehicleNumber) {
        await handleSetPrimary('');
      }
      fetchVehicles();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove vehicle');
    }
  };

  const getVehicleIcon = (type) => {
    if (type?.toLowerCase().includes('two-wheeler') || type?.toLowerCase().includes('bike')) return <Bike className="w-8 h-8" />;
    if (type?.toLowerCase().includes('suv')) return <CarFront className="w-8 h-8" />;
    return <Car className="w-8 h-8" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">My Vehicles</h2>
          <p className="text-[var(--text-muted)] mt-1">Manage your registered vehicles and set default options for quick parking.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
          Add Vehicle
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-48 w-full rounded-2xl" />)}
        </div>
      ) : vehicles.length === 0 ? (
        /* Empty State */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-premium p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-[var(--border-color)]">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mb-6">
            <CarFront className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Vehicles Registered Yet</h3>
          <p className="text-[var(--text-muted)] max-w-md mx-auto mb-8">
            Add your vehicle details to enable seamless parking booking, auto-payments, and live spot tracking.
          </p>
          <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
            Add Your First Vehicle
          </Button>
        </motion.div>
      ) : (
        /* Vehicle List */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((v, index) => {
            const isDefault = user?.preferences?.defaultVehicle === v.vehicleNumber;
            return (
              <motion.div 
                key={v._id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
                className={`card-premium p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDefault ? 'border-indigo-500/50 shadow-indigo-500/10' : ''}`}
              >
                {/* Default Indicator Top Accent */}
                {isDefault && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isDefault ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-indigo-500/25' : 'bg-[var(--bg-page)] text-[var(--text-secondary)]'}`}>
                      {getVehicleIcon(v.vehicleType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[var(--text-primary)] leading-tight">{v.brand} {v.model}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="px-2.5 py-1 bg-[var(--bg-page)] border border-[var(--border-color)] rounded text-xs font-mono font-bold tracking-wider text-[var(--text-primary)] shadow-inner">
                          {v.vehicleNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Badge variant="outline" className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: v.color || '#000' }} />
                    {v.vehicleType}
                  </Badge>
                  {isDefault && (
                    <Badge variant="primary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                      <CheckCircle className="w-3 h-3 mr-1" /> Primary
                    </Badge>
                  )}
                  {/* Status Mockup */}
                  <Badge variant="secondary" className="ml-auto">Idle</Badge>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex gap-2">
                  {!isDefault && (
                    <Button variant="outline" size="sm" className="flex-1 text-xs py-1.5" onClick={() => handleSetPrimary(v.vehicleNumber)}>
                      Set Default
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1 text-xs py-1.5" onClick={() => handleOpenModal(v)}>
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-none text-red-400 border-red-500/20 hover:bg-red-500/10 px-3 py-1.5" onClick={() => handleDelete(v._id, v.vehicleNumber)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                <button onClick={handleCloseModal} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Make (Brand)" placeholder="e.g. Tesla" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} required />
                    <Input label="Model" placeholder="e.g. Model 3" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} required />
                  </div>
                  
                  <Input 
                    label="License Plate Number" 
                    placeholder="e.g. MH-01-AB-1234" 
                    value={formData.vehicleNumber} 
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value.toUpperCase()})} 
                    required 
                    className="font-mono text-lg uppercase tracking-wider"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Vehicle Type</label>
                      <select 
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                      >
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Two-Wheeler/EV">Two-Wheeler/EV</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Color</label>
                      <div className="flex h-[42px]">
                        <input 
                          type="color" 
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          className="h-full w-12 p-1 bg-[var(--bg-input)] border border-r-0 border-[var(--border-color)] rounded-l-xl cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          className="flex-1 w-full bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-r-xl px-3 outline-none focus:border-indigo-500 font-mono text-sm uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-[var(--border-color)]">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${formData.isPrimary ? 'bg-indigo-500 border-indigo-500' : 'bg-[var(--bg-input)] border-[var(--border-color)] group-hover:border-indigo-500/50'}`}>
                        {formData.isPrimary && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.isPrimary} onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})} />
                      <span className="text-sm font-medium text-[var(--text-primary)]">Set as primary vehicle for instant booking</span>
                    </label>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-page)] flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="primary" type="submit" form="vehicle-form">
                  {editingVehicle ? 'Save Changes' : 'Add Vehicle'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
