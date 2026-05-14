import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  File, 
  Trash2, 
  Download, 
  Eye, 
  ChevronLeft,
  X,
  Upload,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Lessons = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [classData, setClassData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classRes, lessonsRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/lessons/${id}`)
      ]);
      setClassData(classRes.data);
      setLessons(lessonsRes.data);
    } catch (err) {
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('classId', id);
    formData.append('file', file);

    try {
      await api.post('/lessons', formData);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Delete this study material?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      setLessons(lessons.filter(l => l._id !== lessonId));
    } catch (err) {
      console.error(err);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="text-rose-500" />;
      case 'image': return <ImageIcon className="text-blue-500" />;
      case 'video': return <VideoIcon className="text-emerald-500" />;
      case 'word': return <File className="text-indigo-600" />;
      default: return <File className="text-slate-400" />;
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Inter',sans-serif] transition-colors duration-500">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-10 py-12 transition-all duration-500 bg-grid-slate-100 dark:bg-grid-slate-900 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-12">
            
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-10"
            >
               <div className="flex items-center space-x-8">
                  <button onClick={() => navigate(-1)} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] shadow-xl shadow-slate-100 dark:shadow-none text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                     <ChevronLeft size={28} />
                  </button>
                  <div className="space-y-4">
                     <div className="flex items-center space-x-3">
                        <span className="px-4 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-bold border border-blue-100 dark:border-blue-800 uppercase">Study Materials</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{classData?.title?.toUpperCase()}</span>
                     </div>
                     <h1 className="text-6xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Class Lessons.</h1>
                  </div>
               </div>

               {user.role === 'Teacher' && (
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="premium-btn premium-btn-primary h-20 px-10 group shadow-2xl dark:shadow-none"
                  >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    <span className="text-lg">Add Material</span>
                  </button>
               )}
            </motion.header>

            <div className="h-px w-full bg-slate-200 dark:bg-slate-800/60"></div>

            <div className="max-w-6xl">
              {lessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {lessons.map((lesson) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={lesson._id} 
                    className="corporate-card bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row items-stretch gap-8 group border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none"
                  >
                    <a href={`/${lesson.file}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-full sm:w-44 sm:h-44 h-56 bg-slate-50 dark:bg-slate-950 rounded-[2rem] overflow-hidden relative block shadow-inner border border-slate-100 dark:border-slate-800 group-hover:border-blue-200 dark:group-hover:border-indigo-600 transition-colors">
                      {lesson.fileType === 'image' ? (
                        <img src={`/${lesson.file}`} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full space-y-4 bg-slate-50 dark:bg-slate-950">
                           <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl shadow-xl dark:shadow-none flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 border border-slate-100 dark:border-slate-800">
                             {React.cloneElement(getFileIcon(lesson.fileType), { size: 36 })}
                           </div>
                           <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em]">{lesson.fileType} Document</span>
                        </div>
                      )}
                    </a>

                    <div className="flex-1 flex flex-col py-2">
                       <div className="space-y-1 mb-4">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase leading-none group-hover:text-blue-600 dark:group-hover:text-indigo-400 transition-colors">{lesson.title}</h3>
                          <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                             <Clock size={12} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(lesson.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                      
                       <p className="text-slate-500 dark:text-slate-400 font-semibold text-base line-clamp-3 leading-relaxed pl-4 border-l-2 border-slate-50 dark:border-slate-800">{lesson.description || 'No description provided for this material.'}</p>

                       <div className="flex items-center justify-between mt-auto pt-6">
                        <div className="flex items-center space-x-4">
                          <a 
                            href={`/${lesson.file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl flex items-center justify-center hover:bg-blue-600 dark:hover:bg-indigo-600 transition-all shadow-xl dark:shadow-none"
                            title="View Material"
                          >
                            <Eye size={18} />
                          </a>
                          <a 
                            href={`/${lesson.file}`} 
                            download 
                            className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 dark:hover:bg-slate-950 hover:text-white transition-all border border-slate-100 dark:border-slate-700"
                            title="Download Material"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                        
                        {user.role === 'Teacher' && (
                          <button 
                            onClick={() => handleDelete(lesson._id)}
                            className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 text-rose-300 dark:text-rose-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-rose-100 dark:border-rose-900/30"
                            title="Delete Material"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-40 text-center bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center shadow-inner dark:shadow-none">
                  <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] flex items-center justify-center mb-10 text-slate-200 dark:text-slate-800">
                    <BookOpen size={64} />
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase">No Lessons Yet</h2>
                  <p className="text-slate-400 dark:text-slate-500 font-bold text-xl uppercase tracking-tight max-w-sm mt-4">Your teacher hasn't uploaded any study materials yet.</p>
                  {user.role === 'Teacher' && (
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="premium-btn premium-btn-primary mt-12 px-12 py-5 shadow-2xl dark:shadow-none"
                    >
                      <span>UPLOAD FIRST LESSON</span>
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 glass-effect bg-slate-900/40 dark:bg-slate-950/60 z-[100] flex items-center justify-center p-8">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.9, opacity: 0, y: 40 }} 
                className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-none w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
               <div className="premium-gradient p-12 text-white flex justify-between items-start relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-white/[0.1] opacity-20"></div>
                  <div className="relative z-10 space-y-3">
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Teacher Panel</p>
                     <h3 className="text-4xl font-bold tracking-tighter leading-none uppercase">Add New Lesson</h3>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="bg-white/10 p-4 rounded-full hover:bg-white/20 transition-all active:rotate-90 relative z-10">
                    <X size={24} />
                  </button>
               </div>

               <form onSubmit={handleUpload} className="p-16 space-y-10">
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-6">Lesson Title</label>
                        <input type="text" placeholder="e.g. Introduction to React" className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-600 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-[2rem] outline-none font-bold text-xl transition-all shadow-inner dark:shadow-none text-slate-900 dark:text-white uppercase" value={title} onChange={(e) => setTitle(e.target.value)} required />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-6">Lesson Description</label>
                        <textarea placeholder="Tell your students about this lesson..." className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-600 dark:focus:border-indigo-600 focus:bg-white dark:focus:bg-slate-900 rounded-[2rem] outline-none font-bold text-lg transition-all shadow-inner dark:shadow-none min-h-[160px] resize-none text-slate-900 dark:text-white" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-6">File Attachment</label>
                        <label className="w-full min-h-[200px] bg-slate-50 dark:bg-slate-950 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-blue-600 dark:hover:border-indigo-600 transition-all group overflow-hidden shadow-inner dark:shadow-none">
                           <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} required />
                           {file ? (
                             <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-blue-600 dark:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl">
                                   <CheckCircle size={32} />
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-sm uppercase">{file.name}</span>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center space-y-4">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-100 dark:text-slate-700 shadow-inner group-hover:bg-slate-900 dark:group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                   <Upload size={32} />
                                </div>
                                <div className="text-center">
                                   <span className="text-xl font-bold text-slate-900 dark:text-white uppercase block tracking-tighter">Choose a File</span>
                                   <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mt-1">PDF, Word, Images, or Video</span>
                                </div>
                             </div>
                           )}
                        </label>
                     </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-8 bg-blue-600 dark:bg-indigo-600 text-white rounded-[2.5rem] font-bold text-xl hover:bg-slate-900 dark:hover:bg-indigo-700 shadow-2xl dark:shadow-none transition-all duration-700 group flex items-center justify-center space-x-4">
                    {isSubmitting ? (
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Activity size={28} />
                        <span>POST LESSON</span>
                      </>
                    )}
                  </button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Lessons;
