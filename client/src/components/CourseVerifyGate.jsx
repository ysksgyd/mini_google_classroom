import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, AlertCircle, Lock, GraduationCap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Navigate, useLocation } from 'react-router-dom';

const CourseVerifyGate = ({ children }) => {
  const { user, verifyCourseCode, logout } = useAuth();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;

  // 1. Teacher Check: Force session selection if course/year are missing
  if (user.role === 'Teacher') {
    if ((!user.course || !user.year) && location.pathname !== '/select-context') {
      return <Navigate to="/select-context" />;
    }
    return children;
  }

  // 2. Student Verification Check
  if (user.isCourseVerified) {
    return children;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const res = await verifyCourseCode(code.trim());
    if (!res.success) {
      setError(res.msg);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-24 translate-x-24"></div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 ring-8 ring-indigo-600/5">
          <div className="bg-indigo-600 p-10 text-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-grid-white/[0.2] pointer-events-none"></div>
             <div className="relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
                   <Lock size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Account Verification</h2>
                <p className="text-indigo-100 font-black text-[10px] uppercase tracking-widest mt-2 opacity-90 italic">Verify course parameters to proceed</p>
             </div>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-3">
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Welcome, {user.name}</h3>
               <p className="text-slate-400 text-[11px] font-medium leading-relaxed">
                  This is your first login. To access your dashboard for <strong className="text-indigo-600 font-black uppercase">{user.course} - {user.year} Year</strong>, please enter the unique course code provided during registration.
               </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-700 shadow-sm">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2 flex items-center gap-2">
                   <ShieldCheck size={12} className="text-indigo-600" /> Verification Code
                </label>
                <div className="relative">
                   <input 
                     type="text" 
                     placeholder="e.g. BCA-1st-ABCD" 
                     value={code} 
                     onChange={(e) => setCode(e.target.value)} 
                     className="w-full text-center text-xl tracking-[0.2em]" 
                     required 
                   />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 group">
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Initialize Access</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
               <button onClick={logout} className="text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-rose-500 transition-colors">Terminate Session</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseVerifyGate;
