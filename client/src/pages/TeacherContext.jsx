import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  ChevronLeft,
  Calendar,
  Layers,
  School
} from 'lucide-react';

const TeacherContext = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedProgram, setSelectedProgram] = useState(user?.course || 'BCA');
  const [customYear, setCustomYear] = useState('');

  const enterClass = async () => {
    if (!selectedProgram || !customYear) {
      alert("Please ensure both Program and Year are defined.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.put('/auth/update-course', { 
        course: selectedProgram, 
        year: customYear 
      });
      
      // Update local context and token
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      // Update user in context to reflect new course/year immediately
      setUser({
        ...user,
        course: selectedProgram,
        year: customYear,
        isCourseVerified: true // Assumption: picking a context verifies it for the session
      });
      
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not set your academic session.');
      setLoading(false);
    }
  };

  const programs = [
    { id: 'BCA', label: 'BCA', sub: 'Computer Applications', icon: <Layers size={24} /> },
    { id: 'BBA', label: 'BBA', sub: 'Business Administration', icon: <School size={24} /> },
    { id: 'BCOM', label: 'BCom', sub: 'Commerce & Finance', icon: <GraduationCap size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-['Inter',sans-serif] relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30 dark:opacity-10">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[180px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[180px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10 space-y-8"
      >
        {/* Header - Simple Wording */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 dark:shadow-none mb-6"
          >
            <ShieldCheck size={40} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Classroom Portal
          </h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3rem]">
            Teacher Session Authentication
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
             <motion.div 
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
             >
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800">
                   <h2 className="text-sm font-black text-slate-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                      <GraduationCap size={18} className="text-indigo-600" /> Choose Program
                   </h2>
                   
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {programs.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProgram(p.id)}
                          className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${selectedProgram === p.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'}`}
                        >
                           <div className={`p-3 rounded-xl transition-all ${selectedProgram === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 group-hover:text-slate-600'}`}>
                              {p.icon}
                           </div>
                           <div className="text-center">
                              <p className={`font-black uppercase text-xs tracking-widest ${selectedProgram === p.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-400'}`}>{p.label}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                   
                   <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3 block">Or Enter Manual Program Name</label>
                      <input 
                        type="text" 
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value.toUpperCase())}
                        className="w-full"
                        placeholder="e.g. BTECH, MCA"
                      />
                   </div>

                   <button 
                      onClick={() => setStep(2)}
                      className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
                   >
                      Next: Select Year <ArrowRight size={16} />
                   </button>
                </div>
             </motion.div>
          ) : (
             <motion.div 
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
             >
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-800 relative">
                   <button 
                    onClick={() => setStep(1)}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                   >
                      <ChevronLeft size={24} />
                   </button>

                   <h2 className="text-sm font-black text-slate-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3">
                      <Calendar size={18} className="text-indigo-600" /> Academic Year
                   </h2>

                   <div className="space-y-8">
                      <div>
                         <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed">
                            Specify the year of the <span className="text-indigo-600 font-bold">{selectedProgram}</span> course you are managing for this session.
                         </p>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                               <button
                                 key={y}
                                 onClick={() => setCustomYear(y)}
                                 className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${customYear === y ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 bg-white dark:bg-slate-900'}`}
                               >
                                  {y}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-3 block">Or Enter Manual Year</label>
                         <input 
                           type="text" 
                           value={customYear}
                           onChange={(e) => setCustomYear(e.target.value)}
                           className="w-full"
                           placeholder="e.g. 5th Year, Final Year"
                         />
                      </div>
                   </div>

                   <button 
                      onClick={enterClass}
                      disabled={loading || !customYear}
                      className="w-full mt-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                      {loading ? (
                        <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Complete Login Access <ArrowRight size={16} /></>
                      )}
                   </button>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
           <Sparkles size={14} className="text-amber-500" />
           Context can be switched anytime in settings
        </p>
      </motion.div>
    </div>
  );
};

export default TeacherContext;
