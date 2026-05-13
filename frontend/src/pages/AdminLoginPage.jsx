import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    if (token && role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/login', { email, password });
      localStorage.setItem('adminToken', res.data.token);
      localStorage.setItem('adminRole', 'admin');
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Admin Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control</h1>
          <p className="text-sm text-slate-500 mt-1">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Admin Email</label>
            <input 
              type="email" 
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-slate-900"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Access Key</label>
            <input 
              type="password" 
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all text-slate-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-lg font-semibold transition-colors mt-2">
            Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <button 
            onClick={() => navigate('/user/login')}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← Back to User Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
