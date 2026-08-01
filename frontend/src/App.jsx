import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ValetDashboard from './pages/ValetDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ParkingMap from './pages/ParkingMap';
import PaymentPage from './pages/PaymentPage';
import OwnerVehicles from './pages/OwnerVehicles';
import BookingFlow from './pages/BookingFlow';
import LiveTracking from './pages/LiveTracking';
import JobView from './pages/JobView';
import ValetKYC from './pages/ValetKYC';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

// Protected Route Component to enforce role-based access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-[#0b0f19] text-gray-400 min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin">
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their default role dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider" replace />;
    if (user.role === 'valet') return <Navigate to="/valet" replace />;
    return <Navigate to="/owner" replace />;
  }

  return children;
};

// Route wrapper that redirects logged-in users away from auth pages
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider" replace />;
    if (user.role === 'valet') return <Navigate to="/valet" replace />;
    return <Navigate to="/owner" replace />;
  }

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeToggle />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes (Redirects if already logged in) */}
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            {/* Role Protected Dashboards */}
            <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />

            <Route path="/owner/vehicles" element={<ProtectedRoute allowedRoles={['owner']}><OwnerVehicles /></ProtectedRoute>} />

            <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />

            <Route path="/valet" element={<ProtectedRoute allowedRoles={['valet']}><ValetDashboard /></ProtectedRoute>} />

            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="/valet/job/:id" element={<ProtectedRoute allowedRoles={['valet']}><JobView /></ProtectedRoute>} />

            <Route path="/valet/kyc" element={<ProtectedRoute allowedRoles={['valet']}><ValetKYC /></ProtectedRoute>} />

            <Route path="/map" element={<ProtectedRoute allowedRoles={['owner']}><ParkingMap /></ProtectedRoute>} />

            <Route path="/payment/:id?" element={<ProtectedRoute allowedRoles={['owner']}><PaymentPage /></ProtectedRoute>} />

            <Route path="/book/:id" element={<ProtectedRoute allowedRoles={['owner']}><BookingFlow /></ProtectedRoute>} />
            <Route path="/tracking/:id" element={<ProtectedRoute allowedRoles={['owner']}><LiveTracking /></ProtectedRoute>} />

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
