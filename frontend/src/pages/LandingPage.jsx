import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  MapPin, DollarSign, Key, Shield, Zap, Clock, Star,
  CheckCircle, ArrowRight, Users, Car, TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }
});

/* ── Stats data ── */
const STATS = [
  { label: 'Active Spots', value: '12,400+', icon: MapPin, color: 'text-indigo-500' },
  { label: 'Happy Drivers', value: '48,000+', icon: Users, color: 'text-purple-500' },
  { label: 'Cities Covered', value: '28', icon: TrendingUp, color: 'text-cyan-500' },
  { label: 'Avg. Savings', value: '62%', icon: DollarSign, color: 'text-emerald-500' },
];

/* ── Feature cards ── */
const FEATURES = [
  { icon: MapPin, color: 'indigo', title: 'Real-Time Spot Map', desc: 'Browse thousands of verified spots on an interactive live map with instant availability updates.' },
  { icon: Shield, color: 'purple', title: 'Vetted Valet Drivers', desc: 'Every driver goes through background checks, skill testing, and digital ID verification.' },
  { icon: Zap, color: 'cyan', title: 'Instant Booking', desc: 'Book in under 30 seconds. Get confirmation, QR pass, and valet ETA all in one tap.' },
  { icon: DollarSign, color: 'emerald', title: 'Earn with Your Space', desc: 'Turn your empty driveway or garage into a passive income stream. Set your own price.' },
  { icon: Clock, color: 'amber', title: 'Flexible Duration', desc: 'Hourly, daily, or monthly plans. Change or cancel bookings up to 30 minutes before arrival.' },
  { icon: Star, color: 'rose', title: 'Trusted Community', desc: 'Ratings, reviews, and a dispute resolution team ensure quality for every single booking.' },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-500', border: 'group-hover:border-indigo-500/40' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-500', border: 'group-hover:border-purple-500/40' },
  cyan:   { bg: 'bg-cyan-500/10',   icon: 'text-cyan-500',   border: 'group-hover:border-cyan-500/40' },
  emerald:{ bg: 'bg-emerald-500/10',icon: 'text-emerald-500',border: 'group-hover:border-emerald-500/40' },
  amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-500',  border: 'group-hover:border-amber-500/40' },
  rose:   { bg: 'bg-rose-500/10',   icon: 'text-rose-500',   border: 'group-hover:border-rose-500/40' },
};

/* ── Testimonials ── */
const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Software Engineer', quote: 'Found a spot right next to my office in under a minute. The valet was professional and the app is so slick!', rating: 5 },
  { name: 'Arjun Mehta', role: 'Space Host', quote: 'I list my garage on weekdays and now earn ₹18,000 a month with zero effort. Easiest passive income ever.', rating: 5 },
  { name: 'Kavita Patel', role: 'Event Manager', quote: 'Used VolenPark for a corporate event. Booked 40 spots for guests in 10 minutes. Absolutely flawless.', rating: 5 },
];

