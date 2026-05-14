import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ClipboardList, Clock, AlertCircle, FileText, ChevronRight, ChevronLeft, ShieldCheck, Activity, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Pending = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments/pending');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif]">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-10 py-10 transition-all duration-500 bg-grid-slate-100 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-10">
            
            <motion.header 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-6"
            >
               <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-400 hover:text-blue-600 transition-all hover:scale-105 active:scale-95">
                  <ChevronLeft size={20} />
               </button>
               <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                     <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-amber-100">Task Tracking</span>
                     <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">LIVE UPDATES</span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight uppercase leading-none flex items-center gap-4">
                    {user.role === 'Teacher' ? 'Missing Assignments.' : 'To-Do List.'}
                    <Activity size={24} className="text-slate-300" />
                  </h1>
               </div>
            </motion.header>

            <div className="h-px w-full bg-slate-200/60"></div>

            <div className="max-w-5xl">
              {user.role === 'Student' && data?.pending && (
                <>
                  {data.pending.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {data.pending.map((assignment) => {
                        const isOverdue = new Date(assignment.dueDate) < new Date();
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={assignment._id} 
                            className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group relative overflow-hidden"
                          >
                            <div className={`absolute left-0 top-0 w-1.5 h-full ${isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                            <div className="flex items-center space-x-6">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner ${isOverdue ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white' : 'bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'}`}>
                                  <AlertCircle size={20} />
                               </div>
                               <div className="space-y-1">
                                  <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase leading-none group-hover:text-blue-600 transition-colors">{assignment.title}</h3>
                                  <div className="flex items-center space-x-3">
                                     <span className="text-[9px] font-bold uppercase text-blue-600 tracking-widest leading-none">{assignment.classId?.title}</span>
                                     <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                     <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-md ${isOverdue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <Clock size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">{isOverdue ? 'OVERDUE' : 'DUE'} : {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                     </div>
                                  </div>
                               </div>
                            </div>
                            <Link 
                              to={`/assignment/${assignment._id}/submit`}
                              className={`premium-btn h-12 px-8 shadow-lg transition-all ${isOverdue ? 'bg-rose-600 text-white hover:bg-slate-900' : 'bg-blue-600 text-white hover:bg-slate-900'}`}
                            >
                               <span className="text-[9px] font-bold tracking-widest uppercase text-white">SUBMIT NOW</span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-md border border-emerald-100">
                        <CheckCircle size={32} />
                      </div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tighter uppercase leading-none">All Caught Up!</h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-tight max-w-sm mt-3">You don't have any pending assignments at the moment.</p>
                    </div>
                  )}
                </>
              )}

              {user.role === 'Teacher' && data?.teacherPending && (
                <div className="space-y-10">
                  {data.teacherPending.length > 0 ? (
                    <div className="grid grid-cols-1 gap-10">
                      {data.teacherPending.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/40">
                          <header className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-grid-white/[0.1]"></div>
                            <div className="relative z-10 space-y-3">
                               <div className="flex items-center space-x-3">
                                  <span className="text-[9px] font-bold uppercase text-blue-400 tracking-[0.2em]">Missing Submissions</span>
                                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.assignment.classId?.title}</span>
                               </div>
                               <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">{item.assignment.title}</h3>
                            </div>
                            <div className="relative z-10 px-6 py-3 bg-rose-600 text-white rounded-xl shadow-lg flex items-center space-x-3">
                               <span className="text-xl font-black leading-none">{item.missingStudents.length}</span>
                               <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Students<br/>Left</span>
                            </div>
                          </header>
                          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 shadow-inner">
                             {item.missingStudents.map(student => (
                               <div key={student._id} className="p-4 flex items-center space-x-4 bg-white rounded-xl border border-slate-100 group hover:bg-slate-900 hover:text-white transition-all duration-500">
                                 <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center text-sm font-black uppercase shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-all">
                                   {student.name.charAt(0)}
                                 </div>
                                 <div className="space-y-1 min-w-0">
                                   <p className="text-sm font-bold tracking-tight uppercase leading-none truncate">{student.name}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate group-hover:text-slate-500 transition-colors">{student.email}</p>
                                 </div>
                               </div>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-32 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center grayscale opacity-50">
                      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-10 shadow-xl ring-1 ring-emerald-100">
                        <ShieldCheck size={32} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tighter uppercase leading-none">All Caught Up!</h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-tight max-w-sm mt-3">All your students have submitted their work!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Pending;
