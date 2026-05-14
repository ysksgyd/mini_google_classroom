import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Trash2, 
  AlertTriangle, 
  X, 
  Camera, 
  User as UserIcon, 
  Check,
  ShieldAlert,
  Palette,
  Monitor
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.delete('/auth/delete-account');
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not delete your account.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    setIsUploading(true);
    try {
      const res = await api.post('/auth/update-profile-pic', formData);
      setUser(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload profile picture.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-['Inter',sans-serif]">
      {/* Professional Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Account Settings</h1>
          </div>
          <div className="flex items-center space-x-2">
             <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
               {user?.role} Portal
             </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6 py-12 space-y-10">
        
        {/* Profile Card */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
          <div className="p-10">
            <h2 className="text-sm font-black text-slate-900 dark:text-white mb-10 uppercase tracking-[0.2em] flex items-center gap-3">
               <UserIcon size={18} className="text-indigo-600" /> Profile Details
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-12">
               {/* Pic Upload Section */}
               <div className="relative group">
                  <div className="w-40 h-40 rounded-[3rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl relative">
                     {user?.profilePicture ? (
                       <img src={`https://localhost:5000/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                          <UserIcon size={64} />
                       </div>
                     )}
                     {isUploading && (
                       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                       </div>
                     )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="absolute -bottom-2 -right-2 p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
                  >
                     <Camera size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
               </div>

               <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Display Name</label>
                     <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-inner truncate">
                        {user?.name}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                        {user?.role === 'Teacher' ? 'Teacher ID' : 'Student ID'}
                     </label>
                     <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-inner truncate">
                        {user?._id || user?.id}
                     </div>
                  </div>
                  <div className="space-y-3 sm:col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email Address</label>
                     <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-inner truncate">
                        {user?.email}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Academic Course</label>
                     <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-inner">
                        {user?.course}
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Academic Year</label>
                     <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 shadow-inner">
                        {user?.year}
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-start gap-4">
                  <ShieldAlert className="text-indigo-600 mt-1 shrink-0" size={20} />
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 leading-relaxed uppercase tracking-tight">
                     {user?.role === 'Teacher' ? 'Teachers can switch their academic session at any time to manage different courses or years.' : 'Students: Academic credentials are locked. Contact your teacher to update profile details.'}
                  </p>
               </div>
               {user?.role === 'Teacher' && (
                 <Link to="/select-context" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0">
                    Switch Session
                 </Link>
               )}
            </div>
          </div>
        </section>

        {/* Theme & Display section */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-10">
            <h2 className="text-sm font-black text-slate-900 dark:text-white mb-10 uppercase tracking-[0.2em] flex items-center gap-3">
               <Palette size={18} className="text-indigo-600" /> Appearance
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 gap-6">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl transition-all ${theme === 'dark' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-amber-500 text-white shadow-xl shadow-amber-500/20'}`}>
                   {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                   <p className="font-bold text-slate-900 dark:text-white mb-1">Theme</p>
                   <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'} Active</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <button 
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-200'}`}
                 >
                    Light
                 </button>
                 <button 
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                    Dark
                 </button>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-rose-100 dark:border-rose-900/30 overflow-hidden">
          <div className="p-10">
            <h2 className="text-sm font-black text-rose-600 dark:text-rose-400 mb-10 uppercase tracking-[0.2em] flex items-center gap-3">
               <Trash2 size={18} /> Danger Zone
            </h2>
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 p-8 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-50 dark:border-rose-900/20 shadow-inner">
               <div className="space-y-2">
                  <p className="font-bold text-slate-800 dark:text-slate-100">Delete Account</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-relaxed">
                     Permanently remove your account and all your data. This cannot be undone.
                  </p>
               </div>
               
               <button
                 onClick={() => setShowDeleteConfirm(true)}
                 className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-200 dark:shadow-none shrink-0"
               >
                 Delete Account
               </button>
            </div>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_30px_90px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden border border-rose-100 dark:border-rose-900/40"
            >
               <div className="p-10 text-center">
                  <div className="mx-auto w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-3xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-8 border border-rose-100 dark:border-rose-800">
                     <AlertTriangle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Delete Account?</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-10 px-4">
                     Are you sure? This will delete everything and you won't be able to get it back.
                  </p>
                  
                  <div className="space-y-3">
                     <button
                       onClick={handleDeleteAccount}
                       disabled={isDeleting}
                       className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl shadow-rose-200 dark:shadow-none"
                     >
                       {isDeleting ? (
                         <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                       ) : (
                         <>
                           <Check size={18} />
                           Delete Forever
                         </>
                       )}
                     </button>
                     <button
                       onClick={() => setShowDeleteConfirm(false)}
                       disabled={isDeleting}
                       className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                     >
                       Keep Account
                     </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
