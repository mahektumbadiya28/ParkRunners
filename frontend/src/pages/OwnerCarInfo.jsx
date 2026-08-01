import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Car } from 'lucide-react';

export default function OwnerCarInfo() {
  const navigate = useNavigate();
  const { carDetails, setOwnerCarDetails } = useAuth();
  const [plate, setPlate] = useState(carDetails?.plate || '');
  const [model, setModel] = useState(carDetails?.model || '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!plate.trim() || !model.trim()) {
      setError('Please enter both the car number plate and model.');
      return;
    }
    setOwnerCarDetails({ plate: plate.trim(), model: model.trim() });
    navigate('/owner');
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center py-12 px-4 relative">
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/50 dark:bg-white dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800/80 p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 text-indigo-400 mb-4">
            <Car className="w-8 h-8" />
            <h1 className="text-2xl font-black tracking-widest">Car Info</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Add your car details before using owner features.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Car Number Plate</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC-1234"
              className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Car Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Toyota Camry 2021"
              className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 focus:border-indigo-500 rounded-xl py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-gray-900 dark:text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
