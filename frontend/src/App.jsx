import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

// Lazy load pages for code-splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OwnerDashboard = lazy(() => import('./pages/OwnerDashboard'));
const ProviderDashboard = lazy(() => import('./pages/ProviderDashboard'));
const ValetDashboard = lazy(() => import('./pages/ValetDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ParkingMap = lazy(() => import('./pages/ParkingMap'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const BookingFlow = lazy(() => import('./pages/BookingFlow'));
const LiveTracking = lazy(() => import('./pages/LiveTracking'));
const JobView = lazy(() => import('./pages/JobView'));
const ValetKYC = lazy(() => import('./pages/ValetKYC'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Protected Route Component to enforce role-based access
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-[var(--bg-page)] text-[var(--text-muted)] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const currentRole = user.role === 'car_owner' ? 'owner' 
                    : user.role === 'parking_provider' || user.role === 'space_provider' ? 'provider' 
                    : user.role === 'valet_driver' ? 'valet' 
                    : user.role;

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    if (currentRole === 'admin') return <Navigate to="/admin" replace />;
    if (currentRole === 'provider') return <Navigate to="/provider" replace />;
    if (currentRole === 'valet') return <Navigate to="/valet" replace />;
    return <Navigate to="/owner" replace />;
  }

  return children;
};

// Route wrapper that redirects logged-in users away from auth pages
const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    const currentRole = user.role === 'car_owner' ? 'owner' 
                      : user.role === 'parking_provider' || user.role === 'space_provider' ? 'provider' 
                      : user.role === 'valet_driver' ? 'valet' 
                      : user.role;
    if (currentRole === 'admin') return <Navigate to="/admin" replace />;
    if (currentRole === 'provider') return <Navigate to="/provider" replace />;
    if (currentRole === 'valet') return <Navigate to="/valet" replace />;
    return <Navigate to="/owner" replace />;
  }

  return children;
};

// Loading fallback for Suspense
const PageLoader = () => (
  <div className="bg-[var(--bg-page)] min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeToggle />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

              {/* Settings */}
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['owner', 'provider', 'valet', 'admin']}><SettingsPage /></ProtectedRoute>} />

              {/* Dashboards */}
              <Route path="/owner/*" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
              <Route path="/provider/*" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
              <Route path="/valet/*" element={<ProtectedRoute allowedRoles={['valet']}><ValetDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

              {/* Additional Pages */}
              <Route path="/valet/job/:id" element={<ProtectedRoute allowedRoles={['valet']}><JobView /></ProtectedRoute>} />
              <Route path="/valet/kyc" element={<ProtectedRoute allowedRoles={['valet']}><ValetKYC /></ProtectedRoute>} />
              <Route path="/map" element={<ProtectedRoute allowedRoles={['owner']}><ParkingMap /></ProtectedRoute>} />
              <Route path="/payment/:id?" element={<ProtectedRoute allowedRoles={['owner']}><PaymentPage /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute allowedRoles={['owner']}><BookingFlow /></ProtectedRoute>} />
              <Route path="/tracking/:id" element={<ProtectedRoute allowedRoles={['owner']}><LiveTracking /></ProtectedRoute>} />

              {/* Catch All Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
