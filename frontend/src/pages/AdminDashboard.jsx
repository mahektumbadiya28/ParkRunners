import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, ShieldAlert, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-[#0b0f19] text-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white text-transparent bg-gradient-to-r from-red-500 to-indigo-500 bg-clip-text">Admin Command Center</h1>
            <p className="text-gray-400 mt-1">Operator: {user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 px-4 py-2 rounded-xl transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-indigo-400">
              <Users className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Users</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Manage hosts, drivers, and custom accounts.</p>
            <button className="bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-400 font-bold py-2 px-4 rounded-xl text-xs transition-all">
              Manage
            </button>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Approvals</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Approve park spots and verify valet profiles.</p>
            <button className="bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-400 font-bold py-2 px-4 rounded-xl text-xs transition-all">
              Approve
            </button>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4 text-indigo-400">
              <BarChart3 className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Analytics</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">View revenue, bookings, and active maps.</p>
            <button className="bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/30 text-indigo-400 font-bold py-2 px-4 rounded-xl text-xs transition-all">
              View Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
