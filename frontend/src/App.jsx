import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem(role === 'admin' ? 'adminToken' : 'userToken');
  const userRole = localStorage.getItem(role === 'admin' ? 'adminRole' : 'userRole');
  
  if (!token) return <Navigate to={role === 'admin' ? '/admin/login' : '/user/login'} />;
  if (role && userRole !== role) return <Navigate to="/user/login" />;
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* User Routes */}
        <Route path="/user/login" element={<LoginPage />} />
        <Route path="/user/dashboard" element={
          <PrivateRoute role="user">
            <UserDashboard />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Fallback & Redirects */}
        <Route path="/" element={<Navigate to="/user/login" />} />
        <Route path="/login" element={<Navigate to="/user/login" />} />
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="*" element={<Navigate to="/user/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
