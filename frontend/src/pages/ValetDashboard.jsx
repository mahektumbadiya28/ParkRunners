import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Clipboard, Map, Navigation } from 'lucide-react';

export default function ValetDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-[#0b0f19] text-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Valet Dashboard</h1>
            <p className="text-gray-400 mt-1">Driver: {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <Clipboard className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Active Jobs</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              View and accept incoming requests from car owners who need parking support.
            </p>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/10">
              Check Requests
            </button>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <Navigation className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Documents & Stats</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Upload background checks, driving licenses, and view your trip counts and tips.
            </p>
            <button className="bg-gray-850 border border-gray-700 hover:bg-gray-800 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all">
              Driver Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
