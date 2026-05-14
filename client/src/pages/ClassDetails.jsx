import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { 
  Plus, 
  FileText, 
  Clock, 
  Users, 
  MoreVertical,
  ClipboardList,
  Calendar,
  Send,
  User,
  Info,
  Share2,
  Layout,
  MessageSquare,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Layers,
  X,
  ShieldCheck,
  GraduationCap,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClassDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [classmates, setClassmates] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'Stream';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [allClasses, setAllClasses] = useState([]);

  // New assignment/announcement state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', desc: '', dueDate: '' });
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [isPosting, setIsPosting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [showBroadcasts, setShowBroadcasts] = useState(false);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, aRes, annRes, allRes, mRes] = await Promise.all([
        api.get(`/classes/${id}`),
        api.get(`/assignments/${id}`),
        api.get(`/assignments/announcements/${id}`),
        api.get('/classes'),
        api.get(`/meetings/class/${id}`)
      ]);
      setClassData(cRes.data);
      setAssignments(aRes.data);
      setAnnouncements(annRes.data);
      setAllClasses(allRes.data);
      setMeetings(mRes.data);
      if (cRes.data.students) {
        const filteredStudents = cRes.data.students.filter(s => s._id !== cRes.data.teacherId?._id);
        setClassmates(filteredStudents);
      }

      if (user.role === 'Teacher') {
        const subRes = await api.get(`/assignments/submissions/class/${id}`);
        setSubmissions(subRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.trim()) return;
    setIsPosting(true);
    try {
      await api.post(`/assignments/announcement`, { text: newAnnouncement, classId: id });
      setNewAnnouncement('');
      const res = await api.get(`/assignments/announcements/${id}`);
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handlePostComment = async (announcementId) => {
    const text = commentInputs[announcementId];
    if (!text || !text.trim()) return;
    try {
      await api.post('/assignments/comment', { announcementId, text });
      setCommentInputs(prev => ({ ...prev, [announcementId]: '' }));
      const res = await api.get(`/assignments/announcements/${id}`);
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.desc);
      fd.append('dueDate', formData.dueDate);
      fd.append('classId', id);

      await api.post('/assignments/', fd);
      setShowAssignModal(false);
      setFormData({ title: '', desc: '', dueDate: '' });
      const res = await api.get(`/assignments/${id}`);
      setAssignments(res.data);
    } catch (err) {
      console.error('Assignment creation error:', err.response?.data || err.message);
    }
  };

  const formatLastActive = (date) => {
    if (!date) return 'Never Active';
    const now = new Date();
    const active = new Date(date);
    const diffInMs = now - active;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Active Just Now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sychronizing Classroom...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500 font-['Inter',sans-serif]">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          
          <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex justify-center h-14 items-center">
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
              {['Stream', 'Classwork', 'People'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none scale-105 z-10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
            
            {activeTab === 'Stream' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="bg-indigo-600 dark:bg-indigo-900/40 rounded-[2.5rem] h-64 p-10 flex flex-col justify-end text-white relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none border border-indigo-500/20">
                   <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                   <div className="relative z-10">
                      <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-2">{classData.title}</h1>
                      <p className="text-xs font-black text-indigo-200 uppercase tracking-[0.2em]">{classData.subject}</p>
                   </div>
                   <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"><Info size={20} /></button>
                </div>

                <div className="space-y-8">
                      {user.role === 'Teacher' ? (
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                           <div className="flex items-center space-x-6">
                              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">{user.name.charAt(0)}</div>
                              <div className="flex-1">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Announcement Node</p>
                                 <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">System Broadcast Presence</p>
                              </div>
                           </div>
                           <textarea 
                             className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-3xl p-6 text-xs font-medium text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-indigo-600/20 transition-all min-h-[120px] outline-none"
                             placeholder="Share something with your class..."
                             value={newAnnouncement}
                             onChange={(e) => setNewAnnouncement(e.target.value)}
                           />
                           <div className="flex justify-end pt-2">
                              <button 
                                onClick={handlePostAnnouncement}
                                disabled={isPosting || !newAnnouncement.trim()}
                                className="btn-prof btn-primary px-10 flex items-center space-x-4 text-[10px] uppercase tracking-widest font-black disabled:opacity-50"
                              >
                                {isPosting ? (
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                  <Send size={16} strokeWidth={3} />
                                )}
                                <span>Broadcast</span>
                              </button>
                           </div>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center space-x-6">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">{user.name.charAt(0)}</div>
                           <div className="flex-1 bg-slate-50 dark:bg-slate-950 py-4 px-6 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-default transition-all border border-slate-100 dark:border-slate-800 shadow-inner">
                              Waiting for instructor broadcast...
                           </div>
                        </div>
                      )}

                       <div className="space-y-6">
                          <div className="flex items-center justify-between mb-2">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Broadcast Timeline</h3>
                             <button 
                               onClick={() => setShowBroadcasts(!showBroadcasts)}
                               className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:shadow-md transition-all"
                             >
                                {showBroadcasts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {showBroadcasts ? 'Close Feed' : `View All (${announcements.length})`}
                             </button>
                          </div>

                          <AnimatePresence>
                             {showBroadcasts && (
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden space-y-6"
                                >
                                   {announcements.map((ann) => (
                                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={ann._id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-sm overflow-hidden group">
                                         <div className="p-8 space-y-6">
                                            <div className="flex items-center justify-between">
                                               <div className="flex items-center space-x-4">
                                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black border border-slate-50 dark:border-slate-700">{classData.teacherId?.name?.charAt(0)}</div>
                                                  <div>
                                                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{ann.teacherId?.name || 'Class Teacher'}</p>
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                                  </div>
                                               </div>
                                               <button className="text-slate-300 hover:text-slate-500 transition-colors p-2"><MoreVertical size={18} /></button>
                                            </div>
                                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{ann.text || ann.message}</p>
                                            
                                            {ann.comments && ann.comments.length > 0 && (
                                              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
                                                 {ann.comments.map(c => (
                                                    <div key={c._id} className="flex space-x-3">
                                                       <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">{c.userId?.name?.charAt(0) || 'U'}</div>
                                                       <div className="flex-1 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                          <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{c.userId?.name || 'User'} <span className="text-slate-400 text-[8px] font-medium tracking-widest ml-2 lowercase">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                                                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{c.text}</p>
                                                       </div>
                                                    </div>
                                                 ))}
                                              </div>
                                            )}
                                         </div>
                                         <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-50 dark:border-slate-800 flex items-center space-x-4">
                                            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700">{user.name.charAt(0)}</div>
                                            <input 
                                              type="text" 
                                              placeholder="Add academic comment..." 
                                              value={commentInputs[ann._id] || ''}
                                              onChange={(e) => setCommentInputs(prev => ({...prev, [ann._id]: e.target.value}))}
                                              onKeyDown={(e) => e.key === 'Enter' && handlePostComment(ann._id)}
                                              className="flex-1 bg-transparent border-none outline-none text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-400 placeholder:text-slate-300 placeholder:uppercase" 
                                            />
                                            <button 
                                              onClick={() => handlePostComment(ann._id)}
                                              className="text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
                                            >
                                              <Send size={18} />
                                            </button>
                                         </div>
                                     </motion.div>
                                   ))}
                                </motion.div>
                             )}
                          </AnimatePresence>
                          
                          {announcements.length === 0 && (
                            <div className="py-20 text-center bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem]">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active Broadcasts</p>
                            </div>
                          )}
                       </div>
                       </div>
              </motion.div>
            )}

            {activeTab === 'Classwork' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 py-4">
                <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl">
                         <ClipboardList size={28} />
                      </div>
                      <div>
                         <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Assignment Repository</h2>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Found {assignments.length} Tasks</p>
                      </div>
                   </div>
                    {user.role === 'Teacher' && (
                      <div className="flex gap-4">
                        <Link 
                          to={`/online-class?classId=${id}`}
                          className="btn-prof bg-purple-600 text-white flex items-center space-x-3 px-8 text-[10px] uppercase tracking-widest font-black rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                        >
                          <Video size={18} strokeWidth={3} />
                          <span>Schedule Class</span>
                        </Link>
                        <button 
                          onClick={() => setShowAssignModal(true)}
                          className="btn-prof btn-primary flex items-center space-x-3 px-8 text-[10px] uppercase tracking-widest font-black"
                        >
                          <Plus size={18} strokeWidth={3} />
                          <span>Initialize Task</span>
                        </button>
                      </div>
                    )}
                </header>

                <div className="grid grid-cols-1 gap-4">
                  {assignments.map((a) => (
                    <Link 
                      key={a._id} 
                      to={`/assignment/${a._id}`}
                      className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-indigo-600/30 transition-all p-8 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-none"
                    >
                       <div className="flex items-center space-x-6">
                          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 group-hover:bg-indigo-600 group-hover:text-white rounded-[1.25rem] flex items-center justify-center text-slate-400 transition-all border border-slate-100 dark:border-slate-800">
                             <FileText size={24} />
                          </div>
                          <div>
                             <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors leading-none mb-2">{a.title}</h4>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Released: {new Date(a.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-4">
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic leading-none">Deadline</p>
                             <p className="text-[10px] font-black text-rose-500 uppercase">{new Date(a.dueDate).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="text-slate-200 group-hover:text-indigo-600 transition-colors" size={20} />
                       </div>
                    </Link>
                  ))}
                  {assignments.length === 0 && (
                    <div className="py-32 text-center flex flex-col items-center bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                       <Layers size={48} className="text-slate-100 dark:text-slate-800 mb-6" />
                       <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Zero Task Context</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{user.role === 'Teacher' ? 'Ready to initiate your first assignment node?' : 'No assignments have been pushed to this stream yet.'}</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* PEOPLE TAB - REFACTORED TO BE CLEARER AND SEPARATED */}
            {activeTab === 'People' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16 py-4">
                 <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 flex items-center justify-between shadow-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-6">
                       <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg">
                          <Users size={32} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Class Roster</h2>
                          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Live Membership Directory</p>
                       </div>
                    </div>
                    <div className="px-6 py-4 bg-indigo-50 dark:bg-indigo-950 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                       <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 leading-none">{classmates.length + 1}</p>
                       <p className="text-[7px] font-black uppercase tracking-widest text-indigo-400 mt-1 text-right">Members</p>
                    </div>
                 </div>

                 {/* TEACHERS SECTION */}
                 <section className="space-y-8">
                    <div className="flex items-center space-x-3 border-b-2 border-indigo-600 pb-4">
                       <ShieldCheck size={20} className="text-indigo-600" />
                       <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Teachers</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-3xl p-6 flex items-center justify-between group">
                       <div className="flex items-center space-x-6">
                          <div className="relative">
                             <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl border-2 border-white dark:border-slate-800 shadow-sm">{classData?.teacherId?.name?.charAt(0)}</div>
                             <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"></div>
                          </div>
                          <div>
                             <div className="flex items-center space-x-3">
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none">{classData?.teacherId?.name || 'Class Teacher'}</p>
                                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[7px] font-black uppercase tracking-widest rounded-md">Lead</span>
                             </div>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">{classData?.teacherId?.email}</p>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* STUDENTS SECTION */}
                 <section className="space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                       <div className="flex items-center space-x-3">
                          <GraduationCap size={20} className="text-slate-400" />
                          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Students</h2>
                       </div>
                       <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl uppercase tracking-widest">{classmates.length} Enrolled</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                       {classmates.map((student) => (
                         <div key={student._id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[1.5rem] hover:border-indigo-100 dark:hover:border-slate-700 transition-all group shadow-sm hover:shadow-md">
                            <div className="flex items-center space-x-5">
                               <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-indigo-50 transition-colors uppercase">{student.name.charAt(0)}</div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{student.name}</p>
                                   <div className="flex items-center gap-2 mt-1">
                                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest italic">Last active: <span className="text-indigo-500 not-italic">{formatLastActive(student.lastActive)}</span></p>
                                   </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                               <div className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-500 transition-colors"></div>
                            </div>
                         </div>
                       ))}
                       {classmates.length === 0 && (
                          <div className="py-20 text-center border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[3rem] opacity-50">
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Awaiting Student Enrollment</p>
                          </div>
                       )}
                    </div>
                 </section>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }} className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 dark:border-slate-800">
               <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Initialize Task Context</h3>
                  <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-800 p-2 rounded-xl"><X size={18} /></button>
               </div>
               <form onSubmit={handleCreateAssignment} className="p-10 space-y-6">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Task Title</label>
                        <input type="text" className="w-full" placeholder="IDENTIFIER" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sub title</label>
                        <textarea className="w-full min-h-[120px]" placeholder="SYSTEM PARAMETERS..." value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})}></textarea>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Deadline</label>
                        <input type="date" className="w-full" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
                     </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                     <button type="button" onClick={() => setShowAssignModal(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl">Cancel</button>
                     <button type="submit" className="btn-prof btn-primary px-8 text-[10px] uppercase tracking-widest font-black">Assign Mode</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassDetails;
