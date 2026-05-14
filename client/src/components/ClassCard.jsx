import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, User, Trash2, Key, BookOpen, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ClassCard = ({ classData, onDelete }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a consistent color based on the class ID
  const soothingColors = [
    'bg-slate-700', 'bg-sky-800', 'bg-indigo-700', 'bg-violet-700', 
    'bg-fuchsia-800', 'bg-rose-700', 'bg-emerald-800', 'bg-teal-800'
  ];
  
  const idHash = classData._id ? classData._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const themeColor = soothingColors[idHash % soothingColors.length];

  const handleCopyCode = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(classData.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col min-h-[19rem]">
      {/* Header */}
      <div className={`${themeColor} p-6 relative flex flex-col justify-between group`}>
         <div className="flex justify-between items-start gap-4">
            <Link to={`/class/${classData._id}`} className="hover:opacity-80 transition-opacity flex-1 min-w-0">
               <h3 className="text-white font-black text-xl truncate leading-tight uppercase tracking-tight" title={classData.title}>
                  {classData.title}
               </h3>
               <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1.5 truncate" title={classData.subject}>
                  {classData.subject}
               </p>
            </Link>
            
            <div className="relative shrink-0">
               <button 
                onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
                className="text-white p-1.5 hover:bg-black/20 rounded-full transition-colors focus:outline-none"
               >
                  <MoreVertical size={20} />
               </button>
               {showMenu && (
                 <>
                   <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                   <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl py-2 z-20 overflow-hidden">
                      {user?.role === 'Teacher' ? (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowMenu(false);
                            if (onDelete) onDelete(classData._id);
                          }}
                          className="w-full text-left px-5 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-between uppercase tracking-widest transition-colors cursor-pointer"
                        >
                           <span>Delete Class</span>
                           <Trash2 size={14} />
                        </button>
                      ) : (
                        <button className="w-full text-left px-5 py-3 text-xs font-black text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 uppercase tracking-widest transition-colors cursor-pointer">
                           Unenroll
                        </button>
                      )}
                   </div>
                 </>
               )}
            </div>
         </div>
         
         <p className="text-white/90 text-[10px] font-black uppercase tracking-widest leading-none mt-6 drop-shadow-sm truncate block">
            {classData.teacherId?.name || 'Teacher'}
         </p>
      </div>

      {/* Body / Content */}
      <div className="flex-1 p-6 pt-10 flex flex-col gap-4 bg-slate-50/50 dark:bg-slate-900/50">
         {user?.role === 'Teacher' && (
           <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-3 shadow-sm group hover:border-indigo-200 transition-colors overflow-hidden">
             <Key size={14} className="text-indigo-500 shrink-0" />
             <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">Code:</span>
             <span className="text-sm font-black text-indigo-700 dark:text-indigo-400 tracking-[0.1em] truncate mr-auto">{classData.classCode}</span>
             <button 
               onClick={handleCopyCode}
               className={`p-1.5 shrink-0 rounded-lg transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'}`}
               title="Copy Code"
             >
               {copied ? <Check size={14} /> : <Copy size={14} />}
             </button>
           </div>
         )}

         <div className="mt-auto pt-2">
           <p className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-1.5 flex items-center gap-2">
              <BookOpen size={10} /> Upcoming Work
           </p>
           <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">No tasks due soon!</p>
         </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-white dark:bg-slate-900 rounded-b-[2rem]">
         <Link 
            to={`/class/${classData._id}`} 
            className="p-2.5 text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors flex items-center gap-2" 
            title="Open Class"
         >
            <span className="text-[10px] font-black uppercase tracking-widest">View Repo</span>
            <User size={14} />
         </Link>
      </div>
    </div>
  );
};

export default ClassCard;
