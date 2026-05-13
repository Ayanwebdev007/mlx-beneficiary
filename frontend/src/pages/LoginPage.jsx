import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    if (token && role === 'user') {
      navigate('/user/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userRole', 'user');
      navigate('/user/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="text-sm text-slate-500 mt-1">Access your MLX account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email" 
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors mt-2">
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="text-indigo-600 font-medium hover:underline">Register</Link>
          </p>
          <Link to="/admin/login" className="block text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
