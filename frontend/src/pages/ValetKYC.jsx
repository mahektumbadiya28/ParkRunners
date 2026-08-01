import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Upload, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export default function ValetKYC() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    licenseNumber: '',
    identityProofUrl: '',
    licenseUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Mocking an API call to save KYC details
    setTimeout(() => {
      setLoading(false);
      toast.success('KYC Details submitted for verification!');
      navigate('/valet');
    }, 1500);
  };

  return (
    <DashboardLayout title="KYC Verification">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)]">Valet Verification</h2>
          <p className="text-[var(--text-muted)] mt-2 text-sm">Please upload your driving license and identity proof to start accepting jobs.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-1 block uppercase tracking-wider">Driving License Number</label>
              <input
                type="text"
                required
                value={form.licenseNumber}
                onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                placeholder="MH01 20210001234"
                className="input-premium w-full py-3 px-4"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Upload License</label>
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-indigo-500/50 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group">
                  <Upload className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Click to upload file</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Identity Proof (Aadhar/PAN)</label>
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-6 text-center hover:border-indigo-500/50 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer group">
                  <FileText className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2 group-hover:text-indigo-500 transition-colors" />
                  <p className="text-xs font-semibold text-[var(--text-primary)]">Click to upload file</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">PDF, PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3 items-start mt-6">
              <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-400">By submitting, you agree to a background check. Your documents are encrypted and stored securely.</p>
            </div>

            <div className="pt-6 border-t border-[var(--border-color)] flex justify-end">
              <Button type="submit" loading={loading} className="w-full md:w-auto px-8" icon={ArrowRight}>Submit Documents</Button>
            </div>

          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
