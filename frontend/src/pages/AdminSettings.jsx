import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Wallet } from 'lucide-react';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [form, setForm] = useState({
    platformFee: '10',
    valetCommission: '15',
    enableAI: true,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Platform settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSave} className="space-y-6">
        
        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Wallet className="text-indigo-500" /> Platform Economics</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Platform Fee (%)</label>
              <input type="number" value={form.platformFee} onChange={e => setForm({...form, platformFee: e.target.value})} className="input-premium w-full py-2.5 px-4" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Valet Commission (%)</label>
              <input type="number" value={form.valetCommission} onChange={e => setForm({...form, valetCommission: e.target.value})} className="input-premium w-full py-2.5 px-4" />
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2"><Settings className="text-indigo-500" /> System Toggles</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-[var(--border-color)] rounded-xl cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors">
              <div>
                <p className="font-bold text-[var(--text-primary)]">Enable AI Features</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Use Django AI service for demand prediction & damage detection</p>
              </div>
              <div className="relative">
                <input type="checkbox" checked={form.enableAI} onChange={e => setForm({...form, enableAI: e.target.checked})} className="sr-only" />
                <div className={`w-12 h-6 rounded-full transition-colors ${form.enableAI ? 'bg-indigo-500' : 'bg-[var(--border-color)]'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.enableAI ? 'translate-x-6.5 left-0' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 border border-red-500/30 bg-red-500/5 rounded-xl cursor-pointer">
              <div>
                <p className="font-bold text-red-500 flex items-center gap-2"><Shield className="w-4 h-4" /> Maintenance Mode</p>
                <p className="text-xs text-red-400 mt-1">Disable all new bookings and user registrations</p>
              </div>
              <div className="relative">
                <input type="checkbox" checked={form.maintenanceMode} onChange={e => setForm({...form, maintenanceMode: e.target.checked})} className="sr-only" />
                <div className={`w-12 h-6 rounded-full transition-colors ${form.maintenanceMode ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${form.maintenanceMode ? 'translate-x-6.5 left-0' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" loading={loading} icon={Save} className="px-8">Save Configuration</Button>
        </div>

      </form>
    </div>
  );
}
