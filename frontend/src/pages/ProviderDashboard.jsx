import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MapPin, Plus, CheckCircle, XCircle, BarChart3, Settings,
  MessageSquare, User, CreditCard, Bell, Moon, Sun, Search, Calendar,
  TrendingUp, Activity, ShieldCheck, IndianRupee, Award, Clock, HelpCircle, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';

import DashboardLayout from '../components/DashboardLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import API from '../services/api';
import { listMySpots, createSpot } from '../services/parking';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Add Parking Step Wizard Form State
  const [addStep, setAddStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    latitude: '23.0225',
    longitude: '72.5714',
    images: '',
    parkingType: 'driveway',
    totalSlots: '5',
    availableFrom: '08:00',
    availableTill: '22:00',
    pricePerHour: '40',
    dynamicPricing: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Socket for live updates
  useSocket({
    'booking_updated': (data) => {
      showToast(`🔔 Booking status updated to ${data.status}!`);
      fetchData();
    },
    'new_booking': (data) => {
      showToast(`🎉 New Booking received for ₹${data.totalAmount}!`);
      fetchData();
    }
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [spotsRes, bookingsRes, paymentsRes, reviewsRes, analyticsRes] = await Promise.all([
        listMySpots(),
        API.get('/bookings/provider').then(res => res.data),
        API.get('/payment/provider').then(res => res.data),
        API.get('/review/provider').then(res => res.data),
        API.get('/analytics/provider').then(res => res.data)
      ]);

      setSpots(spotsRes.data || []);
      setBookings(bookingsRes.data || []);
      setPayments(paymentsRes.data || []);
      setReviews(reviewsRes.data || []);
      setAnalytics(analyticsRes.data || null);
    } catch (err) {
      console.error('Error fetching host data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSpot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const imgArray = form.images ? form.images.split(',').map(url => url.trim()) : [];
      await createSpot({
        parkingName: form.title,
        description: form.description,
        address: form.address,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        images: imgArray,
        parkingType: form.parkingType,
        totalSlots: parseInt(form.totalSlots),
        hourlyPrice: parseFloat(form.pricePerHour),
        dailyPrice: parseFloat(form.pricePerHour) * 8, // Estimated daily price
        openingTime: form.availableFrom,
        closingTime: form.availableTill
      });

      showToast('🏠 Parking Space submitted for approval!');
      setForm({
        title: '',
        description: '',
        address: '',
        latitude: '23.0225',
        longitude: '72.5714',
        images: '',
        parkingType: 'driveway',
        totalSlots: '5',
        availableFrom: '08:00',
        availableTill: '22:00',
        pricePerHour: '40',
        dynamicPricing: true
      });
      setAddStep(1);
      setActiveTab('spaces');
      fetchData();
    } catch (err) {
      showToast('❌ Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpot = async (id) => {
    if (!window.confirm('Are you sure you want to remove this parking space?')) return;
    try {
      await API.delete(`/parking/${id}`);
      showToast('🗑️ Parking Space deleted successfully');
      fetchData();
    } catch (err) {
      showToast('❌ Failed to delete parking space');
    }
  };

  // Nav Items
  const SIDEBAR_ITEMS = [
    { icon: MapPin, label: 'My Spaces', activeId: 'spaces' },
    { icon: Plus, label: 'Add Parking Space', activeId: 'add-space' },
    { icon: Calendar, label: 'Bookings', activeId: 'bookings' },
    { icon: CreditCard, label: 'Earnings', activeId: 'earnings' },
    { icon: BarChart3, label: 'Analytics', activeId: 'analytics' },
    { icon: MessageSquare, label: 'Reviews', activeId: 'reviews' },
  ];

  const TOP_NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', activeId: 'dashboard' },
    { icon: User, label: 'Profile', activeId: 'profile' },
    { icon: Settings, label: 'Settings', activeId: 'settings' }
  ];

  // Helper counters
  const totalSpots = spots.length;
  const approvedSpots = spots.filter(s => s.status === 'approved').length;
  const occupancyRate = analytics?.stats?.occupancyRate || 0;
  const totalEarnings = analytics?.stats?.totalEarnings || 0;

  // Filter Bookings
  const filteredBookings = bookings.filter(b =>
    b.ownerId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.parkingId?.parkingName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout
      navItems={SIDEBAR_ITEMS.map(item => ({
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      }))}
      topNavItems={TOP_NAV_ITEMS.map(item => ({
        icon: item.icon,
        label: item.label,
        onClick: () => setActiveTab(item.activeId),
        active: activeTab === item.activeId
      }))}
      title=""
    >
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[9999] bg-slate-900/90 backdrop-blur-xl border border-indigo-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold"
          >
            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="space-y-6">

        {/* Dynamic Headers */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              {activeTab === 'dashboard' && 'Welcome Back, Host!'}
              {activeTab === 'spaces' && 'Manage Parking Spaces'}
              {activeTab === 'add-space' && 'Onboard New Space'}
              {activeTab === 'bookings' && 'Reservations & Slots'}
              {activeTab === 'earnings' && 'Earning Records'}
              {activeTab === 'analytics' && 'Performance & AI Forecasts'}
              {activeTab === 'reviews' && 'Customer Experience'}
              {activeTab === 'profile' && 'Business Profile Verification'}
              {activeTab === 'settings' && 'Account Settings'}
            </h2>
            <p className="text-[var(--text-muted)] mt-1">
              {activeTab === 'dashboard' && 'Here is a quick look at your rental activities and AI business insights.'}
              {activeTab === 'spaces' && 'Toggle availability, manage capacity, and edit listings.'}
              {activeTab === 'add-space' && 'Onboard your unused garage or driveway in 5 easy steps.'}
              {activeTab === 'bookings' && 'Monitor arrivals, departures, and valet statuses in real-time.'}
              {activeTab === 'earnings' && 'Review dynamic pricing payout transactions and details.'}
              {activeTab === 'analytics' && 'Gain insights powered by Scikit-Learn models.'}
              {activeTab === 'reviews' && 'See what car owners are saying about your parking spots.'}
              {activeTab === 'profile' && 'Update billing details, GST invoices, and verification status.'}
              {activeTab === 'settings' && 'Control system parameters, preferences, and notifications.'}
            </p>
          </div>
          {activeTab === 'dashboard' && (
            <Button icon={Plus} onClick={() => setActiveTab('add-space')}>
              List a New Space
            </Button>
          )}
        </div>

        {/* LOADING SKELETON */}
        {loading && activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton h-32 w-full rounded-2xl" />
              ))}
            </div>
            <div className="skeleton h-96 w-full rounded-2xl" />
          </div>
        ) : (
          <>
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card-premium p-5 flex items-center justify-between hover:scale-[1.02] transition-all">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total Spaces</p>
                      <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">{totalSpots}</h3>
                      <p className="text-xs text-indigo-400 font-semibold mt-1">{approvedSpots} Approved</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="card-premium p-5 flex items-center justify-between hover:scale-[1.02] transition-all">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Occupancy Rate</p>
                      <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">{occupancyRate}%</h3>
                      <div className="w-24 bg-gray-700 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-indigo-500 h-1.5" style={{ width: `${occupancyRate}%` }} />
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="card-premium p-5 flex items-center justify-between hover:scale-[1.02] transition-all">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Total Bookings</p>
                      <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">{bookings.length}</h3>
                      <p className="text-xs text-cyan-400 font-semibold mt-1">{analytics?.stats?.todayBookings || 0} Today</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="card-premium p-5 flex items-center justify-between hover:scale-[1.02] transition-all">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider">Net Earnings</p>
                      <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">₹{totalEarnings}</h3>
                      <p className="text-xs text-amber-400 font-semibold mt-1">₹{analytics?.stats?.todayEarnings || 0} Today</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* AI Insights & Dynamic Pricing Dashboard Card */}
                {analytics?.aiInsights && (
                  <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 to-slate-900/50 p-6 backdrop-blur-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400">
                      <Award className="w-48 h-48" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="purple">AI Business Hub</Badge>
                      <span className="text-xs text-indigo-300 font-medium">Random Forest & Regression Active</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400">Expected Weekly Revenue</h4>
                          <p className="text-3xl font-black text-white mt-1">₹{analytics.aiInsights.expectedWeeklyRevenue}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400">AI Suggested Price Multiplier</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-extrabold text-indigo-400">x{analytics.aiInsights.suggestedPricingMultiplier}</span>
                            <Badge variant="success">+{Math.round((analytics.aiInsights.suggestedPricingMultiplier - 1) * 100)}% Surge</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="border-l border-gray-800 pl-6 space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400">Business Health Score</h4>
                          <p className="text-3xl font-black text-emerald-400 mt-1">{analytics.aiInsights.businessHealthScore}/100</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400">Expected Daily Demand</h4>
                          <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full" style={{ width: `${analytics.aiInsights.expectedDemand * 100}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="border-l border-gray-800 pl-6 flex flex-col justify-between">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Dynamic System Suggestions</h4>
                        <ul className="space-y-2 text-xs text-gray-300">
                          {analytics.aiInsights.suggestions.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-400 mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mini Charts & Table */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Space mini overview list */}
                  <div className="card-premium p-6">
                    <h3 className="font-bold text-[var(--text-primary)] mb-4">My Spaces</h3>
                    <div className="space-y-3">
                      {spots.slice(0, 3).map(spot => (
                        <div key={spot._id} className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-all">
                          <div>
                            <h4 className="font-semibold text-sm text-[var(--text-primary)]">{spot.parkingName}</h4>
                            <p className="text-xs text-[var(--text-muted)]">{spot.address}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-[var(--text-primary)]">₹{spot.hourlyPrice}/hr</span>
                            <p className="text-xs text-[var(--text-muted)]">{spot.availableSlots}/{spot.totalSlots} slots free</p>
                          </div>
                        </div>
                      ))}
                      <Button size="sm" variant="secondary" className="w-full" onClick={() => setActiveTab('spaces')}>
                        View All Spaces
                      </Button>
                    </div>
                  </div>

                  {/* Realtime Live Activity Feed */}
                  <div className="card-premium p-6">
                    <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between">
                      <span>Live Reservations</span>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {bookings.slice(0, 3).map(booking => (
                        <div key={booking._id} className="flex items-start gap-3 text-sm">
                          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[var(--text-primary)]">{booking.ownerId?.fullName || 'Customer'}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Spot: {booking.parkingId?.parkingName || 'Unknown'}</p>
                          </div>
                          <Badge variant={
                            booking.bookingStatus === 'completed' ? 'success' :
                              booking.bookingStatus === 'pending' ? 'warning' : 'purple'
                          }>
                            {booking.bookingStatus}
                          </Badge>
                        </div>
                      ))}
                      <Button size="sm" variant="secondary" className="w-full" onClick={() => setActiveTab('bookings')}>
                        Open Bookings Table
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MY SPACES */}
            {activeTab === 'spaces' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spots.length === 0 ? (
                    <div className="col-span-full card-premium py-16 text-center">
                      <MapPin className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-30" />
                      <h4 className="font-bold text-[var(--text-primary)]">No Listings Found</h4>
                      <p className="text-sm text-[var(--text-muted)] mt-1">Get started by creating a new parking listing.</p>
                      <Button className="mt-4" onClick={() => setActiveTab('add-space')}>Add Space</Button>
                    </div>
                  ) : (
                    spots.map(spot => (
                      <div key={spot._id} className="card-premium overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all flex flex-col justify-between">
                        <div>
                          {/* Image Header */}
                          <div className="h-44 bg-indigo-950/20 relative overflow-hidden">
                            {spot.images && spot.images[0] ? (
                              <img src={spot.images[0]} alt={spot.parkingName} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-semibold text-sm">
                                No Images Available
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <Badge variant={spot.status === 'approved' ? 'success' : 'warning'}>
                                {spot.status || 'Pending'}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-extrabold text-lg text-[var(--text-primary)]">{spot.parkingName}</h3>
                            <p className="text-xs text-[var(--text-muted)] mt-1 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                              <span>{spot.address}</span>
                            </p>
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[var(--border-color)]">
                              <div>
                                <span className="text-xs text-[var(--text-muted)]">Hourly Rate</span>
                                <p className="font-black text-indigo-400 text-sm mt-0.5">₹{spot.hourlyPrice}</p>
                              </div>
                              <div>
                                <span className="text-xs text-[var(--text-muted)]">Capacity</span>
                                <p className="font-bold text-[var(--text-primary)] text-xs mt-0.5">{spot.availableSlots}/{spot.totalSlots} Slots Free</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 pt-0 flex gap-2">
                          <Button size="sm" variant="secondary" className="flex-1" onClick={() => {
                            showToast('✏️ Edit feature coming in host portal release.');
                          }}>
                            Edit
                          </Button>
                          <Button size="sm" variant="secondary" className="flex-1 border-red-500/10 text-red-400 hover:bg-red-500/5" onClick={() => handleDeleteSpot(spot._id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: ADD SPACE */}
            {activeTab === 'add-space' && (
              <div className="max-w-2xl mx-auto card-premium p-6">
                {/* Steps header indicator */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-[var(--border-color)]">
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${addStep === step ? 'bg-indigo-600 text-white' :
                          addStep > step ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                        {step}
                      </span>
                      {step < 5 && <div className={`w-8 md:w-16 h-0.5 ${addStep > step ? 'bg-indigo-500/20' : 'bg-gray-800'}`} />}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateSpot} className="space-y-6">
                  {addStep === 1 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Step 1: Basic Information</h3>
                      <Input label="Parking Title" placeholder="e.g. Premium Driveway near MG Road" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1">Description</label>
                        <textarea placeholder="Write detail of directions, space dimension, access info" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-premium w-full text-sm px-4 py-3 h-24" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Parking Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['driveway', 'garage', 'covered', 'open'].map(type => (
                            <button key={type} type="button" onClick={() => setForm({ ...form, parkingType: type })} className={`p-3 rounded-2xl border text-xs capitalize font-bold transition-all ${form.parkingType === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                              }`}>
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {addStep === 2 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Step 2: Google Maps Location</h3>
                      <Input label="Full Address" placeholder="12 SG Highway, Ahmedabad, Gujarat" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Latitude" placeholder="23.0225" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} required />
                        <Input label="Longitude" placeholder="72.5714" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} required />
                      </div>
                    </motion.div>
                  )}

                  {addStep === 3 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Step 3: Upload Photos</h3>
                      <div>
                        <label className="text-xs font-semibold text-[var(--text-muted)] block mb-1.5">Cloudinary Image URLs (comma-separated)</label>
                        <textarea placeholder="https://res.cloudinary.com/.../img1.jpg, https://res.cloudinary.com/.../img2.jpg" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} className="input-premium w-full text-sm px-4 py-3 h-24" />
                        <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Specify absolute image URLs hosting from Cloudinary.</span>
                      </div>
                    </motion.div>
                  )}

                  {addStep === 4 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Step 4: Slot Capacity & Availability</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Total Slot Capacity" type="number" placeholder="5" value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Available From (Time)" type="time" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })} required />
                        <Input label="Available Till (Time)" type="time" value={form.availableTill} onChange={e => setForm({ ...form, availableTill: e.target.value })} required />
                      </div>
                    </motion.div>
                  )}

                  {addStep === 5 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                      <h3 className="font-extrabold text-[var(--text-primary)] text-lg">Step 5: Base Pricing & Dynamics</h3>
                      <Input label="Hourly Price (₹)" type="number" placeholder="40" value={form.pricePerHour} onChange={e => setForm({ ...form, pricePerHour: e.target.value })} required />
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 mt-4">
                        <input type="checkbox" id="dynamicPricing" checked={form.dynamicPricing} onChange={e => setForm({ ...form, dynamicPricing: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <div>
                          <label htmlFor="dynamicPricing" className="text-sm font-extrabold text-[var(--text-primary)] block cursor-pointer">Enable Dynamic AI Pricing</label>
                          <span className="text-xs text-[var(--text-muted)]">Automatically surge prices based on weather, demand forecasts, and events.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 justify-between pt-4 border-t border-[var(--border-color)]">
                    {addStep > 1 ? (
                      <Button type="button" variant="secondary" onClick={() => setAddStep(s => s - 1)}>Back</Button>
                    ) : (
                      <div />
                    )}

                    {addStep < 5 ? (
                      <Button type="button" onClick={() => setAddStep(s => s + 1)}>Next</Button>
                    ) : (
                      <Button type="submit" loading={submitting}>{submitting ? 'Creating listing...' : 'Finish & Submit'}</Button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* TAB: BOOKINGS */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                    <input type="text" placeholder="Search by name, booking ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-premium w-full text-xs pl-11 pr-4 py-2.5" />
                  </div>
                </div>

                <div className="card-premium overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card-hover)] text-xs text-[var(--text-muted)] uppercase font-bold">
                          <th className="px-6 py-4">Booking ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Parking Area</th>
                          <th className="px-6 py-4">Arrival Date</th>
                          <th className="px-6 py-4">Duration</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-sm text-[var(--text-muted)]">
                              No bookings found matching query.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map(b => (
                            <tr key={b._id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                              <td className="px-6 py-4 font-mono text-xs">{b._id?.slice(-8)}</td>
                              <td className="px-6 py-4 font-semibold">{b.ownerId?.fullName || 'Customer'}</td>
                              <td className="px-6 py-4">{b.parkingId?.parkingName || 'Main Area'}</td>
                              <td className="px-6 py-4 text-xs">{new Date(b.startTime).toLocaleString()}</td>
                              <td className="px-6 py-4 text-xs">{Math.ceil((new Date(b.endTime) - new Date(b.startTime)) / 3600000)} hrs</td>
                              <td className="px-6 py-4 font-bold text-indigo-400">₹{b.totalAmount}</td>
                              <td className="px-6 py-4">
                                <Badge variant={
                                  b.bookingStatus === 'completed' ? 'success' :
                                    b.bookingStatus === 'pending' ? 'warning' : 'purple'
                                }>
                                  {b.bookingStatus}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {b.bookingStatus === 'pending' && (
                                  <div className="flex gap-1 justify-end">
                                    <button onClick={async () => {
                                      try {
                                        await API.post(`/bookings/${b._id}/action`, { action: 'cancel' });
                                        showToast('❌ Booking cancelled');
                                        fetchData();
                                      } catch { showToast('❌ Failed to cancel'); }
                                    }} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-500/10 text-red-400 hover:bg-red-500/5">
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EARNINGS */}
            {activeTab === 'earnings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="card-premium p-6">
                    <span className="text-xs text-[var(--text-muted)] font-bold">Total Earnings</span>
                    <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">₹{totalEarnings}</h3>
                    <p className="text-[10px] text-emerald-400 mt-1">Completed & Paid Payouts</p>
                  </div>
                  <div className="card-premium p-6">
                    <span className="text-xs text-[var(--text-muted)] font-bold">Pending Payouts</span>
                    <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">
                      ₹{payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)}
                    </h3>
                    <p className="text-[10px] text-yellow-400 mt-1">Processing to bank account</p>
                  </div>
                  <div className="card-premium p-6">
                    <span className="text-xs text-[var(--text-muted)] font-bold">Refunded & Cancelled</span>
                    <h3 className="text-3xl font-black text-[var(--text-primary)] mt-1">
                      ₹{payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)}
                    </h3>
                    <p className="text-[10px] text-red-400 mt-1">Returned due to host cancellation</p>
                  </div>
                </div>

                <div className="card-premium p-5">
                  <h3 className="font-bold text-[var(--text-primary)] mb-4">Transaction Records</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] font-bold">
                          <th className="py-3 px-4">Transaction ID</th>
                          <th className="py-3 px-4">Booking ID</th>
                          <th className="py-3 px-4">Amount</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-xs text-[var(--text-muted)]">No transactions recorded</td>
                          </tr>
                        ) : (
                          payments.map(p => (
                            <tr key={p._id} className="text-xs text-[var(--text-primary)]">
                              <td className="py-3 px-4 font-mono">{p.transactionId}</td>
                              <td className="py-3 px-4 font-mono">{p.bookingId?._id?.slice(-8) || 'N/A'}</td>
                              <td className="py-3 px-4 font-bold text-indigo-400">₹{p.amount}</td>
                              <td className="py-3 px-4 uppercase">{p.paymentMethod}</td>
                              <td className="py-3 px-4">
                                <Badge variant={p.status === 'completed' ? 'success' : 'warning'}>
                                  {p.status}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Growth Trend Chart */}
                  <div className="card-premium p-5">
                    <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center justify-between text-sm">
                      <span>Monthly Revenue Trend</span>
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { name: 'Jan', revenue: totalEarnings * 0.4 },
                          { name: 'Feb', revenue: totalEarnings * 0.6 },
                          { name: 'Mar', revenue: totalEarnings * 0.8 },
                          { name: 'Apr', revenue: totalEarnings * 0.75 },
                          { name: 'May', revenue: totalEarnings * 0.95 },
                          { name: 'Jun', revenue: totalEarnings }
                        ]}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                          <Area type="monotone" dataKey="revenue" stroke="#6366F1" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Booking Trends Chart */}
                  <div className="card-premium p-5">
                    <h3 className="font-bold text-[var(--text-primary)] mb-4 text-sm">Booking Trends</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Mon', bookings: 3 },
                          { name: 'Tue', bookings: 5 },
                          { name: 'Wed', bookings: 2 },
                          { name: 'Thu', bookings: 4 },
                          { name: 'Fri', bookings: 8 },
                          { name: 'Sat', bookings: 12 },
                          { name: 'Sun', bookings: 9 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" />
                          <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                          <Bar dataKey="bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.length === 0 ? (
                    <div className="col-span-full card-premium py-16 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-30" />
                      <h4 className="font-bold text-[var(--text-primary)]">No Reviews Yet</h4>
                      <p className="text-sm text-[var(--text-muted)] mt-1">Car owners rating summaries will display here.</p>
                    </div>
                  ) : (
                    reviews.map(r => (
                      <div key={r._id} className="card-premium p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400">
                              {r.fromUser?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[var(--text-primary)]">{r.fromUser?.name || 'Car Owner'}</h4>
                              <p className="text-xs text-[var(--text-muted)]">Spot: {r.bookingId?.parkingId?.title || 'Main Area'}</p>
                            </div>
                          </div>
                          <Badge variant="purple">⭐ {r.rating}.0</Badge>
                        </div>
                        <p className="text-sm text-gray-300 italic">"{r.review}"</p>
                        <div className="text-[10px] text-[var(--text-muted)] pt-2 border-t border-[var(--border-color)]">
                          Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]">
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600">
               {/* Pattern overlay */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
            <div className="px-6 pb-6 sm:px-10 relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 sm:-mt-16">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-[var(--bg-page)] bg-[var(--bg-card)] flex items-center justify-center shadow-xl overflow-hidden relative group cursor-pointer">
                 <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-white text-4xl">
                   {(user?.name || user?.fullName || 'Space Provider').charAt(0).toUpperCase()}
                 </div>
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-white text-xs font-bold uppercase tracking-wider">Change</span>
                 </div>
              </div>
              <div className="flex-1 pb-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">{user?.name || user?.fullName || 'Space Provider'}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Badge variant="purple" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Host</Badge>
                  <span className="text-sm text-[var(--text-muted)] flex items-center gap-1"><MapPin className="w-4 h-4"/> Business HQ: Mumbai</span>
                </div>
              </div>
              <div className="pb-2 flex gap-3 w-full sm:w-auto">
                 <Button variant="outline" className="flex-1 sm:flex-none">Share Listing</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><User className="w-4 h-4 text-purple-500"/> Host Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Email Address</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.email || 'provider@volenpark.com'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Phone Number</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">{user?.phone || '+91 99999 99999'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">Host Tier</label>
                    <p className="text-sm font-medium text-[var(--text-primary)] mt-1">Premium Partner</p>
                  </div>
                </div>
              </div>

              <div className="card-premium p-6 bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">Top Rated Host</h4>
                    <p className="text-xs text-[var(--text-muted)]">Maintains a 4.9+ star rating.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card-premium p-6">
                <h4 className="font-bold text-[var(--text-primary)] mb-6">KYC Registration & GST Invoicing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Business Name" placeholder="VolenPark Host Co." value={user?.name || user?.fullName || "VolenPark Host Co."} readOnly />
                  <Input label="GST Identification" placeholder="GST27AAAAA1111A1Z1" value="27AAAAA1111A1Z1" readOnly />
                  <Input label="UPI ID (Payouts)" placeholder="host@upi" value="host@upi" readOnly />
                  <Input label="Associated Phone" placeholder="+91 99999 99999" value="+91 99999 99999" readOnly />
                </div>
                <div className="mt-6 pt-6 border-t border-[var(--border-color)] flex justify-end">
                  <Button variant="primary" className="bg-purple-600 hover:bg-purple-500 shadow-purple-500/30">Update Business Info</Button>
                </div>
              </div>

              <div className="card-premium p-6 border-red-500/20 bg-red-500/5">
                <h4 className="font-bold text-red-500 mb-2">Deactivate Partner Account</h4>
                <p className="text-xs text-[var(--text-muted)] mb-4">Temporarily unlist all your parking spots and pause payouts.</p>
                <Button variant="outline" className="text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white">Deactivate Account</Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl mx-auto card-premium p-6 space-y-6">
                <h3 className="font-extrabold text-[var(--text-primary)] text-lg">System Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Email Notifications</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Receive dynamic pricing updates and slot alerts by email.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card-hover)]">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Auto Payout Mode</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Settle earnings to bank account instantly after reservation completions.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
