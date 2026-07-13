import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Key, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#0b0f19] text-gray-100 min-h-screen font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/75 border-b border-gray-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-wider">
              VOLENPARK
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#marketplace" className="hover:text-indigo-400 transition-colors">Marketplace</a>
            <a href="#valet" className="hover:text-indigo-400 transition-colors">Valet Service</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold hover:text-indigo-400 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-6 animate-pulse">
            <Shield className="w-3.5 h-3.5" /> Next-Gen Smart Parking Marketplace
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-8 leading-tight">
            Stress-Free Parking.<br/>
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              Anytime, Anywhere.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
            The peer-to-peer parking ecosystem connecting car owners, space hosts, and professional valet drivers. Find spots, share spaces, and summon on demand.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:-translate-y-0.5">
              Book a Spot
            </Link>
            <Link to="/register" className="w-full sm:w-auto bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 font-bold px-8 py-4 rounded-xl hover:bg-gray-800 transition-all">
              Host Your Space
            </Link>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">Choose Your Role</h2>
          <p className="text-gray-400">VolenPark connects three distinct user roles to build a smart ecosystem.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Car Owner */}
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800/80 p-8 rounded-2xl hover:border-indigo-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">Car Owners</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Search real-time parking spaces. Use maps to choose the closest spot, choose valet pick-and-drop, and summon your car on-demand with live GPS tracking.
              </p>
            </div>
            <Link to="/register?role=owner" className="text-sm font-semibold text-indigo-400 group-hover:underline flex items-center gap-1.5 mt-auto">
              Get Started as Owner &rarr;
            </Link>
          </div>

          {/* Parking Provider */}
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800/80 p-8 rounded-2xl hover:border-purple-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 mb-6">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">Space Hosts</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                List your driveway, garage, or unused commercial lot. Set your hourly pricing, define availability schedules, accept reservations, and withdraw earnings.
              </p>
            </div>
            <Link to="/register?role=provider" className="text-sm font-semibold text-purple-400 group-hover:underline flex items-center gap-1.5 mt-auto">
              Become a Host &rarr;
            </Link>
          </div>

          {/* Valet Driver */}
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800/80 p-8 rounded-2xl hover:border-pink-500/50 transition-all group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 text-pink-400 mb-6">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Valet Drivers</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Accept bookings, run digital inspections on vehicle status with 4-side photos, scan secure check-in QR codes, park the cars safely, and earn money.
              </p>
            </div>
            <Link to="/register?role=valet" className="text-sm font-semibold text-pink-400 group-hover:underline flex items-center gap-1.5 mt-auto">
              Join as Valet &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-950/80 bg-gray-950/50 py-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} VolenPark Platforms Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
