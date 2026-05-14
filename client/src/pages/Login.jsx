import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  Layout
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Detect role from URL
  const [role] = useState(location.pathname.includes('teacher') ? 'Teacher' : 'Student');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const email = formData.email.toLowerCase().trim();
    const result = await login(email, formData.password, role);
    
    if (result.success) {
      if (role === 'Teacher') {
        navigate('/select-context');
      } else {
        navigate('/');
      }
    } else {
      setError(result.msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-['Roboto',sans-serif]">
      {/* Simple Back button */}
      <Link to="/login" className="mb-12 flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
        <ChevronLeft size={18} />
        <span className="text-sm font-medium">Choose different portal</span>
      </Link>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Layout size={48} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{role === 'Teacher' ? 'Staff Sign in' : 'Student Sign in'}</h1>
          <p className="text-sm text-gray-500">Sign in with your LEARN SPHERE account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="you@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
          >
            {isLoading ? 'Signing in...' : (
              <>
                <span>Sign in</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
