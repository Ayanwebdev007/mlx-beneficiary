import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Database, LogOut, Trash2, Plus, Edit2, LayoutDashboard, ChevronRight, X, MessageSquare, AlertCircle, Eye, EyeOff, CheckSquare, Square, CheckCircle2, Clock, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/app_logo.png';

// Theme Colors from Logo
const COLORS = {
  navy: '#003B8E',
  red: '#C8232C',
  white: '#FFFFFF',
  lightGray: '#F8FAFC',
  border: '#E2E8F0'
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalBeneficiaries: 0 });
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('Dashboard');
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: 'Andhra Pradesh',
    gender: 'Male',
    isActive: true, // Legacy support if needed, but we'll use status
    status: 'Active',
    comment: '',
    images: [],
    groupId: 1
  });
  const [isUploading, setIsUploading] = useState(false);

  const [globalRegNo, setGlobalRegNo] = useState('');
  const [groupStatuses, setGroupStatuses] = useState([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  
  // Termination Modal State
  const [showTermModal, setShowTermModal] = useState(false);
  const [termData, setTermData] = useState({ id: null, reason: '', isTerminated: false, isHidden: false });

  // Credential Management State
  const [credentialUsers, setCredentialUsers] = useState([]);
  const [showCredModal, setShowCredModal] = useState(false);
  const [selectedCredGroup, setSelectedCredGroup] = useState(null); // null for Universal
  const [credFormData, setCredFormData] = useState({ email: '', password: '' });
  const [isSavingCred, setIsSavingCred] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchData();
    fetchConfig();
    fetchGroupStatuses();
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCredentialUsers(res.data);
    } catch (err) {
      console.error('Credentials fetch error:', err);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    setIsSavingCred(true);
    try {
      await axios.post('/api/admin/users', { 
        email: credFormData.email, 
        password: credFormData.password, 
        groupId: selectedCredGroup 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Credentials updated successfully');
      setShowCredModal(false);
      fetchCredentials();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating credentials');
    } finally {
      setIsSavingCred(false);
    }
  };

  const fetchGroupStatuses = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/group-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupStatuses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Group status fetch error:', err);
    }
  };

  const handleUpdateGroupStatus = async (groupId, isTerminated, isHidden, reason) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/group-status', { groupId, isTerminated, isHidden, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroupStatuses();
    } catch (err) {
      alert('Error updating group status');
    }
  };

  const fetchConfig = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('/api/config/registrationNumber', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGlobalRegNo(res.data.value);
    } catch (err) {
      console.error('Config fetch error:', err);
    }
  };

  const handleSaveConfig = async () => {
    const token = localStorage.getItem('adminToken');
    setIsSavingConfig(true);
    try {
      await axios.post('/api/config', { key: 'registrationNumber', value: globalRegNo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Registration Number updated successfully');
    } catch (err) {
      alert('Error saving configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    if (!token || role !== 'admin') return navigate('/admin/login');

    try {
      const statsRes = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const beneRes = await axios.get('/api/beneficiaries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);
      setBeneficiaries(Array.isArray(beneRes.data) ? beneRes.data : []);
      setLoading(false);
    } catch (err) {
      console.error('Admin fetch error:', err);
      navigate('/admin/login');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/beneficiaries/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Error deleting beneficiary');
    }
  };

  const handleEdit = (beneficiary) => {
    setEditId(beneficiary._id);
    setFormData({
      name: beneficiary.name,
      address: beneficiary.address,
      gender: beneficiary.gender,
      isActive: beneficiary.status === 'Active',
      status: beneficiary.status || 'Active',
      comment: beneficiary.comment,
      images: beneficiary.images || [],
      groupId: beneficiary.groupId
    });
    setShowAddModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    const token = localStorage.getItem('adminToken');
    
    for (const file of files) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise((resolve) => {
        reader.onload = async () => {
          try {
            const res = await axios.post('/api/upload', { image: reader.result }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), res.data.url]
            }));
          } catch (err) {
            alert('Failed to upload image: ' + (err.response?.data?.message || err.message));
          }
          resolve();
        };
      });
    }
    setIsUploading(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editId) {
        await axios.put(`/api/beneficiaries/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Beneficiary updated successfully');
      } else {
        await axios.post('/api/beneficiaries', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Beneficiary added successfully');
      }
      setShowAddModal(false);
      setEditId(null);
      setFormData({ name: '', address: 'Andhra Pradesh', gender: 'Male', status: 'Active', comment: '', images: [], groupId: 1 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRole');
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#003B8E] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 bg-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <img src={logo} alt="BOA PAY" className="h-16 w-auto mb-2" />
            <div>
              <h1 className="text-xl font-normal text-slate-900 tracking-tight uppercase">BOA BENEFICIARY</h1>
              <p className="text-[10px] font-light text-[#C8232C] uppercase tracking-[0.3em]">Authorized Only</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {[
            { label: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'Dashboard' },
            { label: 'Users', icon: <Users size={20} />, id: 'Users' },
            { label: 'Groups', icon: <Shield size={20} />, id: 'Groups' },
            { label: 'Reg No', icon: <AlertCircle size={20} />, id: 'Reg No' },
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl font-normal transition-all ${currentView === item.id ? 'bg-[#003B8E] text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200">
          <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#003B8E]/10 rounded-xl flex items-center justify-center text-[#003B8E]">
                <Shield size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-normal text-slate-900">System Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">Online</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:text-[#C8232C] rounded-2xl transition-all font-normal text-sm uppercase tracking-widest">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 border-b border-slate-200 flex items-center justify-between px-10 bg-white sticky top-0 z-30">
          <div>
            <h2 className="text-2xl font-normal text-slate-900">{currentView}</h2>
            <p className="text-xs font-normal text-slate-400 mt-0.5">Control Center / {currentView}</p>
          </div>
          {currentView === 'Users' && (
            <button 
              onClick={() => { setEditId(null); setFormData({ name: '', address: 'Andhra Pradesh', gender: 'Male', status: 'Active', comment: '', images: [], groupId: 1 }); setShowAddModal(true); }}
              className="bg-[#003B8E] hover:bg-[#002B6E] text-white px-6 py-3.5 rounded-2xl font-normal text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus size={18} />
              Add Beneficiary
            </button>
          )}
        </header>

        <div className="p-10">
          {currentView === 'Dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Users Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between h-[380px] group hover:border-[#003B8E] transition-all"
              >
                <div>
                  <div className="w-16 h-16 bg-blue-50 text-[#003B8E] rounded-2xl flex items-center justify-center mb-6">
                    <Users size={32} />
                  </div>
                  <p className="text-slate-400 text-xs font-normal uppercase tracking-[0.2em] mb-2">Authorized Registry</p>
                  <h3 className="text-6xl font-normal text-slate-900 tracking-tighter">{(beneficiaries || []).length}</h3>
                  <p className="text-sm font-normal text-slate-400 mt-2">Active records verified</p>
                </div>
                <button 
                  onClick={() => setCurrentView('Users')}
                  className="w-full bg-[#003B8E] text-white py-4 rounded-2xl font-normal text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <Plus size={16} />
                  Add New Record
                </button>
              </motion.div>

              {/* Groups Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col justify-between h-[380px] group hover:border-[#C8232C] transition-all"
              >
                <div>
                  <div className="w-16 h-16 bg-red-50 text-[#C8232C] rounded-2xl flex items-center justify-center mb-6">
                    <Shield size={32} />
                  </div>
                  <p className="text-slate-400 text-xs font-normal uppercase tracking-[0.2em] mb-2">Operational Groups</p>
                  <h3 className="text-6xl font-normal text-slate-900 tracking-tighter">
                    0{9 - (Array.isArray(groupStatuses) ? groupStatuses : []).filter(s => s.isTerminated).length}
                  </h3>
                  <p className="text-sm font-normal text-slate-400 mt-2">Active security units</p>
                </div>
                <button 
                  onClick={() => setCurrentView('Groups')}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-normal text-xs uppercase tracking-widest hover:bg-[#C8232C] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                >
                  <LayoutDashboard size={16} />
                  Manage Groups
                </button>
              </motion.div>

              {/* Registration Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#003B8E] p-10 rounded-[3rem] flex flex-col justify-between h-[380px] shadow-xl shadow-blue-900/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Database size={120} />
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6">
                    <AlertCircle size={32} />
                  </div>
                  <p className="text-blue-200/50 text-xs font-normal uppercase tracking-[0.2em] mb-2">Global Identifier</p>
                  <h3 className="text-3xl font-normal text-white tracking-tight break-all">
                    {globalRegNo || 'NOT-SET'}
                  </h3>
                  <p className="text-sm font-normal text-blue-200/40 mt-4">Current Master ID</p>
                </div>
                <button 
                  onClick={() => setCurrentView('Reg No')}
                  className="w-full bg-white text-[#003B8E] py-4 rounded-2xl font-normal text-xs uppercase tracking-widest hover:bg-red-50 hover:text-[#C8232C] transition-all flex items-center justify-center gap-2 relative z-10"
                >
                  <Edit2 size={16} />
                  Change Number
                </button>
              </motion.div>
            </div>
          )}

          {currentView === 'Reg No' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl"
            >
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 bg-[#C8232C]/10 text-[#C8232C] rounded-[1.5rem] flex items-center justify-center">
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-normal text-slate-900">Portal Configuration</h3>
                    <p className="text-sm font-normal text-slate-400">Manage global identifiers and system parameters</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">Master Registration Number</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="text" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:border-[#003B8E] focus:bg-white outline-none transition-all text-slate-900 font-normal"
                        placeholder="E.g. BOA-MAIN-2026"
                        value={globalRegNo}
                        onChange={(e) => setGlobalRegNo(e.target.value)}
                      />
                      <button 
                        onClick={handleSaveConfig}
                        disabled={isSavingConfig}
                        className="bg-[#003B8E] text-white px-10 py-4 rounded-2xl font-normal text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:bg-black transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {isSavingConfig ? 'Applying...' : 'Apply Changes'}
                      </button>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                      <AlertCircle size={16} className="text-[#003B8E] mt-0.5 shrink-0" />
                      <p className="text-xs font-normal text-[#003B8E] leading-relaxed">
                        Important: This registration number is displayed at the top of the Beneficiary Portal. Any changes will be visible immediately to all logged-in users.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'Groups' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl"
            >
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 bg-[#C8232C]/10 text-[#C8232C] rounded-[1.5rem] flex items-center justify-center">
                    <Shield size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-normal text-slate-900">Group Termination Control</h3>
                    <p className="text-sm font-normal text-slate-400">Suspend groups and provide termination notices</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Universal Credential Section */}
                  <div className="p-8 rounded-[2rem] bg-[#003B8E]/5 border border-[#003B8E]/10 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#003B8E]/5 rounded-full blur-2xl group-hover:bg-[#003B8E]/10 transition-all" />
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#003B8E] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                          <CheckSquare size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-normal text-slate-900">Universal Access Login</h4>
                          <p className="text-xs font-normal text-slate-400">Can view and manage all 9 groups</p>
                          <p className="text-[10px] font-medium text-[#003B8E] mt-1 bg-white px-2 py-0.5 rounded-full border border-blue-100 w-fit">
                            {credentialUsers.find(u => u.groupId === null)?.email || 'Not configured'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const existing = credentialUsers.find(u => u.groupId === null);
                          setCredFormData({ email: existing?.email || '', password: existing?.password || '' });
                          setSelectedCredGroup(null);
                          setShowCredModal(true);
                        }}
                        className="px-8 py-3 bg-white text-[#003B8E] border border-blue-100 rounded-xl font-normal text-[10px] uppercase tracking-widest hover:bg-[#003B8E] hover:text-white transition-all shadow-sm"
                      >
                        Set Universal Creds
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full" />
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.2em] ml-1">Individual Group Logins</p>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((id) => {
                    const status = (groupStatuses || []).find(s => s.groupId === id) || { isTerminated: false, isHidden: false, reason: '' };
                    const user = credentialUsers.find(u => u.groupId === id);
                    return (
                      <div key={id} className="flex flex-col p-6 rounded-3xl border border-slate-200 bg-white hover:border-[#003B8E]/30 transition-all group shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-normal text-slate-900 border border-slate-200 shadow-sm shrink-0">
                            {id}
                          </div>
                          <div className="flex-1 w-full">
                            <p className={`text-xs font-normal ${status.isTerminated ? 'text-[#C8232C]' : 'text-slate-400'}`}>
                              {status.isTerminated ? `Reason: ${status.reason || 'Not specified'}` : 'Group Operational & Active'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Login:</span>
                              <span className="text-[10px] font-normal text-slate-600">{user?.email || 'No specific login set'}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button 
                              onClick={() => {
                                const existing = credentialUsers.find(u => u.groupId === id);
                                setCredFormData({ email: existing?.email || '', password: existing?.password || '' });
                                setSelectedCredGroup(id);
                                setShowCredModal(true);
                              }}
                              className="p-2.5 rounded-xl transition-all border bg-blue-50 text-[#003B8E] border-blue-100 hover:bg-[#003B8E] hover:text-white"
                              title="Set Group Login"
                            >
                              <Shield size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateGroupStatus(id, status.isTerminated, !status.isHidden, status.reason)}
                              className={`p-2.5 rounded-xl transition-all border ${status.isHidden ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900'}`}
                              title={status.isHidden ? 'Unhide Group' : 'Hide Group'}
                            >
                              {status.isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                            <button 
                              onClick={() => {
                                if (status.isTerminated) {
                                  handleUpdateGroupStatus(id, false, status.isHidden, '');
                                } else {
                                  setTermData({ id, isTerminated: true, isHidden: status.isHidden, reason: '' });
                                  setShowTermModal(true);
                                }
                              }}
                              className={`px-6 py-2.5 rounded-xl font-normal text-[10px] uppercase tracking-widest transition-all ${status.isTerminated ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700' : 'bg-white text-slate-500 border-2 border-slate-200 hover:text-red-600 hover:border-red-600'}`}
                            >
                              {status.isTerminated ? 'Reactivate' : 'Terminate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentView === 'Users' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-blue-50 border-b border-blue-100">
                      <th className="px-8 py-6 text-[#003B8E] font-normal text-[10px] uppercase tracking-[0.2em]">BOA Applicant Names</th>
                      <th className="px-8 py-6 text-[#003B8E] font-normal text-[10px] uppercase tracking-[0.2em]">State Assignment</th>
                      <th className="px-8 py-6 text-[#003B8E] font-normal text-[10px] uppercase tracking-[0.2em]">Group ID</th>
                      <th className="px-8 py-6 text-[#003B8E] font-normal text-[10px] uppercase tracking-[0.2em]">Profile Status</th>
                      <th className="px-8 py-6 text-[#003B8E] font-normal text-[10px] uppercase tracking-[0.2em] text-right">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(Array.isArray(beneficiaries) ? beneficiaries : []).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-24 text-center flex flex-col items-center gap-4">
                          <AlertCircle size={48} className="text-slate-100" />
                          <p className="text-slate-400 font-bold italic">No records found. Click 'Add Beneficiary' to start.</p>
                        </td>
                      </tr>
                    ) : (
                      (Array.isArray(beneficiaries) ? beneficiaries : []).map((b) => (
                        <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                            <span className="font-normal text-slate-900 block">{b.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-tight">Reg: {b._id.substring(20)}</span>
                          </td>
                          <td className="px-8 py-6 text-slate-500 font-normal text-sm">{b.address}</td>
                          <td className="px-8 py-6">
                            <span className="bg-[#003B8E]/5 text-[#003B8E] px-4 py-1.5 rounded-xl text-[10px] font-normal uppercase tracking-widest border border-blue-100">Group {b.groupId}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-normal uppercase tracking-widest inline-flex items-center gap-2 border ${
                              b.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                              b.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                              'bg-red-50 text-[#C8232C] border-red-100'
                            }`}>
                              {b.status === 'Active' ? <CheckSquare size={13} strokeWidth={2.5} /> : 
                               b.status === 'On Hold' ? <Clock size={13} strokeWidth={2.5} /> : 
                               <Square size={13} strokeWidth={2.5} />}
                              {b.status || 'Active'}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right flex justify-end gap-3">
                            <button onClick={() => handleEdit(b)} className="p-3 text-slate-400 hover:text-[#003B8E] hover:bg-blue-50 rounded-xl transition-all" title="Modify Record">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(b._id)} className="p-3 text-slate-400 hover:text-[#C8232C] hover:bg-red-50 rounded-xl transition-all" title="Delete Permanent">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl p-8 rounded-[2.5rem] relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-[#C8232C] uppercase tracking-[0.2em] mb-1">Record Entry</p>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editId ? 'Update Record' : 'Enroll New Member'}</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <input required type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#003B8E] focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm" placeholder="E.g. Rajesh Kumar" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">State Assignment</label>
                  <select required className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none text-slate-900 font-black appearance-none cursor-pointer focus:border-[#003B8E] focus:bg-white text-sm" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}>
                    <option value="" disabled>Select Location</option>
                    {["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Identification</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none text-slate-900 font-black appearance-none cursor-pointer focus:border-[#003B8E] text-sm" value={formData.groupId} onChange={(e) => setFormData({...formData, groupId: parseInt(e.target.value)})}>
                    {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>Group {n}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender Specification</label>
                  <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none text-slate-900 font-black appearance-none cursor-pointer text-sm" value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Status</label>
                  <select className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 outline-none font-black appearance-none cursor-pointer focus:bg-white text-sm ${
                    formData.status === 'Active' ? 'text-emerald-600 border-emerald-100' : 
                    formData.status === 'On Hold' ? 'text-amber-600 border-amber-100' : 
                    'text-red-600 border-red-100'
                  }`} value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Remarks</label>
                  <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:border-[#003B8E] focus:bg-white outline-none transition-all text-slate-900 font-bold h-24 resize-none text-sm" placeholder="Internal notes..." value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks Images</label>
                  
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {formData.images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                          <img src={url} alt="remark upload" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-md cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed transition-all cursor-pointer ${
                      isUploading ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#003B8E]'
                    }`}>
                      <div className="flex items-center gap-2 text-slate-400">
                        {isUploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-[#003B8E] rounded-full animate-spin" />
                            <span className="text-xs font-bold">Uploading files...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="text-[#003B8E]" />
                            <span className="text-xs font-bold text-slate-600">Click to attach images</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 col-span-2 mt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 rounded-2xl font-normal text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">Abort</button>
                  <button type="submit" disabled={isUploading} className="flex-1 bg-[#003B8E] text-white py-3.5 rounded-2xl font-normal text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-[#002B6E] hover:scale-[1.02] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isUploading ? 'Uploading...' : 'Commit'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Termination Modal */}
      <AnimatePresence>
        {showTermModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTermModal(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md p-8 rounded-[2.5rem] relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-red-50 text-[#C8232C] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={40} />
                </div>
                <h2 className="text-2xl font-normal text-slate-900 tracking-tight">Confirm Termination</h2>
                <p className="text-xs font-normal text-slate-400 mt-2">You are about to suspend Group {termData.id}</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">Termination Reason</label>
                  <textarea 
                    autoFocus
                    required
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-[#C8232C] focus:bg-white outline-none transition-all text-slate-900 font-normal text-sm h-32 resize-none"
                    placeholder="E.g. Documentation incomplete, awaiting verification..."
                    value={termData.reason}
                    onChange={(e) => setTermData({ ...termData, reason: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowTermModal(false)}
                    className="flex-1 py-4 rounded-2xl font-normal text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={!termData.reason.trim()}
                    onClick={() => {
                      handleUpdateGroupStatus(termData.id, true, termData.isHidden, termData.reason);
                      setShowTermModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-normal text-[10px] uppercase tracking-widest shadow-2xl shadow-red-500/40 hover:bg-red-700 hover:scale-[1.02] transition-all disabled:opacity-30 active:scale-95"
                  >
                    Confirm & Suspend
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credential Modal */}
      <AnimatePresence>
        {showCredModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCredModal(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md p-8 rounded-[2.5rem] relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-blue-50 text-[#003B8E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={40} />
                </div>
                <h2 className="text-2xl font-normal text-slate-900 tracking-tight">
                  {selectedCredGroup ? `Group ${selectedCredGroup} Login` : 'Universal Login'}
                </h2>
                <p className="text-xs font-normal text-slate-400 mt-2">Set secure credentials for this access level</p>
              </div>

              <form onSubmit={handleUpdateCredentials} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">Email / Username</label>
                  <input 
                    required
                    type="email"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-[#003B8E] focus:bg-white outline-none transition-all text-slate-900 font-normal text-sm"
                    placeholder="e.g. group1@mlx.com"
                    value={credFormData.email}
                    onChange={(e) => setCredFormData({ ...credFormData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:border-[#003B8E] focus:bg-white outline-none transition-all text-slate-900 font-normal text-sm"
                      placeholder="Enter secure password"
                      value={credFormData.password}
                      onChange={(e) => setCredFormData({ ...credFormData, password: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003B8E] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowCredModal(false)}
                    className="flex-1 py-4 rounded-2xl font-normal text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSavingCred}
                    type="submit"
                    className="flex-1 bg-[#003B8E] text-white py-4 rounded-2xl font-normal text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-500/40 hover:bg-black hover:scale-[1.02] transition-all disabled:opacity-30 active:scale-95"
                  >
                    {isSavingCred ? 'Saving...' : 'Update Login'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
