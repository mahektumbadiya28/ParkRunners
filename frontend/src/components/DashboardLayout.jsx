import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, LayoutDashboard, Car, Settings, LogOut,
  Bell, Menu, X, Sun, Moon, ChevronRight, Building2, Key,
  Shield, Check, ChevronDown
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function NavItem({ icon: Icon, label, to, active, onClick }) {
  const className = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
    active
      ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/15'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
  }`;

  const content = (
    <>
      <Icon className={`w-4.5 h-4.5 ${active ? 'text-indigo-500' : ''}`} />
      {label}
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-indigo-400" />}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`w-full text-left ${className}`}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={className}>
      {content}
    </Link>
  );
}

export default function DashboardLayout({ children, navItems = [], topNavItems = [], title = '' }) {
  const { user, logout, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const ROLES = [
    {
      id: 'owner',
      label: 'Car Owner',
      icon: Car,
      color: 'from-blue-500 to-indigo-600',
      route: '/owner',
      desc: 'Book parking, manage garage & active reservations'
    },
    {
      id: 'provider',
      label: 'Parking Provider',
      icon: Building2,
      color: 'from-emerald-500 to-teal-600',
      route: '/provider',
      desc: 'List parking spots, set rates & earn'
    },
    {
      id: 'valet',
      label: 'Valet Driver',
      icon: Key,
      color: 'from-purple-500 to-violet-600',
      route: '/valet',
      desc: 'Accept valet jobs, park vehicles & earn'
    }
  ];

  const handleSwitchRole = async (targetRole, targetRoute) => {
    setShowRoleMenu(false);
    const currentNorm = user?.role === 'car_owner' ? 'owner' : user?.role === 'space_provider' ? 'provider' : user?.role === 'valet_driver' ? 'valet' : user?.role;
    if (currentNorm === targetRole) {
      toast.success(`Already on ${targetRole.toUpperCase()} Dashboard`);
      navigate(targetRoute);
      return;
    }
    const roleObj = ROLES.find(r => r.id === targetRole);
    toast.success(`Role switched to ${roleObj?.label || targetRole}!`);
    await switchRole(targetRole);
    navigate(targetRoute);
  };

  const roleColors = {
    owner: 'from-indigo-600 to-blue-600',
    provider: 'from-purple-600 to-violet-600',
    valet: 'from-rose-600 to-pink-600',
    admin: 'from-red-600 to-orange-600',
  };
  const gradient = roleColors[user?.role] || 'from-indigo-600 to-purple-600';

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <MapPin className="w-6 h-6 text-indigo-500" />
          <span className="font-black gradient-text text-lg tracking-tight">VOLENPARK</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <NavItem key={item.to || index} {...item} active={item.active !== undefined ? item.active : location.pathname === item.to} />
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="p-4 border-t border-[var(--border-color)] space-y-1">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-[var(--bg-card)] border-r border-[var(--border-color)]">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-[var(--bg-card)] border-r border-[var(--border-color)] lg:hidden"
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-[var(--bg-card)] border-b border-[var(--border-color)] flex-shrink-0 relative">
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-[var(--bg-card-hover)] transition-all">
              <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            {title && <h1 className="text-lg font-bold text-[var(--text-primary)] hidden sm:block">{title}</h1>}
          </div>
            
          {/* Top Nav Items */}
          {topNavItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
              {topNavItems.map((item, index) => {
                const active = item.active !== undefined ? item.active : location.pathname === item.to;
                const content = (
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                );
                const cls = `px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-indigo-500/10 text-indigo-500'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                }`;

                if (item.onClick) {
                  return <button key={item.to || index} onClick={item.onClick} className={cls}>{content}</button>;
                }
                return <Link key={item.to || index} to={item.to} className={cls}>{content}</Link>;
              })}
            </nav>
          )}

          <div className="flex items-center gap-4 flex-1 justify-end">
            <button className="relative p-2.5 rounded-full hover:bg-[var(--bg-card-hover)] transition-all text-[var(--text-muted)]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[var(--bg-card)]" />
            </button>
            {/* Interactive User Profile & Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-3 pl-2 pr-3.5 py-1.5 rounded-full bg-[var(--bg-card-hover)] border border-[var(--border-color)] cursor-pointer hover:border-indigo-500/40 transition-all shadow-sm group"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md`}>
                  {(user?.name || user?.fullName || 'User').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-bold text-[var(--text-primary)] leading-none mb-1 group-hover:text-indigo-500 transition-colors">
                    {user?.name || user?.fullName || 'User'}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider leading-none flex items-center gap-1">
                    {user?.role ? user.role.replace('_', ' ') : 'User'}
                    <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${showRoleMenu ? 'rotate-180 text-indigo-500' : ''}`} />
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {showRoleMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-80 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl z-50 overflow-hidden p-2 space-y-1 backdrop-blur-xl"
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-color)] mb-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Switch Account Role</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">Switch your workspace view instantly</p>
                    </div>

                    {ROLES.map((r) => {
                      const activeRole = user?.role === 'car_owner' ? 'owner' : user?.role === 'space_provider' ? 'provider' : user?.role === 'valet_driver' ? 'valet' : user?.role;
                      const isActive = activeRole === r.id;
                      const RoleIcon = r.icon;
                      return (
                        <button
                          key={r.id}
                          onClick={() => handleSwitchRole(r.id, r.route)}
                          className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition-all ${
                            isActive
                              ? 'bg-indigo-500/10 border border-indigo-500/30'
                              : 'hover:bg-[var(--bg-card-hover)]'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm`}>
                            <RoleIcon className="w-4.5 h-4.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isActive ? 'text-indigo-500 font-extrabold' : 'text-[var(--text-primary)]'}`}>
                                {r.label}
                              </span>
                              {isActive && (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}

                    <div className="pt-2 border-t border-[var(--border-color)] flex gap-2">
                      <button
                        onClick={() => { setShowRoleMenu(false); navigate('/settings'); }}
                        className="flex-1 text-xs font-bold py-2.5 rounded-xl text-center text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Settings className="w-3.5 h-3.5" /> Settings
                      </button>
                      <button
                        onClick={() => { setShowRoleMenu(false); handleLogout(); }}
                        className="flex-1 text-xs font-bold py-2.5 rounded-xl text-center text-red-500 hover:bg-red-500/10 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
