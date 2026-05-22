import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, LogOut, ChevronRight, MessageSquare, X, LayoutDashboard, Database, CheckSquare, Square, CheckCircle2, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/app_logo.png';

const API_URL = '/api/beneficiaries';

function UserDashboard() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalRegNo, setGlobalRegNo] = useState('');
  const [groupStatuses, setGroupStatuses] = useState([]);
  const [userGroupId, setUserGroupId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const gid = localStorage.getItem('userGroupId');
    if (gid && gid !== 'null') {
      setUserGroupId(parseInt(gid));
    }
    fetchBeneficiaries();
    fetchConfig();
    fetchGroupStatuses();
  }, []);

  const fetchGroupStatuses = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const res = await axios.get('/api/group-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroupStatuses(res.data);
    } catch (err) {
      console.error('Group status fetch error:', err);
    }
  };

  const fetchConfig = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const res = await axios.get('/api/config/registrationNumber', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGlobalRegNo(res.data.value);
    } catch (err) {
      console.error('Config fetch error:', err);
    }
  };

  const fetchBeneficiaries = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) return navigate('/user/login');
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBeneficiaries(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
      if (err.response?.status === 401) navigate('/user/login');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userGroupId');
    navigate('/user/login');
  };

  const groups = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: `Group ${String(i + 1).padStart(2, '0')}`,
    users: beneficiaries.filter(b => b.groupId === i + 1)
  }));

  const filteredBeneficiaries = selectedGroup
    ? groups.find(g => g.id === selectedGroup).users.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070d]">
      <div className="bg-noise" />
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="relative">
          <div className="w-14 h-14 rounded-full animate-spin" style={{ border: '1px solid rgba(255,255,255,0.05)', borderTopColor: '#003B8E' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '1px solid rgba(255,255,255,0.05)', borderBottomColor: '#C8232C', animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative bg-[#05070d] selection:bg-[#003B8E]/30">
      <div className="bg-noise" />

      {/* Cinematic Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-orb orb-1" style={{ width: 800, height: 800, top: '-15%', left: '-10%', background: 'radial-gradient(circle, rgba(0,59,142,0.12) 0%, transparent 60%)' }} />
        <div className="ambient-orb orb-2" style={{ width: 600, height: 600, bottom: '-10%', right: '-5%', background: 'radial-gradient(circle, rgba(200,35,44,0.08) 0%, transparent 60%)' }} />
      </div>

      {/* Edge-lit Navigation */}
      <nav className="sticky top-0 z-40" style={{ background: 'rgba(5,7,13,0.6)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderBottom: '1px solid rgba(255,255,255,0.03)', boxShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6" style={{ height: 80 }}>
          <div className="flex items-center justify-between h-full relative z-10">
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-3 sm:gap-6">
                <img src={logo} alt="BOA PAY" className="w-auto" style={{ height: 44, filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.1))' }} />
                <div className="w-px bg-white/10" style={{ height: 32 }} />
                <div className="flex flex-col">
                  <span className="hidden sm:block text-xl font-normal text-white tracking-tight leading-tight uppercase">BOA APPLICANT NAMES</span>
                  <span className="block sm:hidden text-base font-normal text-white tracking-tight leading-tight uppercase">APPLICANTS</span>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                    <span className="hidden sm:block text-[10px] font-light text-white/40 uppercase tracking-[0.2em] leading-none">Registration ID:</span>
                    <span className="text-xs sm:text-sm font-normal uppercase tracking-widest leading-none" style={{ color: '#5b9be6' }}>{globalRegNo || 'NOT-SET'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden lg:flex flex-col items-end mr-2 text-right">
                <span className="text-xs font-light text-white/30 uppercase tracking-widest">Authorized Access</span>
                <span className="text-sm font-normal text-white/70">Applicant Portal</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-normal text-[10px] sm:text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer glass-surface"
                style={{ color: '#e2e8f0' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,35,44,0.1)'; e.currentTarget.style.borderColor = 'rgba(200,35,44,0.3)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '#e2e8f0'; }}
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto p-6 md:p-10 relative z-10">
        {!selectedGroup ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {groups
                .filter(g => {
                  const status = groupStatuses.find(s => s.groupId === g.id);
                  return !status || !status.isHidden;
                })
                .map((group, idx) => {
                  const status = groupStatuses.find(s => s.groupId === group.id) || { isTerminated: false, reason: '', userCount: group.users.length };
                  const displayCount = status.userCount !== undefined ? status.userCount : group.users.length;
                  const isRestricted = userGroupId && group.id !== userGroupId;
                  const isFull = displayCount >= 10;

                  return (
                    <motion.div
                      key={group.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.25, 1, 0.5, 1] }}
                      onClick={() => {
                        if (status.isTerminated) return;
                        if (isRestricted) {
                          alert("You don't have access to see this group's data.");
                          return;
                        }
                        setSelectedGroup(group.id);
                      }}
                      className={`glass-surface p-8 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group ${
                        status.isTerminated ? 'cursor-not-allowed' : isRestricted ? 'cursor-not-allowed' : 'glass-surface-interactive cursor-pointer'
                      }`}
                      style={{
                        minHeight: 280,
                        opacity: isRestricted ? 0.3 : status.isTerminated ? 0.5 : 1,
                      }}
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />

                      <div>
                        <div className="flex justify-between items-start mb-8 relative z-10">
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-medium uppercase tracking-[0.3em] mb-2 ${status.isTerminated ? 'text-red-400/50' : isRestricted ? 'text-slate-500' : 'text-white/30'}`}>
                              {status.isTerminated ? 'Status: Terminated' : isRestricted ? 'Access Restricted' : 'Active Group'}
                            </span>
                            <h3 className={`text-3xl font-normal tracking-tight transition-colors ${
                              status.isTerminated ? 'text-red-300/40' : isRestricted ? 'text-slate-600' : 'text-white group-hover:text-[#5b9be6]'
                            }`}>
                              Group {group.id < 10 ? `0${group.id}` : group.id}
                            </h3>
                          </div>
                          
                          {/* Crazy Highlight Group Status Badge */}
                          <div className={`badge-crazy px-5 py-2 ${status.isTerminated ? 'badge-crazy-inactive' : isFull ? 'badge-crazy-hold' : 'badge-crazy-active'}`}>
                            <span className="text-[9px] font-normal uppercase tracking-[0.25em]">
                              {status.isTerminated ? 'Suspended' : isFull ? 'Full Capacity' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 relative z-10">
                        {status.isTerminated ? (
                          <div className="p-4 rounded-xl" style={{ background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.08)' }}>
                            <p className="text-xs font-normal text-red-300/50 leading-relaxed">
                              <span className="font-medium uppercase tracking-widest text-[9px] block mb-1 opacity-50">Termination Reason:</span>
                              {status.reason || 'No specific reason provided by administration.'}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-white/30 uppercase tracking-widest">Enrolled Applicants</span>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-light ${displayCount >= 10 ? 'text-amber-400/80' : 'text-white'}`}>
                                  {displayCount}
                                </span>
                                <span className="text-white/20 text-sm font-normal">/ 10</span>
                              </div>
                            </div>

                            {/* Liquid Progress Bar */}
                            <div className="bar-track h-2 rounded-full">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(displayCount / 10) * 100}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className={`bar-fill h-full rounded-full ${displayCount >= 10 ? 'bg-[#fbbf24]' : 'bg-[#5b9be6]'}`}
                                style={{ boxShadow: displayCount >= 10 ? '0 0 10px rgba(251,191,36,0.5)' : '0 0 10px rgba(91,155,230,0.5)' }}
                              />
                            </div>

                            <div className="pt-6 flex items-center justify-between border-t border-white/[0.03]">
                              <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest group-hover:text-[#5b9be6] transition-colors">View Detailed Records</span>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1 glass-surface">
                                <ChevronRight size={14} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-surface rounded-[2rem] overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-6 sm:p-10 relative overflow-hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => { setSelectedGroup(null); setSearchTerm(''); }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/30 hover:text-white transition-all cursor-pointer glass-surface hover:bg-white/[0.02]"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-1.5">
                      <h2 className="text-xl sm:text-3xl font-normal text-white tracking-tight">Beneficiary Group {selectedGroup}</h2>
                      <div className="badge-glass active px-3 py-1 rounded-lg flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-normal text-emerald-400 uppercase tracking-widest">Verified Records</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-white/30">
                      <p className="text-[10px] sm:text-xs font-normal uppercase tracking-[0.2em]">
                        {filteredBeneficiaries.length} <span className="hidden sm:inline">Enrolled Members</span><span className="inline sm:hidden">Members</span>
                      </p>
                      <div className="w-1 h-1 bg-white/20 rounded-full" />
                      <div className="flex items-center gap-1.5 text-[10px] font-normal uppercase tracking-widest text-emerald-400/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                        <span className="hidden sm:inline">Live Synchronized</span>
                        <span className="inline sm:hidden">Live</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative w-full lg:w-[400px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <input
                    type="text"
                    placeholder="Filter secure records..."
                    className="w-full rounded-[1.25rem] px-6 py-4 pl-14 outline-none text-white font-normal input-elegant text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Cinematic Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th className="px-6 sm:px-10 py-5 font-normal text-[9px] sm:text-[10px] uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span className="hidden sm:inline">BOA APPLICANT NAMES</span>
                      <span className="inline sm:hidden">NAME</span>
                    </th>
                    <th className="px-6 sm:px-10 py-5 font-normal text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>State</th>
                    <th className="px-6 sm:px-10 py-5 font-normal text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span className="hidden sm:inline">Gender</span>
                      <span className="inline sm:hidden">G</span>
                    </th>
                    <th className="px-6 sm:px-10 py-5 font-normal text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Status</th>
                    <th className="px-6 sm:px-10 py-5 font-normal text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <span className="hidden sm:inline">Remarks</span>
                      <span className="inline sm:hidden">Note</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-white/20">
                          <Database size={40} strokeWidth={1} />
                          <p className="font-normal text-white/30 italic">No matching records available for this group</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <tr key={b._id} className="table-row-cinematic" style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td className="px-6 sm:px-10 py-5 sm:py-6">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-emerald-500/20 bg-emerald-500/5">
                              <CheckCircle2 size={14} className="text-emerald-400/70" />
                            </div>
                            <span className="font-normal text-white/90 text-sm sm:text-[15px] tracking-wide">{b.name}</span>
                          </div>
                        </td>
                        <td className="px-6 sm:px-10 py-5 sm:py-6 text-center">
                          <div className="text-white/40 font-normal text-xs sm:text-sm">{b.address}</div>
                        </td>
                        <td className="px-6 sm:px-10 py-5 sm:py-6 text-center">
                          <span className="px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-normal uppercase tracking-widest text-white/40 glass-surface">
                            {b.gender}
                          </span>
                        </td>

                        {/* ★ Crazy Highlight Table Status Badge ★ */}
                        <td className="px-6 sm:px-10 py-5 sm:py-6 text-center">
                          {(() => {
                            const st = b.status || (b.isActive ? 'Active' : 'Inactive');
                            const badgeClass = st === 'Active' ? 'badge-crazy-active' : st === 'On Hold' ? 'badge-crazy-hold' : 'badge-crazy-inactive';

                            return (
                              <div className={`badge-crazy ${badgeClass} px-4 py-2 w-fit mx-auto`}>
                                <span className="text-[9px] sm:text-[10px] font-normal uppercase tracking-[0.25em]">
                                  {st}
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        <td className="px-6 sm:px-10 py-5 sm:py-6">
                          <div className="flex flex-col items-start gap-1.5">
                            {b.comment ? (
                              <>
                                <p className="text-sm text-white/40 font-normal line-clamp-1 max-w-[200px]">{b.comment}</p>
                                <button
                                  onClick={() => setSelectedNote({ name: b.name, note: b.comment })}
                                  className="text-[10px] sm:text-xs font-normal uppercase tracking-widest transition-colors cursor-pointer text-[#5b9be6] hover:text-[#C8232C]"
                                >
                                  Know More
                                </button>
                              </>
                            ) : (
                              <span className="text-white/20 font-light text-[11px] sm:text-xs italic uppercase tracking-wider">No Remarks</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      {/* Note Modal */}
      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="absolute inset-0"
              style={{ background: 'rgba(5,7,13,0.8)', backdropFilter: 'blur(10px)' }}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-surface w-full max-w-lg p-8 sm:p-10 rounded-[2.5rem] relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center glass-surface text-[#5b9be6]">
                  <MessageSquare size={24} />
                </div>
                <button onClick={() => setSelectedNote(null)} className="p-3 rounded-2xl text-white/30 hover:text-white transition-all cursor-pointer glass-surface hover:bg-white/[0.05]">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-normal uppercase tracking-[0.2em] mb-2" style={{ color: '#C8232C' }}>Record Review</p>
                <h2 className="text-2xl sm:text-3xl font-normal text-white leading-tight">{selectedNote.name}</h2>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl italic text-white/50 leading-relaxed font-normal text-sm sm:text-base"
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)' }}>
                "{selectedNote.note}"
              </div>

              <button
                onClick={() => setSelectedNote(null)}
                className="w-full mt-10 py-4 sm:py-5 rounded-2xl font-normal text-xs sm:text-sm uppercase tracking-widest transition-all cursor-pointer"
                style={{ background: 'rgba(91,155,230,0.1)', border: '1px solid rgba(91,155,230,0.3)', color: '#5b9be6' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#5b9be6'; e.currentTarget.style.color = '#05070d'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(91,155,230,0.1)'; e.currentTarget.style.color = '#5b9be6'; }}
              >
                Done Reading
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 mt-10 relative z-10 border-t border-white/[0.03]">
        <div className="flex flex-col gap-8">
          <p className="text-[11px] sm:text-xs text-white/20 font-normal leading-relaxed text-justify sm:text-left">
            The User accepts full responsibility for providing the correct legal names, contact information, and distribution percentages for all listed beneficiaries. MLX Direct shall not be held liable for erroneous transactions or delays arising from incomplete or inaccurate data. This coordination record remains effective until a written revocation or update is filed through the official MLX Direct Beneficiary Coordination process.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/[0.02]">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5b9be6]/80">
              © 2026 MLX DIRECT. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <div className="h-1 w-1 bg-white/10 rounded-full" />
              <span className="text-[9px] font-normal text-white/20 uppercase tracking-widest">Secure Coordination Portal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default UserDashboard;
