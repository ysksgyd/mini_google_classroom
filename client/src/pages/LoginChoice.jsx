import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, User, ArrowRight } from 'lucide-react';

const LoginChoice = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-['Roboto',sans-serif]">
      <div className="max-w-4xl w-full space-y-12">
        
        {/* Simple Header */}
        <div className="text-center space-y-4">
          <GraduationCap size={64} className="text-blue-600 mx-auto" />
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Classroom</h1>
          <p className="text-gray-500 text-lg">Choose your portal to continue</p>
        </div>

        {/* Choice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Student Portal */}
          <Link 
            to="/login/student"
            className="bg-white border border-gray-200 p-10 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group flex flex-col items-center border-b-4 border-b-blue-600"
          >
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <User size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Portal</h2>
            <p className="text-gray-500 text-center mb-8">Access your classes, submit assignments, and check your marks.</p>
            <div className="flex items-center space-x-2 text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
              <span>Go to Login</span>
              <ArrowRight size={18} />
            </div>
          </Link>

          {/* Teacher Portal */}
          <Link 
            to="/login/teacher"
            className="bg-white border border-gray-200 p-10 rounded-2xl shadow-sm hover:shadow-xl hover:border-gray-900 transition-all group flex flex-col items-center border-b-4 border-b-gray-800"
          >
            <div className="w-20 h-20 bg-gray-50 text-gray-700 rounded-full flex items-center justify-center mb-6 group-hover:bg-gray-800 group-hover:text-white transition-colors">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Teacher Portal</h2>
            <p className="text-gray-500 text-center mb-8">Manage your classes, post assignments, and track student sessions.</p>
            <div className="flex items-center space-x-2 text-gray-800 font-bold group-hover:translate-x-2 transition-transform">
              <span>Staff Login</span>
              <ArrowRight size={18} />
            </div>
          </Link>

        </div>

        {/* Footer */}
        <div className="text-center">
           <Link to="/register" className="text-blue-600 font-medium hover:underline">Don't have an account? Sign up here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginChoice;
