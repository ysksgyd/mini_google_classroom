import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIAssistant from './AIAssistant';
import { 
  Home, 
  Calendar, 
  Settings, 
  CheckSquare, 
  Layout,
  HelpCircle,
  Archive,
  BookOpen,
  LayoutGrid,
  GraduationCap,
  Sparkles,
  School,
  Video,
  Bot
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { user, classes } = useAuth();
  const location = useLocation();
  const [showAI, setShowAI] = useState(false);

  const primaryLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutGrid size={20} /> },
    { name: 'Online Classes', path: '/online-class', icon: <Video size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
  ];

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40 overflow-hidden hidden md:block transition-colors">
      <div className="flex flex-col h-full">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          <div className="py-6">
            {/* Academic Identity Header */}
            <div className="px-6 mb-8">
               <div className="p-5 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-none transition-transform group-hover:scale-105">
                        <GraduationCap size={20} strokeWidth={2.5} />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">Enrollment</h4>
                        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Verified Node</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Course Pathway</p>
                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase truncate">{user?.course || 'No Course'}</p>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 border-l-4 border-l-indigo-600">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Academic Year</p>
                        <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase">{user?.year || 'Unranked'}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Navigation Section */}
            <div className="space-y-1">
              {primaryLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className={`flex items-center space-x-4 px-6 py-3.5 transition-all ${location.pathname === link.path ? 'bg-indigo-600 text-white rounded-r-2xl mr-4 shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                >
                  <span className={location.pathname === link.path ? 'text-white' : 'text-slate-400'}>{link.icon}</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">{link.name}</span>
                </Link>
              ))}
              <button 
                onClick={() => setShowAI(!showAI)}
                className={`w-full flex items-center space-x-4 px-6 py-3.5 transition-all ${showAI ? 'bg-indigo-600 text-white rounded-r-2xl mr-4 shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
              >
                <Bot size={20} className={showAI ? 'text-white' : 'text-indigo-600'} />
                <span className="text-[12px] font-black uppercase tracking-widest">AI ASSISTANT</span>
                <Sparkles size={10} className="ml-auto text-amber-400 animate-pulse" />
              </button>
            </div>

            <div className="h-px bg-gray-200 dark:bg-slate-800 my-6 mx-4"></div>

            {/* Classes Section */}
            <div className="space-y-1 flex-1">
              <p className="px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                 <School size={12} /> My Classrooms
              </p>
              
              <div className="space-y-1">
                {classes && classes.length > 0 ? (
                  classes.map((cls) => (
                    <Link 
                      key={cls._id} 
                      to={`/class/${cls._id}`}
                      className={`flex items-center space-x-4 px-6 py-3.5 transition-all ${location.pathname === `/class/${cls._id}` ? 'bg-slate-900 dark:bg-indigo-900/30 text-white dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${location.pathname === `/class/${cls._id}` ? 'bg-white/10 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-600'}`}>
                        {cls.title.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tight truncate">{cls.title}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-8 py-4">
                     <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest italic leading-relaxed">No classes yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="mt-auto pt-6 space-y-1 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
          <Link 
            to="/settings" 
            className={`flex items-center space-x-4 px-6 py-4 transition-all ${location.pathname === '/settings' ? 'bg-indigo-600 text-white rounded-r-2xl mr-4 shadow-lg shadow-indigo-100' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'}`}
          >
            <Settings size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Settings</span>
          </Link>
          
          <div className="px-6 py-6 text-center">
             <p className="text-[7px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-1 italic">Authorized v1.0.4</p>
             <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles size={8} /> Secure Core active
             </p>
          </div>
        </div>
      </div>

      {/* Embedded AI Assistant Panel */}
      <AIAssistant isOpen={showAI} setIsOpen={setShowAI} isSidebar={true} />
    </aside>
  );
};

export default Sidebar;
