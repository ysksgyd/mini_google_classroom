import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { FileText, Clock, User as UserIcon, Send, CheckCircle, Download, X, AlertCircle, Calendar, MessageCircle, MoreVertical, ChevronLeft, ChevronRight, Briefcase, GraduationCap, CloudUpload, ClipboardCheck, ArrowUpRight, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mySubmission, setMySubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeTab, setActiveTab] = useState(user.role === 'Teacher' ? 'Submissions' : 'Instructions');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const aRes = await api.get(`/assignments/detail/${id}`); 
        setAssignment(aRes.data);
        
        if (user.role === 'Student') {
          const sRes = await api.get(`/assignments/my-submission/${id}`);
          setMySubmission(sRes.data);
        } else {
          fetchSubmissions();
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id]);

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/assignments/submissions/${id}`);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin"></div></div>;
  if (!assignment) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">Error: Homework not found</div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Inter',sans-serif] transition-colors duration-500 overflow-hidden">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 pt-[72px] overflow-hidden h-screen">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-6 py-6 transition-all duration-500 bg-grid-slate-100 dark:bg-grid-slate-900 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header - More Compact */}
            <motion.header 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
               <div className="flex items-center space-x-4">
                  <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all">
                     <ChevronLeft size={18} />
                  </button>
                  <div className="space-y-1">
                     <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md text-[7px] font-black uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-900/30">Task</span>
                        <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID: {assignment._id.slice(-6).toUpperCase()}</span>
                     </div>
                     <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none">{assignment.title}</h1>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  {user.role === 'Teacher' && (
                     <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
                        {['Submissions', 'Instructions'].map((tab) => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                           >
                              {tab === 'Submissions' ? 'Students' : 'Overview'}
                           </button>
                        ))}
                     </div>
                  )}

                  {user.role === 'Student' && mySubmission && (
                     <div className="flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-[0.2em]">Returned</span>
                     </div>
                  )}
               </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-9">
                  <AnimatePresence mode="wait">
                     {activeTab === 'Instructions' ? (
                        <motion.div 
                           key="instructions"
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                           className="space-y-6"
                        >
                           <div className="corporate-card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 text-slate-50 dark:text-slate-950 pointer-events-none opacity-20">
                                 <FileText size={120} />
                              </div>
                              <div className="relative z-10 space-y-6">
                                 <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                       <Activity className="text-indigo-600" size={16} />
                                       <h3 className="text-[10px] font-black text-slate-900 dark:text-white tracking-widest uppercase">Overview & Requirements</h3>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-3xl whitespace-pre-wrap pl-4 border-l-2 border-slate-100 dark:border-slate-800">{assignment.description}</p>
                                 </div>

                                 {assignment.file && (
                                   <div className="space-y-3 pt-4">
                                      <h3 className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Resource</h3>
                                      <a href={`/${assignment.file}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-6 p-4 bg-slate-900 dark:bg-slate-950 rounded-2xl hover:bg-indigo-600 transition-all group overflow-hidden border border-slate-800">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white transition-all group-hover:rotate-12">
                                           <FileText size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                           <span className="font-bold text-xs text-white uppercase">Download Study Document</span>
                                           <span className="text-[7px] font-black uppercase text-slate-500 tracking-widest group-hover:text-white transition-colors">Digital Material</span>
                                        </div>
                                        <Download size={14} className="ml-4 text-white opacity-40 group-hover:opacity-100" />
                                      </a>
                                   </div>
                                 )}

                                 {user.role === 'Student' && (
                                   <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                                      {mySubmission ? (
                                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                                            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                                               <div className="flex items-center space-x-4">
                                                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-lg">
                                                     <CheckCircle size={16} />
                                                  </div>
                                                  <div>
                                                     <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none">Task Submitted</h4>
                                                     <p className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-1">{new Date(mySubmission.submittedAt).toLocaleString()}</p>
                                                  </div>
                                               </div>
                                               <div className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[7px] font-black uppercase tracking-widest">SUCCESS</div>
                                            </div>

                                            {mySubmission.feedbacks && mySubmission.feedbacks.length > 0 && (
                                              <div className="space-y-3">
                                                 <div className="flex items-center space-x-2">
                                                    <Sparkles className="text-amber-500" size={14} />
                                                    <h4 className="text-[8px] font-black uppercase text-slate-800 dark:text-slate-200 tracking-[0.2em]">Instructor Feedbacks</h4>
                                                 </div>
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {mySubmission.feedbacks.map((f, index) => (
                                                       <div key={index} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-xl shadow-sm border-l-2 border-l-indigo-600">
                                                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 italic">"{f.text}"</p>
                                                          <span className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 block">{new Date(f.date).toLocaleString()}</span>
                                                       </div>
                                                    ))}
                                                 </div>
                                              </div>
                                            )}
                                        </div>
                                      ) : (
                                        <Link to={`/assignment/${id}/submit`} className="premium-btn premium-btn-primary w-full py-4 rounded-xl shadow-lg shadow-blue-900/20">
                                           <CloudUpload size={18} />
                                           <span className="text-[9px] uppercase font-bold tracking-[0.2em]">INITIALIZE SUBMISSION</span>
                                        </Link>
                                      )}
                                   </div>
                                 )}
                              </div>
                           </div>
                        </motion.div>
                     ) : (
                        <motion.div 
                           key="submissions"
                           initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                           className="space-y-6"
                        >
                           {user.role === 'Teacher' && (
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                 {/* Student List - Side Sticky */}
                                 <div className="lg:col-span-4 space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-600 mb-4 rounded-r-lg">
                                       <h3 className="text-[9px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-[0.2em] leading-none">Submissions</h3>
                                       <p className="text-[6px] font-bold text-indigo-400 uppercase tracking-widest mt-1">{submissions.length} Students Active</p>
                                    </div>
                                    <div className="space-y-1.5">
                                       {submissions.map((sub) => (
                                          <button 
                                             key={sub._id}
                                             onClick={() => setSelectedSubmission(sub)}
                                             className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 border-2 ${selectedSubmission?._id === sub._id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl dark:shadow-none translate-x-1' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-100'}`}
                                          >
                                             <div className="flex items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase tracking-tight ${selectedSubmission?._id === sub._id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                   {sub.studentId?.name}
                                                </span>
                                                <ChevronRight size={14} className={`${selectedSubmission?._id === sub._id ? 'text-indigo-200' : 'text-slate-200'}`} />
                                             </div>
                                          </button>
                                       ))}
                                       {submissions.length === 0 && (
                                          <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-loose">No Submissions<br/>Available</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>

                                 {/* Detailed View Area */}
                                 <div className="lg:col-span-8 min-h-[400px]">
                                    <AnimatePresence mode="wait">
                                       {selectedSubmission ? (
                                          <motion.div 
                                            key={selectedSubmission._id}
                                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                            className="corporate-card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none space-y-6"
                                          >
                                             <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800">
                                                <div className="space-y-1">
                                                   <h4 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight leading-none">{selectedSubmission.studentId?.name}</h4>
                                                   <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em]">Returned On: {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                                                </div>
                                                <button onClick={() => setSelectedSubmission(null)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><X size={16} /></button>
                                             </div>

                                             <div className="space-y-4">
                                                {selectedSubmission.text && (
                                                   <div className="p-6 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">"{selectedSubmission.text}"</p>
                                                   </div>
                                                )}

                                                {selectedSubmission.file && (
                                                   <div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl flex items-center justify-between border border-slate-800 shadow-lg group">
                                                      <div className="flex items-center space-x-4">
                                                         <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                                                            <FileText size={18} />
                                                         </div>
                                                         <div className="space-y-0.5 max-w-[200px]">
                                                            <p className="text-[10px] font-bold text-white uppercase truncate">{selectedSubmission.file.split(/[\\/]/).pop()}</p>
                                                            <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Student Upload</p>
                                                         </div>
                                                      </div>
                                                      <a href={`/${selectedSubmission.file}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white text-white hover:text-slate-900 rounded-lg transition-all"><Download size={14} /></a>
                                                   </div>
                                                )}
                                             </div>
                                          </motion.div>
                                       ) : (
                                          <div className="h-full flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 p-12">
                                             {/* Completely clean area - no layout drawn here */}
                                          </div>
                                       )}
                                    </AnimatePresence>
                                 </div>
                              </div>
                           )}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

               {/* Right Sidebar - Dynamic Info */}
               <div className="lg:col-span-3 space-y-6">
                  <div className="corporate-card p-6 bg-slate-900 dark:bg-black text-white space-y-6 relative overflow-hidden group border border-slate-800 shadow-xl">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      <div className="relative z-10 space-y-4">
                          <h4 className="text-[10px] font-black tracking-[0.2em] uppercase leading-none text-indigo-400">Environment</h4>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">System dashboard for managing current assignment lifecycle.</p>
                          {user.role === 'Student' ? (
                            <Link to={`/assignment/${id}/submit`} className="premium-btn premium-btn-primary w-full py-3 rounded-xl text-[8px] uppercase font-black">
                               <CloudUpload size={14} /> <span>{mySubmission ? 'RE-SUBMIT' : 'TURN IN WORK'}</span>
                            </Link>
                          ) : (
                            <div className="space-y-2">
                               <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-lg text-[8px] font-black uppercase transition-all">EDIT TASK</button>
                               <button className="w-full py-3 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg text-[8px] font-black uppercase transition-all">TERMINATE</button>
                            </div>
                          )}
                      </div>
                  </div>

                  <div className="corporate-card p-6 bg-white dark:bg-slate-900 space-y-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div className="flex items-center space-x-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                        <Calendar size={14} className="text-indigo-600" />
                        <h3 className="text-[10px] font-black text-slate-900 dark:text-white tracking-widest uppercase">Schedule</h3>
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/10 rounded-xl border border-slate-100 dark:border-slate-800">
                           <div className="space-y-0.5">
                              <span className="text-[7px] font-bold uppercase text-slate-400 tracking-widest">Posted</span>
                              <p className="text-[9px] font-black text-slate-800 dark:text-white uppercase">{new Date(assignment.createdAt).toLocaleDateString()}</p>
                           </div>
                           <CheckCircle size={14} className="text-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-900/5 rounded-xl border border-rose-100 dark:border-rose-900/20">
                           <div className="space-y-0.5">
                              <span className="text-[7px] font-bold uppercase text-rose-400 tracking-widest">Deadline</span>
                              <p className="text-[9px] font-black text-rose-700 dark:text-rose-400 uppercase">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                           </div>
                           <Clock size={14} className="text-rose-500" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssignmentDetail;
