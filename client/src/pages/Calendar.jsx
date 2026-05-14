import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Calendar = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments/user/all');
      
      const endpoint = user.role === 'Teacher' ? '/meetings/teacher' : '/meetings/student';
      const mRes = await api.get(endpoint);
      
      const mappedMeetings = mRes.data.map(m => ({
        ...m,
        dueDate: m.date,
        isMeeting: true
      }));

      setAssignments([...res.data, ...mappedMeetings]);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasTasks = (day) => {
    return assignments.some((assign) => {
      const taskDate = new Date(assign.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getTasksForDay = (day) => {
    return assignments.filter((assign) => {
      const taskDate = new Date(assign.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handleDayClick = (day) => {
    const tasks = getTasksForDay(day);
    setSelectedDateTasks(tasks);
  };

  const daysLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-6 py-10 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter flex items-center gap-3">
                  <span className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                    <CalendarIcon size={28} />
                  </span>
                  Academic Calendar
                </h1>
                <p className="text-gray-500 font-medium dark:text-gray-400">Track your assignments and upcoming deadlines</p>
              </div>

              <div className="flex items-center bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <button onClick={prevMonth} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
                <h2 className="px-6 text-lg font-black text-gray-800 dark:text-white min-w-[180px] text-center">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button onClick={nextMonth} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Calendar Grid */}
              <div className="xl:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
                    {daysLabels.map((day) => (
                      <div key={day} className="py-6 text-center text-xs font-black uppercase tracking-widest text-gray-400">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {days.map((day, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={day ? { scale: 0.98 } : {}}
                        onClick={() => day && handleDayClick(day)}
                        className={`min-h-[120px] p-4 border-r border-b border-gray-50 dark:border-gray-700/50 group relative transition-all ${
                          day ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10' : 'bg-gray-50/30'
                        } ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                      >
                        {day && (
                          <>
                            <div className="flex justify-between items-start">
                              <span className={`text-sm font-black transition-colors ${
                                isToday(day) 
                                  ? 'w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-100' 
                                  : 'text-gray-400 group-hover:text-blue-600'
                              }`}>
                                {day}
                              </span>
                              {hasTasks(day) && (
                                <div className="flex -space-x-1">
                                  {getTasksForDay(day).slice(0, 3).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-blue-500 border border-white dark:border-gray-800"></div>
                                  ))}
                                  {getTasksForDay(day).length > 3 && (
                                    <span className="text-[8px] font-black text-blue-600 ml-1">+{getTasksForDay(day).length - 3}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="mt-3 space-y-1.5 overflow-hidden">
                               {getTasksForDay(day).slice(0, 2).map((task, i) => (
                                 <div key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md truncate border-l-2 ${task.isMeeting ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 border-purple-500' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 border-blue-500'}`}>
                                   {task.title}
                                 </div>
                               ))}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task Sidebar */}
              <div className="xl:col-span-1 space-y-8">
                 <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white tracking-tight mb-6 flex items-center gap-2">
                       <Clock className="text-blue-600" size={20} />
                       Upcoming Deadlines
                    </h3>
                    <div className="space-y-4">
                       {loading ? (
                         <div className="animate-pulse space-y-3">
                           {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl"></div>)}
                         </div>
                       ) : assignments.length > 0 ? (
                         assignments
                           .filter(a => new Date(a.dueDate) >= new Date())
                           .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                           .slice(0, 5)
                           .map((task) => {
                             const isMeeting = task.isMeeting;
                             const content = (
                               <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-transparent hover:border-blue-200 transition-all">
                                  <div className="flex items-start justify-between">
                                     <div className="space-y-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isMeeting ? 'text-purple-600' : 'text-blue-600'}`}>
                                          {isMeeting ? 'Online Class' : task.classId?.title || 'Course'}
                                        </span>
                                        <h4 className="font-bold text-gray-800 dark:text-white line-clamp-1">{task.title}</h4>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                           <AlertCircle size={12} />
                                           {isMeeting ? 'Starts' : 'Due'} {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                     </div>
                                     <div className="bg-white dark:bg-gray-600 p-2 rounded-xl text-gray-400 hover:text-blue-600 shadow-sm transition-colors">
                                        <ExternalLink size={16} />
                                     </div>
                                  </div>
                               </div>
                             );
                             return isMeeting ? (
                               <a href={task.meetingLink} target="_blank" rel="noopener noreferrer" key={task._id} className="block group">
                                  {content}
                               </a>
                             ) : (
                               <Link to={`/assignment/${task._id}`} key={task._id} className="block group">
                                  {content}
                               </Link>
                             );
                           })
                       ) : (
                         <div className="text-center py-10">
                            <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                               <BookOpen size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-400 font-medium">No pending tasks found</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Selected Day View */}
                 <AnimatePresence mode="wait">
                    {selectedDateTasks.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        key="selected-tasks"
                        className="bg-blue-600 text-white rounded-3xl p-8 shadow-xl shadow-blue-100"
                      >
                         <h3 className="text-xl font-black tracking-tight mb-6">Tasks for Selected Day</h3>
                          <div className="space-y-4">
                             {selectedDateTasks.map((task) => {
                               const isMeeting = task.isMeeting;
                               const innerContent = (
                                 <>
                                   <div className="flex items-center justify-between">
                                     <h4 className="font-bold">{task.title}</h4>
                                     {isMeeting && <span className="bg-purple-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Meeting</span>}
                                   </div>
                                   <p className="text-xs text-blue-100 opacity-80 mt-1">{task.classId?.title}</p>
                                 </>
                               );
                               return isMeeting ? (
                                 <a href={task.meetingLink} target="_blank" rel="noopener noreferrer" key={task._id} className="block bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/10 transition-all">
                                    {innerContent}
                                 </a>
                               ) : (
                                 <Link to={`/assignment/${task._id}`} key={task._id} className="block bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/10 transition-all">
                                    {innerContent}
                                 </Link>
                               );
                             })}
                          </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
