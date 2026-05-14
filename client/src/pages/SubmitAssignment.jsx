import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Send, FileText, CheckCircle, AlertCircle, ChevronLeft, UploadCloud, ArrowRight, ShieldCheck, Clock, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubmitAssignment = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState(null);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
    const [previousSubmission, setPreviousSubmission] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/assignments/detail/${id}`);
                setAssignment(res.data);
                
                if (user.role === 'Student') {
                    const subRes = await api.get(`/assignments/my-submission/${id}`);
                    if (subRes.data) {
                        setIsAlreadySubmitted(true);
                        setPreviousSubmission(subRes.data);
                    }
                }
            } catch (err) {
                console.error('Failed to load assignment details', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user.id, user.role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        setStatus(null);
        setErrorMessage('');

        // Extract classId safely whether it's a string or populated object
        const classId = assignment.classId?._id || assignment.classId;

        const formData = new FormData();
        formData.append('assignmentId', id);
        formData.append('classId', classId);
        formData.append('text', text);
        if (file) formData.append('file', file);
        
        try {
            await api.post('/assignments/submit', formData);
            setStatus('success');
            setTimeout(() => navigate(`/assignment/${id}`), 2500);
        } catch (err) {
            setErrorMessage(err.response?.data?.msg || 'Could not submit your work. Please check your connection.');
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Assignment...</p>
            </div>
        </div>
    );

    if (!assignment) return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Assignment not found</p>
        </div>
    );

    const isOverdue = new Date(assignment.dueDate) < new Date();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-['Inter',sans-serif]">
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex flex-1 overflow-hidden pt-[72px]">
                <Sidebar isOpen={isSidebarOpen} />
                <main className={`flex-1 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">

                        {/* Header */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{assignment.title}</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Assignment Submission</p>
                            </div>
                        </div>

                        {/* Assignment Info Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instructions</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{assignment.description || 'No description provided.'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-6 pt-2 border-t border-slate-50 dark:border-slate-800">
                                <div className="flex items-center space-x-2">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={`flex items-center space-x-2 ${isOverdue ? 'text-rose-500' : 'text-emerald-600'}`}>
                                    <Clock size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        Due: {new Date(assignment.dueDate).toLocaleDateString()} {isOverdue ? '· OVERDUE' : ''}
                                    </span>
                                </div>
                            </div>
                            {assignment.file && (
                                <a
                                    href={`/${assignment.file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl hover:bg-indigo-100 transition-colors"
                                >
                                    <FileText size={18} className="text-indigo-600" />
                                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">Download Study Material</span>
                                </a>
                            )}
                        </div>

                        <AnimatePresence mode="wait">
                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-600 rounded-3xl p-12 text-center space-y-4 shadow-xl shadow-emerald-100"
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Submitted!</h2>
                                <p className="text-emerald-100 text-sm font-medium">Your work has been turned in successfully. Redirecting back...</p>
                            </motion.div>
                        ) : isAlreadySubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Already submitted banner */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-3xl p-6 flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Work Already Submitted</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">
                                            Submitted on {new Date(previousSubmission?.createdAt || previousSubmission?.submittedAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="ml-auto px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">Done</div>
                                </div>

                                {/* Submitted text */}
                                {previousSubmission?.text && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">My Submission Notes</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{previousSubmission.text}"</p>
                                    </div>
                                )}

                                {/* Submitted file */}
                                {previousSubmission?.file && (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600">
                                                <FileText size={22} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{previousSubmission.file.split(/[\\//]/).pop()}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted File</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`/${previousSubmission.file}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                        >
                                            <UploadCloud size={18} />
                                        </a>
                                    </div>
                                )}

                                <button
                                    onClick={() => navigate(-1)}
                                    className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    ← Back to Assignment
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-6"
                            >
                                {/* Text Input */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Response / Notes</label>
                                    <textarea
                                        rows={5}
                                        placeholder="Write your answer or any notes for the teacher..."
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all"
                                    />
                                </div>

                                {/* File Upload */}
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attach File (Optional)</label>
                                    <label className="w-full min-h-[160px] bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                        {file ? (
                                            <div className="flex flex-col items-center space-y-3 p-4">
                                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                                                    <FileText size={22} />
                                                </div>
                                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight text-center">{file.name}</span>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Click to Change File</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center space-y-3 p-8 text-center">
                                                <UploadCloud size={36} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Click to Upload File</span>
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">PDF, DOCX, or Images</span>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center space-x-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl text-rose-600"
                                    >
                                        <AlertCircle size={18} className="flex-shrink-0" />
                                        <p className="text-sm font-bold">{errorMessage}</p>
                                        <button type="button" onClick={() => setErrorMessage('')} className="ml-auto"><X size={16} /></button>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center space-x-3 shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Turn In Assignment</span>
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubmitAssignment;
