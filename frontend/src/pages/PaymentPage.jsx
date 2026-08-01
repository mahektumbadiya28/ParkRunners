import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, ArrowLeft, CheckCircle, Sparkles, Shield } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { createOrder, verifyPayment } from '../services/payment';
import toast from 'react-hot-toast';

function formatCard(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4);
  return clean.length >= 3 ? `${clean.slice(0, 2)} / ${clean.slice(2)}` : clean;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({ name: '', card: '', expiry: '', cvv: '' });
  const [step, setStep] = useState('form');
  const [booking, setBooking] = useState(null);

  React.useEffect(() => {
    if (id) {
      import('../services/api').then(({ default: API }) => {
        API.get(`/bookings/${id}`).then(res => {
          if (res.data?.success) setBooking(res.data.data);
        }).catch(err => console.error(err));
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === 'card' ? formatCard(value) : name === 'expiry' ? formatExpiry(value) : value
    }));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setStep('processing');
    try {
      if (id) {
        const amount = booking?.totalAmount || 120;
        const order = await createOrder({ bookingId: id, amount, paymentMethod: 'card' });
        // Verify payment
        await verifyPayment({ paymentId: order.paymentId, transactionId: order.transactionId, status: 'completed' });
      } else {
        // Fake delay for demo without ID
        await new Promise(res => setTimeout(res, 1500));
      }
      setStep('success');
    } catch (err) {
      toast.error('Payment failed');
      setStep('form');
    }
  };

  if (step === 'success') return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-full max-w-sm text-center"
      >
        <div className="card-premium p-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/25 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-2">Payment Successful!</h2>
          <p className="text-[var(--text-muted)] text-sm mb-2">Your booking is confirmed.</p>
          <p className="text-xs text-[var(--text-muted)] mb-8">A valet will be assigned to your booking shortly.</p>
          <Button className="w-full" onClick={() => navigate('/owner')}>Back to Dashboard</Button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black text-lg">Secure Checkout</p>
                  <p className="text-indigo-200 text-xs">Powered by Stripe (Test Mode)</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-indigo-200 text-sm mb-1">Parking Spot Booking {id && `#${id.slice(-6).toUpperCase()}`}</p>
                  <p className="text-indigo-200 text-xs">{booking?.duration || 2} hours · {booking?.parkingId?.parkingName || 'SG Highway'}</p>
                </div>
                <p className="text-4xl font-black">₹{booking?.totalAmount || 120}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handlePay} className="p-8 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Cardholder Name</label>
              <Input name="name" label="Full name on card" icon={CreditCard} value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Card Number</label>
              <input
                name="card" value={form.card} onChange={handleChange} required
                placeholder="4242 4242 4242 4242"
                className="input-premium text-sm px-4 font-mono tracking-wider"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Expiry Date</label>
                <input name="expiry" value={form.expiry} onChange={handleChange} required placeholder="MM / YY" className="input-premium text-sm px-4" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">CVV</label>
                <input name="cvv" value={form.cvv} onChange={handleChange} required placeholder="•••" maxLength={4} type="password" className="input-premium text-sm px-4" />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={step === 'processing'}
              icon={Lock}
            >
              {step === 'processing' ? 'Processing secure payment…' : `Pay ₹${booking?.totalAmount || 120} Securely`}
            </Button>

            <div className="flex items-center justify-center gap-4 pt-2">
              {[Shield, Lock, Sparkles].map((Icon, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Icon className="w-3.5 h-3.5" />
                  {i === 0 ? 'SSL Encrypted' : i === 1 ? 'PCI Compliant' : '256-bit Secure'}
                </div>
              ))}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
