import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { BookOpen, FileText, Image as ImageIcon, Video as VideoIcon, File, Eye, Download, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AllLessons = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/lessons/user/all');
      setLessons(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText />;
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'word': return <File />;
      default: return <File />;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><div className="w-16 h-16 border-4 border-blue-600 border-t-white rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-6 py-10 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tight flex items-center gap-3">
                  All Lessons
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] text-xs">Repository of Educational Material across classes</p>
              </div>
            </header>

            <div className="max-w-5xl mx-auto">
              {lessons.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {lessons.map((lesson) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={lesson._id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row items-stretch p-3 gap-5"
                  >
                    <a href={`/${lesson.file}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-full sm:w-32 sm:h-32 h-40 bg-gray-50 dark:bg-gray-900/50 rounded-[14px] overflow-hidden relative block shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
                      {lesson.fileType === 'image' ? (
                        <img src={`/${lesson.file}`} alt={lesson.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full space-y-2 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                           <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 transition-all duration-300 group-hover:scale-110">
                             {React.cloneElement(getFileIcon(lesson.fileType), { size: 28, strokeWidth: 1.5, className: lesson.fileType === 'pdf' ? 'text-red-500' : lesson.fileType === 'word' ? 'text-blue-700' : lesson.fileType === 'video' ? 'text-purple-500' : 'text-gray-500' })}
                           </div>
                           <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-widest">{lesson.fileType}</span>
                        </div>
                      )}
                    </a>

                    <div className="flex-1 min-w-0 flex flex-col py-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight truncate pr-2">{lesson.title}</h3>
                        <div className="flex items-center gap-1.5 text-gray-400 shrink-0 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-md">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold">{new Date(lesson.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-blue-500 mb-1">{lesson.classId?.title}</p>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 font-medium mb-4">{lesson.description || 'No description provided.'}</p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-700/50">
                        <div className="flex items-center space-x-2">
                          <a 
                            href={`/${lesson.file}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Preview Content"
                          >
                            <Eye size={16} />
                          </a>
                          <a 
                            href={`/${lesson.file}`} 
                            download 
                            className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-800 hover:text-white transition-all shadow-sm"
                            title="Download Material"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-white dark:bg-gray-800 rounded-[40px] border-4 border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="text-gray-300" size={48} />
                </div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">No Lessons Yet</h2>
                <p className="text-gray-400 dark:text-gray-500 font-medium max-w-sm mt-2">You don't have any lessons uploaded across your classes yet.</p>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AllLessons;
