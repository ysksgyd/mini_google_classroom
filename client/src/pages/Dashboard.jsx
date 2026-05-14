import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ClassCard from '../components/ClassCard';
import { Plus, X, LayoutGrid, BookOpen, Layers, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, refreshClasses: globalRefresh } = useAuth();
  const [classes, setClasses] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Create Class Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClass, setNewClass] = useState({ title: '', subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [user?.course, user?.year]); // Refetch if session changes

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/classes', newClass);
      setShowCreateModal(false);
      setNewClass({ title: '', subject: '', description: '' });
      await fetchClasses();
      if (globalRefresh) await globalRefresh(); // Sync Sidebar
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.msg || 'Verification Error: Ensure your academic session (Program/Year) is selected in Settings before creating a class.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Delete this class? All enrolled students, assignments, and submissions will be permanently removed.")) {
      try {
        await api.delete(`/classes/${id}`);
        await fetchClasses();
        if (globalRefresh) await globalRefresh();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.msg || 'Could not delete the class.');
      }
    }
  };

  if (!user) return <Navigate to="/login" />;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Securing Connection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500 font-['Inter',sans-serif]">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-6 py-10 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Professional Welcome Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200 dark:border-slate-800">
               <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Classes</h1>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Status: {classes.length} Active Contexts</p>
               </div>
               <div className="flex items-center space-x-3">
                  {user.role === 'Student' && (
                    <Link to="/join-class" className="btn-prof btn-primary flex items-center space-x-3 text-[11px] uppercase tracking-widest px-6 shadow-lg shadow-indigo-200 dark:shadow-none border-2 border-white dark:border-slate-800">
                       <Plus size={18} strokeWidth={3} />
                       <span className="font-black">Join a Class</span>
                    </Link>
                  )}
                  {user.role === 'Teacher' && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="btn-prof btn-primary flex items-center space-x-2 text-[10px] uppercase tracking-widest"
                    >
                      <Plus size={16} strokeWidth={3} />
                      <span>Create Class</span>
                    </button>
                  )}
               </div>
            </header>

            {/* Class Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {classes.length > 0 ? (
                classes.map((cls, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={cls._id}
                  >
                    <ClassCard classData={cls} onDelete={handleDeleteClass} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-32 text-center flex flex-col items-center bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-[2rem] flex items-center justify-center mb-6 text-slate-200 dark:text-slate-800 border border-slate-100 dark:border-slate-800">
                    <Layers size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Classes Found</h3>
                  <p className="text-xs font-medium text-slate-400 mt-2 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                    {user.role === 'Teacher' ? `You have no classes for the ${user.course} - ${user.year} session.` : 'Ask your teacher for a class code to join.'}
                  </p>
                  <div className="mt-10 flex gap-4">
                    {user.role === 'Teacher' ? (
                       <>
                          <button onClick={() => setShowCreateModal(true)} className="btn-prof btn-primary text-[10px] uppercase tracking-widest px-8">Create New Class</button>
                          <Link to="/select-context" className="btn-prof bg-slate-900 text-white dark:bg-slate-800 text-[10px] uppercase tracking-widest px-8 flex items-center justify-center">Switch Session</Link>
                       </>
                    ) : (
                       <Link to="/join-class" className="btn-prof btn-primary text-[10px] uppercase tracking-widest px-8">Join Your First Class</Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Class Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-800"
            >
               <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                  <div className="flex items-center space-x-3">
                     <LayoutGrid size={20} className="text-indigo-600" />
                     <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">New Class</h3>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm"><X size={18} /></button>
               </div>
               <form onSubmit={handleCreateClass} className="p-10 space-y-6">
                  {errorMsg && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 text-rose-600 animate-in fade-in slide-in-from-top-2">
                       <AlertCircle size={20} className="shrink-0" />
                       <p className="text-[10px] font-black uppercase leading-relaxed tracking-wider">{errorMsg}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                     <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Creating class for session</p>
                        <p className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase">{user.course} — {user.year}</p>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Class Name</label>
                        <input type="text" className="w-full" placeholder="e.g. Science 101" value={newClass.title} onChange={(e) => setNewClass({...newClass, title: e.target.value})} required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Subject</label>
                        <input type="text" className="w-full" placeholder="e.g. Biology" value={newClass.subject} onChange={(e) => setNewClass({...newClass, subject: e.target.value})} required />
                     </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                     <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
                     <button type="submit" disabled={isSubmitting} className="btn-prof btn-primary text-[10px] uppercase tracking-widest px-8 min-w-[140px]">
                      {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Create Class'}
                     </button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
