import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/app_logo.png';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#05070d]">
      <div className="bg-noise" />
      
      {/* Cinematic Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb orb-1" style={{ width: 600, height: 600, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(0,59,142,0.1) 0%, transparent 60%)' }} />
        <div className="ambient-orb orb-2" style={{ width: 500, height: 500, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(200,35,44,0.15) 0%, transparent 60%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md glass-surface p-8 sm:p-10 rounded-[2rem] relative z-10"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-white/[0.03] to-transparent rounded-bl-full pointer-events-none" />

        <div className="mb-10 relative z-10 flex items-start justify-between">
          <div className="pt-2">
            <h1 className="text-3xl font-normal text-white tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glass-surface text-red-400">
                <ShieldCheck size={16} />
              </div>
              Admin
            </h1>
            <p className="text-sm text-white/40 mt-2 font-light">Authorized personnel only</p>
          </div>
          <img src={logo} alt="BOA PAY" className="h-20 w-auto" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.15))' }} />
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/50 uppercase tracking-widest">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="email"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl outline-none transition-all text-white font-normal input-elegant"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/50 uppercase tracking-widest">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="password"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl outline-none transition-all text-white font-normal input-elegant"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 rounded-xl font-normal text-sm transition-all cursor-pointer"
            style={{ background: 'rgba(200,35,44,0.1)', border: '1px solid rgba(200,35,44,0.3)', color: '#f87171' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#C8232C'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,35,44,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          >
            Authenticate
          </button>
        </form>

        <div className="mt-8 pt-6 text-center border-t border-white/[0.04] relative z-10">
          <button
            onClick={() => navigate('/user/login')}
            className="text-[10px] font-normal uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            ← Back to User Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
