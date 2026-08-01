import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const availableRoles = ['owner', 'provider', 'valet'];
const roleLabels = {
  owner: 'Car Owner',
  provider: 'Space Provider',
  valet: 'Valet Driver',
};
const roleDescriptions = {
  owner: 'Search parking spaces, book spots, and request valet service.',
  provider: 'List your driveway or garage, manage spots, and earn from guests.',
  valet: 'Accept pickup tasks, inspect vehicles, and drop off cars safely.',
};

export default function RoleSelection() {
  const navigate = useNavigate();
  const { selectRole } = useAuth();

  const handleSelect = (role) => {
    selectRole(role);
    if (role === 'provider') navigate('/provider');
    else if (role === 'valet') navigate('/valet');
    else if (role === 'admin') navigate('/admin');
    else navigate('/owner/car-info');
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 min-h-screen flex items-center justify-center py-12 px-4 relative">
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/50 dark:bg-white dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800/80 p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent tracking-widest">
            VOLENPARK
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Choose how you want to use the app for this session.</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-200">
            Every sign in requires selecting an active role.
          </div>
          <div className="grid gap-4">
            {availableRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleSelect(role)}
                className="w-full text-left bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 hover:border-indigo-500 rounded-2xl p-5 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{roleLabels[role]}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{roleDescriptions[role]}</p>
                  </div>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-gray-900 dark:text-white text-sm font-semibold">Select</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
