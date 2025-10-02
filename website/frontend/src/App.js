import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';
import axios from 'axios';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboards/Dashboard';
import Sidebar from './components/layout/Sidebar';
import TimesheetSubmission from './components/timesheets/TimesheetSubmission';
import TimesheetManagement from './components/timesheets/TimesheetManagement';
import TimesheetApproval from './components/timesheets/TimesheetApproval';
import ProjectManagement from './components/projects/ProjectManagement';
import UserManagement from './components/users/UserManagement';
import ManagerTimesheetSummary from './components/timesheets/ManagerTimesheetSummary';
import DebugMe from './components/DebugMe';

// Import styles
import 'react-toastify/dist/ReactToastify.css';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:8081';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Layout wrapper component
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

// Protected Route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  
  // Debug: log user and required roles to help diagnose access issues
  // (safe to remove once issue is resolved)
  // eslint-disable-next-line no-console
  console.log('ProtectedRoute check - user:', user, 'loading:', loading, 'requiredRoles:', roles);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Provide a clearer UI for denied access showing the detected role (if any)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <div className="mt-3 text-sm text-gray-500">
            <div>Required roles: {roles.join(', ') || 'any'}</div>
            <div>Detected role: {user?.role ?? 'none (not authenticated)'}</div>
            <pre className="mt-2 text-xs text-left bg-gray-50 p-2 rounded max-w-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }
  
  return <Layout>{children}</Layout>;
};

// Main App component
const App = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Employee routes */}
        <Route 
          path="/timesheets/submit" 
          element={
            <ProtectedRoute roles={['EMPLOYEE']}>
              <TimesheetSubmission />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/timesheets/manage" 
          element={
            <ProtectedRoute roles={['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN']}>
              <TimesheetManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Manager routes */}
        <Route 
          path="/timesheets/approval" 
          element={
            <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
              <TimesheetApproval />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/timesheets/summary"
          element={
            <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
              <ManagerTimesheetSummary />
            </ProtectedRoute>
          }
        />
        
        {/* HR routes */}
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute roles={['HR', 'ADMIN']}>
              <ProjectManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin and HR routes */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute roles={['ADMIN', 'HR']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />

        {/* Debug route - authenticated users only */}
        <Route
          path="/debug/me"
          element={
            <ProtectedRoute>
              <DebugMe />
            </ProtectedRoute>
          }
        />
        
        {/* 404 route */}
        <Route 
          path="*" 
          element={
            <div className="flex justify-center items-center h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
                <p className="text-gray-600">The page you're looking for doesn't exist.</p>
              </div>
            </div>
          } 
        />
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
};

export default App;