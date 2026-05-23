import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/app_logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('userToken', res.data.token);
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userGroupId', res.data.groupId);
      navigate('/user/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#05070d]">
      <div className="bg-noise" />
      
      {/* Cinematic Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb orb-1" style={{ width: 600, height: 600, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(0,59,142,0.15) 0%, transparent 60%)' }} />
        <div className="ambient-orb orb-2" style={{ width: 500, height: 500, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(200,35,44,0.1) 0%, transparent 60%)' }} />
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
            <h1 className="text-3xl font-normal text-white tracking-tight">Sign In</h1>
            <p className="text-sm text-white/40 mt-2 font-light">Access your MLX account</p>
          </div>
          <img src={logo} alt="BOA PAY" className="h-20 w-auto" style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.15))' }} />
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/50 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="email"
                className="w-full py-3.5 pl-12 pr-4 rounded-xl outline-none transition-all text-white font-normal input-elegant"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-white/50 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full py-3.5 pl-12 pr-12 rounded-xl outline-none transition-all text-white font-normal input-elegant"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors focus:outline-none cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 rounded-xl font-normal text-sm transition-all cursor-pointer"
            style={{ background: 'rgba(91,155,230,0.1)', border: '1px solid rgba(91,155,230,0.3)', color: '#5b9be6' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#5b9be6'; e.currentTarget.style.color = '#05070d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,155,230,0.1)'; e.currentTarget.style.color = '#5b9be6'; }}
          >
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 text-center border-t border-white/[0.04] relative z-10">
          <Link to="/admin/login" className="text-[10px] font-normal uppercase tracking-widest text-white/30 hover:text-[#5b9be6] transition-colors">
            Secure Admin Access
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