/* ── Role Cards ── */
const ROLES = [
  {
    icon: Car, gradient: 'from-indigo-600 to-blue-600', glow: 'shadow-indigo-500/20',
    title: 'Car Owners', tag: 'Find & Book',
    desc: 'Search real-time parking spaces. Use maps, choose valets, and summon your car on-demand with live GPS tracking.',
    perks: ['Live interactive map', 'Valet on-demand', 'Instant QR pass'],
    href: '/register?role=owner', cta: 'Get Started as Owner',
  },
  {
    icon: DollarSign, gradient: 'from-purple-600 to-violet-600', glow: 'shadow-purple-500/20',
    title: 'Space Hosts', tag: 'Earn Passive',
    desc: 'List your driveway, garage, or lot. Set hourly pricing, define availability, and withdraw earnings weekly.',
    perks: ['Easy listing flow', 'Automated scheduling', 'Weekly payouts'],
    href: '/register?role=provider', cta: 'Become a Host',
  },
  {
    icon: Key, gradient: 'from-rose-600 to-pink-600', glow: 'shadow-rose-500/20',
    title: 'Valet Drivers', tag: 'Earn & Drive',
    desc: 'Accept bookings, run digital 4-side inspections, scan QR check-ins, park safely, and earn money per job.',
    perks: ['Flexible hours', 'Digital inspections', 'Per-job earnings'],
    href: '/register?role=valet', cta: 'Join as Valet',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] overflow-x-hidden">
      <Navbar transparent />

      {/* ════ HERO ════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/12 rounded-full blur-3xl animate-float-slow" style={{animationDelay: '-3s'}} />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '-6s'}} />
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-500 mb-8">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              Next-Gen Smart Parking Marketplace · Live Now
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.08] mb-6"
          >
            Park Smarter.
            <br />
            <span className="gradient-text">Earn More.</span>
            <br />
            <span className="text-[var(--text-secondary)]">Stress Less.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-muted)] mb-10 leading-relaxed"
          >
            The peer-to-peer parking ecosystem connecting car owners, space hosts, and professional valet drivers. Find spots, share spaces, and summon valets on demand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="btn-glow group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-0.5 text-base"
            >
              <Zap className="w-5 h-5" />
              Start for Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-indigo-500/30 text-[var(--text-primary)] font-bold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 text-base"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {[Users, Car, Shield, Zap, MapPin].map((Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[var(--bg-page)] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              ))}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              <span className="font-bold text-[var(--text-primary)]">48,000+</span> drivers trust VolenPark
              <span className="ml-2 text-amber-400">★★★★★</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section className="border-y border-[var(--border-color)] bg-[var(--bg-card)] py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.1)} className="text-center">
                <s.icon className={`w-7 h-7 mx-auto mb-3 ${s.color}`} />
                <p className="text-3xl font-black text-[var(--text-primary)] mb-1">{s.value}</p>
                <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ ROLE CARDS ════ */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 block">How It Works</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Choose Your Role</h2>
            <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">VolenPark connects three distinct user roles to build a seamless smart parking ecosystem.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {ROLES.map((role, i) => (
              <motion.div key={role.title} {...fadeUp(i * 0.15)} className={`card-premium p-8 flex flex-col group`}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg ${role.glow} mb-6`}>
                  <role.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">{role.tag}</span>
                <h3 className="text-2xl font-black mb-3">{role.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6">{role.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {role.perks.map(p => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={role.href}
                  className={`flex items-center gap-2 font-bold text-sm bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent group-hover:opacity-80 transition-all`}
                >
                  {role.cta} <ArrowRight className="w-4 h-4" style={{ color: '#6366F1' }} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES GRID ════ */}
      <section id="marketplace" className="py-24 bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-3 block">Everything You Need</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Platform Features</h2>
            <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">Every tool you need to park, host, and earn — built into one seamless experience.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const c = colorMap[f.color];
              return (
                <motion.div key={f.title} {...fadeUp(i * 0.08)} className={`card-premium p-6 group cursor-default border border-[var(--border-color)] ${c.border} transition-all`}>
                  <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <h3 className="font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3 block">Social Proof</span>
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Loved by Thousands</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.15)} className="card-premium p-7">
                <div className="flex text-amber-400 mb-4">
                  {Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <blockquote className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">"{t.quote}"</blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA BANNER ════ */}
      <section className="py-24 bg-[var(--bg-card)]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div {...fadeUp()} className="rounded-3xl animated-gradient p-px">
            <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-indigo-900/90 to-purple-900/90 px-8 py-16 text-white">
              <h2 className="text-4xl sm:text-5xl font-black mb-4">Ready to park smarter?</h2>
              <p className="text-indigo-200 text-lg mb-8">Join 48,000+ drivers already using VolenPark every day.</p>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-black px-8 py-4 rounded-2xl hover:-translate-y-0.5 transition-transform shadow-xl text-base">
                <Zap className="w-5 h-5" />
                Create Free Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
