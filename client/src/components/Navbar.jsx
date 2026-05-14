import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  Menu, 
  Settings, 
  Search,
  LayoutGrid,
  Check,
  Activity,
  Trash2,
  X,
  Sun,
  Moon,
  Sparkles,
  Command,
  MessageSquare,
  ChevronDown,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 h-[72px] flex items-center px-4 md:px-8 transition-all duration-500">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        
        {/* Branding & Menu */}
        <div className="flex items-center space-x-6">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all active:scale-90"
            title="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>
          
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 bg-indigo-600 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none group-hover:rotate-[10deg] transition-all duration-300">
              <Command size={24} strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
               <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none block">LEARN SPHERE</span>
               <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Unified Learning Platform</p>
            </div>
          </Link>
        </div>

        {/* Actions & Profiles */}
        <div className="flex items-center space-x-3">
          
          {/* System Control Group */}
          <div className="flex items-center bg-slate-100/50 dark:bg-slate-800/40 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-x-1">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-amber-400 rounded-xl transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-md"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm hover:shadow-md relative ${showNotifications ? 'text-indigo-600 bg-white dark:bg-slate-900' : 'text-slate-500'}`}
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 border-2 border-white dark:border-slate-900 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 ring-1 ring-black/5"
                  >
                    <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm">
                      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Inbox Presence</span>
                      <button onClick={clearNotifications} className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">Wipe All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => {
                              markAsRead(notif._id);
                              if (notif.link) {
                                navigate(notif.link);
                                setShowNotifications(false);
                              }
                            }}
                            className={`px-6 py-5 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all border-b border-slate-50 dark:border-slate-800 cursor-pointer ${!notif.isRead ? 'border-l-4 border-l-indigo-600' : ''}`}
                          >
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-tight">{notif.content}</p>
                            <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 mt-2.5 block uppercase tracking-widest flex items-center gap-2">
                               <Clock size={10} /> {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-16 text-center flex flex-col items-center opacity-60">
                           <Sparkles className="text-indigo-200 dark:text-slate-700 mb-4" size={40} />
                           <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">Absolute Clarity</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3.5 p-1 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all group hover:border-indigo-600/50 hover:shadow-lg shadow-sm"
            >
              <div className="w-10 h-10 rounded-[12px] bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 overflow-hidden flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 shadow-sm group-hover:scale-105 transition-transform">
                {user?.profilePicture ? (
                  <img src={`https://localhost:5000/${user.profilePicture}`} alt="P" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-left hidden lg:block">
                 <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-none flex items-center gap-2">
                    {user?.name}
                    <ChevronDown size={12} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                 </p>
                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-70">
                    {user?.role} ACCOUNT
                 </p>
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 text-center p-10"
                >
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl font-black text-indigo-600 border-4 border-white dark:border-slate-900 overflow-hidden shadow-2xl">
                      {user?.profilePicture ? (
                        <img src={`https://localhost:5000/${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg"></div>
                  </div>
                  
                  <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.name}</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.email}</p>
                  
                  <div className="mt-10 space-y-3">
                    <Link to="/settings" className="w-full flex items-center justify-center space-x-3 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-[18px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none" onClick={() => setShowProfileMenu(false)}>
                      <Settings size={14} />
                      <span>Configure Node</span>
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center justify-center space-x-3 py-4 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/30 text-[10px] font-black uppercase tracking-widest text-rose-600 rounded-[18px] hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <LogOut size={14} />
                      <span>Terminate Session</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </nav>

  );
};

export default Navbar;
