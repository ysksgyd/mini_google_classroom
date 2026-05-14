import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { Video, Calendar as CalendarIcon, Clock, Link as LinkIcon, Plus, CheckCircle, School, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OnlineClass = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [classes, setClasses] = useState([]);
    const [meetings, setMeetings] = useState([]);
    
    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [classId, setClassId] = useState(searchParams.get('classId') || '');
    const [meetingLink, setMeetingLink] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (user.role === 'Teacher') {
                    const cRes = await api.get('/classes');
                    setClasses(cRes.data);
                }
                const endpoint = user.role === 'Teacher' ? '/meetings/teacher' : '/meetings/student';
                const mRes = await api.get(endpoint);
                setMeetings(mRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        if (!classId) return setErrorMsg('Please select a class.');
        setIsSubmitting(true);
        try {
            await api.post('/meetings/schedule', { title, description, date, classId, meetingLink });
            const newRes = await api.get('/meetings/teacher');
            setMeetings(newRes.data);
            setSuccessMsg('Online class scheduled! Students have been notified.');
            setTitle('');
            setDescription('');
            setDate('');
            setMeetingLink('');
            setClassId('');
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Could not schedule the online class. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const upcomingMeetings = meetings.filter(m => new Date(m.date) >= new Date());
    const pastMeetings = meetings.filter(m => new Date(m.date) < new Date());

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex flex-1 overflow-hidden pt-[72px]">
                <Sidebar isOpen={isSidebarOpen} />
                <main className={`flex-1 overflow-y-auto px-6 py-10 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                    <div className="max-w-7xl mx-auto space-y-10">

                        {/* Page Header */}
                        <header className="flex items-center space-x-4 mb-4">
                            <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200 dark:shadow-none">
                                <Video size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Online Classes</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest text-xs uppercase mt-1">Host and join virtual meetings</p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                            {/* Teacher Schedule Form */}
                            {user.role === 'Teacher' && (
                                <div className="lg:col-span-1">
                                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 sticky top-10">
                                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                            <Plus size={20} className="text-purple-600" />
                                            Schedule Class
                                        </h2>

                                        {successMsg && (
                                            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl font-bold flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">
                                                <CheckCircle size={18} />
                                                <span>{successMsg}</span>
                                            </div>
                                        )}
                                        {errorMsg && (
                                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl font-bold border border-red-100 dark:border-red-800">
                                                <span>{errorMsg}</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-2">Class</label>
                                                <select
                                                    value={classId}
                                                    onChange={e => setClassId(e.target.value)}
                                                    required
                                                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 border-2 border-transparent focus:border-purple-600 appearance-none transition-colors"
                                                >
                                                    <option value="" disabled>Select a class</option>
                                                    {classes.map(c => (
                                                        <option key={c._id} value={c._id}>{c.title}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-2">Topic / Title</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={title}
                                                    onChange={e => setTitle(e.target.value)}
                                                    placeholder="e.g. Chapter 5 Review"
                                                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 border-2 border-transparent focus:border-purple-600 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-2">Date &amp; Time</label>
                                                <input
                                                    type="datetime-local"
                                                    required
                                                    value={date}
                                                    onChange={e => setDate(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 border-2 border-transparent focus:border-purple-600 transition-colors"
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest ml-2">Meeting Link</label>
                                                <input
                                                    type="url"
                                                    required
                                                    value={meetingLink}
                                                    onChange={e => setMeetingLink(e.target.value)}
                                                    placeholder="https://meet.google.com/..."
                                                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-slate-700 dark:text-slate-200 border-2 border-transparent focus:border-purple-600 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full mt-4 bg-purple-600 text-white font-black uppercase tracking-widest text-sm p-5 rounded-2xl hover:bg-purple-700 shadow-xl shadow-purple-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                                            >
                                                {isSubmitting ? (
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                ) : (
                                                    <><Video size={18} /> Send Invitations</>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Meetings List */}
                            <div className={`lg:col-span-${user.role === 'Teacher' ? '2' : '3'} space-y-10`}>

                                {/* Upcoming */}
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-6 px-2 flex items-center gap-2">
                                        <CalendarIcon size={24} className="text-purple-600" />
                                        Upcoming Meetings
                                    </h2>

                                    {loading ? (
                                        <div className="grid gap-4">
                                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[24px] animate-pulse"></div>)}
                                        </div>
                                    ) : upcomingMeetings.length > 0 ? (
                                        <div className="grid gap-6">
                                            {upcomingMeetings.map(m => {
                                                const mDate = new Date(m.date);
                                                return (
                                                    <motion.div
                                                        key={m._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-purple-100 dark:border-purple-900/30 shadow-lg shadow-purple-50 dark:shadow-none hover:border-purple-300 dark:hover:border-purple-700 transition-all"
                                                    >
                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-inner bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                                    <span className="text-xs font-black uppercase tracking-widest">{mDate.toLocaleString('default', { month: 'short' })}</span>
                                                                    <span className="text-xl font-black">{mDate.getDate()}</span>
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{m.title}</h3>
                                                                    <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                                        <span className="flex items-center gap-1"><School size={14} /> {m.classId?.title}</span>
                                                                        <span className="flex items-center gap-1"><Clock size={14} /> {mDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <a
                                                                href={m.meetingLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white shadow-md transition-all"
                                                            >
                                                                <LinkIcon size={16} /> Join Class
                                                            </a>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 border-dashed">
                                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Video size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800 dark:text-white">No upcoming meetings</h3>
                                            <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">There are currently no online classes scheduled.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Past Meetings */}
                                {pastMeetings.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 dark:text-white mb-4 px-2 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle size={20} className="text-emerald-500" />
                                            Past Meetings
                                        </h2>
                                        <div className="grid gap-4">
                                            {pastMeetings.map(m => {
                                                const mDate = new Date(m.date);
                                                return (
                                                    <div key={m._id} className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                                                                <span className="text-[9px] font-black uppercase">{mDate.toLocaleString('default', { month: 'short' })}</span>
                                                                <span className="text-sm font-black">{mDate.getDate()}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-700 dark:text-slate-300">{m.title}</p>
                                                                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">{m.classId?.title} · {mDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">Completed</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OnlineClass;
