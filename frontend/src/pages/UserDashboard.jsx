import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, LogOut, ChevronRight, MessageSquare, X, LayoutDashboard, Database, CheckSquare, Square, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/app_logo.png';

const API_URL = '/api/beneficiaries';

// Theme Colors from Logo
const COLORS = {
  navy: '#003B8E',
  red: '#C8232C',
  white: '#FFFFFF',
  lightGray: '#F8FAFC',
  border: '#E2E8F0'
};

function UserDashboard() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [globalRegNo, setGlobalRegNo] = useState('');
  const [groupStatuses, setGroupStatuses] = useState([]);

  useEffect(() => {
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#003B8E] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation Bar */}
      <nav className="bg-[#003B8E] border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <img src={logo} alt="BOA PAY" className="h-14 w-auto" />
              <div className="h-10 w-px bg-white/20" />
              <div className="flex flex-col">
                <span className="text-xl font-normal text-white tracking-tight leading-tight uppercase">BOA APPLICANT NAMES</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] font-light text-white uppercase tracking-[0.2em] leading-none">Registration ID:</span>
                  <span className="text-sm font-normal text-white uppercase tracking-widest leading-none">{globalRegNo || 'NOT-SET'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end mr-2 text-right">
              <span className="text-xs font-light text-white/50 uppercase tracking-widest">Authorized Access</span>
              <span className="text-sm font-normal text-white">Applicant Portal</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-[#003B8E] px-6 py-3 rounded-xl font-normal text-xs uppercase tracking-widest hover:bg-[#C8232C] hover:text-white transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto p-6 md:p-10">
        {!selectedGroup ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups
                .filter(g => {
                  const status = groupStatuses.find(s => s.groupId === g.id);
                  return !status || !status.isHidden;
                })
                .map((group) => {
                  const status = groupStatuses.find(s => s.groupId === group.id) || { isTerminated: false, reason: '' };
                return (
                  <motion.div 
                    key={group.id}
                    whileHover={!status.isTerminated ? { y: -6, shadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)" } : {}}
                    onClick={() => !status.isTerminated && setSelectedGroup(group.id)}
                    className={`p-10 rounded-[2.5rem] border-2 transition-all group flex flex-col justify-between min-h-[280px] relative overflow-hidden ${
                      status.isTerminated 
                      ? 'bg-red-50/50 border-[#C8232C] cursor-not-allowed opacity-90' 
                      : 'bg-white border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#003B8E] cursor-pointer'
                    }`}
                  >
                    {/* Decorative background element */}
                    <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full blur-3xl transition-colors ${
                      status.isTerminated ? 'bg-[#C8232C]/[0.05]' : 'bg-[#003B8E]/[0.03] group-hover:bg-[#003B8E]/[0.08]'
                    }`} />

                    <div>
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-medium uppercase tracking-[0.3em] mb-2 ${status.isTerminated ? 'text-[#C8232C]' : 'text-slate-400'}`}>
                            {status.isTerminated ? 'Status: Terminated' : 'Active Group'}
                          </span>
                          <h3 className={`text-3xl font-normal tracking-tight transition-colors ${
                            status.isTerminated ? 'text-[#C8232C]' : 'text-[#003B8E] group-hover:text-black'
                          }`}>
                            Group {group.id < 10 ? `0${group.id}` : group.id}
                          </h3>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-medium uppercase tracking-widest border ${
                          status.isTerminated 
                          ? 'bg-[#C8232C] text-white border-[#C8232C]' 
                          : group.users.length >= 10 
                            ? 'bg-red-600 text-white border-red-600' 
                            : 'bg-emerald-600 text-white border-emerald-600'
                        }`}>
                          {status.isTerminated ? 'Suspended' : group.users.length >= 10 ? 'Full Capacity' : 'Active'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                      {status.isTerminated ? (
                        <div className="p-4 bg-white/60 rounded-2xl border border-[#C8232C]/20">
                          <p className="text-xs font-normal text-[#C8232C] leading-relaxed">
                            <span className="font-medium uppercase tracking-widest text-[9px] block mb-1 opacity-60">Termination Reason:</span>
                            {status.reason || 'No specific reason provided by administration.'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-600 uppercase tracking-widest">Enrolled Applicants</span>
                            <div className="flex items-baseline gap-1">
                              <span className={`text-2xl font-normal ${group.users.length >= 10 ? 'text-[#C8232C]' : 'text-[#003B8E]'}`}>
                                {group.users.length}
                              </span>
                              <span className="text-slate-500 text-sm font-normal">/ 10</span>
                            </div>
                          </div>
                          
                          <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(group.users.length / 10) * 100}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full absolute left-0 top-0 transition-colors ${group.users.length >= 10 ? 'bg-[#C8232C]' : 'bg-[#003B8E]'}`}
                            />
                          </div>

                          <div className="pt-5 flex items-center justify-between border-t border-slate-100">
                            <span className="text-[11px] font-medium text-[#003B8E] uppercase tracking-widest group-hover:text-[#C8232C] transition-colors">View Detailed Records</span>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#003B8E] group-hover:bg-[#C8232C] group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-sm">
                              <ChevronRight size={16} />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden"
          >
            {/* Table Header */}
            <div className="p-10 border-b border-slate-100 bg-white relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setSelectedGroup(null)}
                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#003B8E] hover:bg-blue-50 transition-all border border-slate-200"
                  >
                    <ChevronRight size={24} className="rotate-180" />
                  </button>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-normal text-slate-900 tracking-tight">Beneficiary Group {selectedGroup}</h2>
                      <div className="flex items-center gap-1.5 bg-[#003B8E]/5 text-[#003B8E] px-3 py-1 rounded-full border border-blue-100">
                        <ShieldCheck size={12} />
                        <span className="text-[10px] font-normal uppercase tracking-widest">Verified Records</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <p className="text-xs font-normal uppercase tracking-[0.2em]">{filteredBeneficiaries.length} Enrolled Members</p>
                      <div className="w-1 h-1 bg-slate-200 rounded-full" />
                      <div className="flex items-center gap-1.5 text-[10px] font-normal uppercase tracking-widest text-emerald-600">
                        <Clock size={10} />
                        Live Synchronized
                      </div>
                    </div>
                  </div>
                </div>
              
                <div className="relative w-full lg:w-[400px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Filter secure records..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] px-6 py-4 pl-14 focus:border-[#003B8E] focus:bg-white transition-all outline-none text-slate-900 font-normal shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-blue-50 border-b border-blue-100">
                    <th className="px-8 py-5 text-[#003B8E] font-normal text-[11px] uppercase tracking-[0.2em]">BOA APPLICANT NAMES</th>
                    <th className="px-8 py-5 text-[#003B8E] font-normal text-[11px] uppercase tracking-[0.2em] text-center">State</th>
                    <th className="px-8 py-5 text-[#003B8E] font-normal text-[11px] uppercase tracking-[0.2em] text-center">Gender</th>
                    <th className="px-8 py-5 text-[#003B8E] font-normal text-[11px] uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-8 py-5 text-[#003B8E] font-normal text-[11px] uppercase tracking-[0.2em] text-center">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBeneficiaries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-24 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <Database size={48} strokeWidth={1} />
                          <p className="font-normal text-slate-400 italic">No matching records available for this group</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBeneficiaries.map((b) => (
                      <tr key={b._id} className="hover:bg-[#003B8E]/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                              <CheckCircle2 size={16} />
                            </div>
                            <span className="font-normal text-slate-900 block tracking-tight">{b.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="text-slate-600 font-normal">
                            {b.address}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-normal uppercase bg-slate-100 text-slate-600">
                            {b.gender}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <motion.div 
                            animate={b.isActive ? { 
                              scale: [1, 1.1, 1],
                              opacity: [1, 0.8, 1]
                            } : {}}
                            transition={b.isActive ? { 
                              duration: 1.5, 
                              repeat: Infinity,
                              ease: "easeInOut"
                            } : {}}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit mx-auto ${b.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-[#C8232C] border border-red-100'}`}
                          >
                            {b.isActive ? <CheckSquare size={14} strokeWidth={2.5} /> : <Square size={14} strokeWidth={2.5} />}
                            <span className="text-[10px] font-normal uppercase tracking-widest">{b.isActive ? 'Active' : 'Inactive'}</span>
                          </motion.div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          {b.comment ? (
                            <button 
                              onClick={() => setSelectedNote({ name: b.name, note: b.comment })}
                              className="text-[#003B8E] hover:text-[#C8232C] transition-colors p-2.5 bg-slate-50 hover:bg-red-50 rounded-xl inline-flex"
                              title="View Note"
                            >
                              <MessageSquare size={18} />
                            </button>
                          ) : (
                            <span className="text-slate-300 font-light text-[10px] italic uppercase tracking-wider">No Notes</span>
                          )}
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
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg p-10 rounded-[2.5rem] relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-[#003B8E]/5 text-[#003B8E] rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare size={28} />
                </div>
                <button onClick={() => setSelectedNote(null)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-8">
                <p className="text-[10px] font-normal text-[#C8232C] uppercase tracking-[0.2em] mb-2">Record Review</p>
                <h2 className="text-3xl font-normal text-slate-900 leading-tight">Note for {selectedNote.name}</h2>
              </div>

              <div className="bg-[#F8FAFC] p-8 rounded-3xl border border-slate-100 italic text-slate-700 leading-relaxed font-normal">
                "{selectedNote.note}"
              </div>

              <button 
                onClick={() => setSelectedNote(null)}
                className="w-full mt-10 py-5 bg-[#003B8E] text-white rounded-[1.5rem] font-normal text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-blue-900/10"
              >
                Done Reading
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserDashboard;
