import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import LoginChoice from './pages/LoginChoice';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ClassDetails from './pages/ClassDetails';
import AssignmentDetail from './pages/AssignmentDetail';
import SubmitAssignment from './pages/SubmitAssignment';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';

import JoinClass from './pages/JoinClass';
import TeacherContext from './pages/TeacherContext';
import OnlineClass from './pages/OnlineClass';
import Lessons from './pages/Lessons';
import AllLessons from './pages/AllLessons';
import Pending from './pages/Pending';
import CourseVerifyGate from './components/CourseVerifyGate';
import AIAssistant from './components/AIAssistant';

const ProtectedContainer = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {children}
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-white rounded-full animate-spin"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <CourseVerifyGate><ProtectedContainer>{children}</ProtectedContainer></CourseVerifyGate>;
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginChoice />} />
            <Route path="/login/student" element={<Login />} />
            <Route path="/login/teacher" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/class/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
            <Route path="/assignment/:id" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
            <Route path="/assignment/:id/submit" element={<ProtectedRoute><SubmitAssignment /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/online-class" element={<ProtectedRoute><OnlineClass /></ProtectedRoute>} />
            <Route path="/join-class" element={<ProtectedRoute><JoinClass /></ProtectedRoute>} />
            <Route path="/select-context" element={<ProtectedRoute><TeacherContext /></ProtectedRoute>} />
            <Route path="/class/:id/lessons" element={<ProtectedRoute><Lessons /></ProtectedRoute>} />
            <Route path="/lessons" element={<ProtectedRoute><AllLessons /></ProtectedRoute>} />
            <Route path="/pending" element={<ProtectedRoute><Pending /></ProtectedRoute>} />

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
