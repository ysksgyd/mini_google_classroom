import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  Layout,
  BookOpen,
  Calendar
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'Student', course: '', year: ''
    });
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/start-register', { email: formData.email.toLowerCase().trim() });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Could not send verification code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const data = { ...formData, email: formData.email.toLowerCase().trim(), otp };
            await api.post('/auth/verify-otp', data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-['Roboto',sans-serif]">
            <div className="w-full max-w-lg space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <Layout size={48} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">Create Account</h1>
                    <p className="text-sm text-gray-500">Join LEARN SPHERE today</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md text-sm text-center">
                        {error}
                    </div>
                )}

                {/* Step 1: Role & Initial Info */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setFormData({...formData, role: 'Student'})}
                                className={`p-4 border-2 rounded-lg text-center transition-all ${formData.role === 'Student' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <User size={24} className="mx-auto mb-2" />
                                <span className="text-xs font-bold uppercase">Student</span>
                            </button>
                            <button 
                                onClick={() => setFormData({...formData, role: 'Teacher'})}
                                className={`p-4 border-2 rounded-lg text-center transition-all ${formData.role === 'Teacher' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                            >
                                <BookOpen size={24} className="mx-auto mb-2" />
                                <span className="text-xs font-bold uppercase">Teacher</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Full Name</label>
                                <input 
                                    className="w-full" type="text" placeholder="John Doe"
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Gmail Address</label>
                                <input 
                                    className="w-full" type="email" placeholder="you@gmail.com"
                                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Password</label>
                                <input 
                                    className="w-full" type="password" placeholder="••••••••"
                                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            onClick={() => setStep(2)}
                            disabled={!formData.name || !formData.email || !formData.password}
                            className="w-full bg-blue-600 text-white font-medium py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            <span>Next Step</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {/* Step 2: Course Info */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <p className="text-sm text-gray-600 text-center">Please provide your academic details</p>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-600 ml-1">Course Name</label>
                                <input 
                                    className="w-full" type="text" placeholder="e.g. BCA, B.Sc Computer Science"
                                    value={formData.course} onChange={(e) => setFormData({...formData, course: e.target.value})}
                                />
                            </div>
                            {formData.role === 'Student' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-600 ml-1">Year</label>
                                    <select 
                                        className="w-full"
                                        value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <button onClick={() => setStep(1)} className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-md hover:bg-gray-50 font-medium">Back</button>
                            <button 
                                onClick={handleSendOTP}
                                disabled={!formData.course || (formData.role === 'Student' && !formData.year) || isLoading}
                                className="flex-[2] bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {isLoading ? 'Sending code...' : 'Send Verification Code'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: OTP Verification */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">Verification code sent to <strong>{formData.email}</strong></p>
                        </div>
                        <input 
                            className="w-full text-center text-2xl tracking-[1em] font-bold" 
                            type="text" maxLength="6" placeholder="000000"
                            value={otp} onChange={(e) => setOtp(e.target.value)}
                        />
                        <button 
                            onClick={handleRegister}
                            disabled={otp.length !== 6 || isLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Complete Registration'}
                        </button>
                        <button onClick={() => setStep(2)} className="w-full text-sm text-blue-600 hover:underline">Change email</button>
                    </div>
                )}

                <div className="text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
