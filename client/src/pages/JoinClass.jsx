import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { User, X, Info } from 'lucide-react';

const JoinClass = () => {
  const [classCode, setClassCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/classes/join', { classCode });
      navigate(`/class/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not join class. Check your code.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-['Roboto',sans-serif]">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden pt-[72px]">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 overflow-y-auto px-6 py-8 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <div className="max-w-xl mx-auto mt-10">
            <div className="gc-card">
              {/* Profile Bar */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><User size={20} /></div>
                    <div className="space-y-0.5">
                       <p className="text-sm font-medium text-gray-900">You're currently signed in as</p>
                       <p className="text-xs text-gray-500">Student account</p>
                    </div>
                 </div>
                 <button className="text-xs text-blue-600 font-medium px-3 py-1.5 hover:bg-blue-50 rounded border border-gray-200">Switch account</button>
              </div>

              {/* Input Area */}
              <div className="p-6 space-y-6">
                <div>
                   <h2 className="text-xl font-normal text-gray-900 mb-2">Class code</h2>
                   <p className="text-sm text-gray-500 mb-4">Ask your teacher for the class code, then enter it here.</p>
                   
                   <form onSubmit={handleJoin} className="space-y-4">
                      <input 
                        type="text" 
                        placeholder="Class code" 
                        className="w-2/3 py-4 text-sm tracking-widest placeholder:tracking-normal font-medium"
                        value={classCode} 
                        onChange={(e) => setClassCode(e.target.value)} 
                        required 
                        autoFocus
                      />
                      
                      {error && (
                        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100">
                          <X size={16} />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="pt-4 flex justify-end">
                         <button 
                          type="submit" 
                          disabled={isLoading}
                          className="gc-button gc-button-primary"
                         >
                            {isLoading ? 'Joining...' : 'Join'}
                         </button>
                      </div>
                   </form>
                </div>
              </div>
            </div>

            {/* Help text below card like GC */}
            <div className="mt-8 space-y-6 px-4">
                <div className="space-y-2">
                   <h3 className="text-sm font-normal text-gray-700">To sign in with a class code</h3>
                   <ul className="text-xs text-gray-500 list-disc pl-5 space-y-1">
                      <li>Use an authorized account</li>
                      <li>Use a class code with 5-7 letters or numbers, and no spaces or symbols</li>
                   </ul>
                </div>
                <div className="flex items-start space-x-3 text-gray-400">
                   <Info size={16} className="mt-0.5 shrink-0" />
                   <p className="text-[10px] leading-relaxed">If you have trouble joining the class, contact the teacher who created the code.</p>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JoinClass;
