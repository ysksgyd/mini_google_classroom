import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const refreshClasses = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          const userData = res.data;
          // Normalize ID fields for consistent comparison
          const userId = userData._id || userData.id;
          localStorage.setItem('userId', String(userId));
          setUser(userData);
          
          // Initial classes fetch
          const cRes = await api.get('/classes');
          setClasses(cRes.data);
        } catch (err) {
          console.error('Invalid token, logging out...');
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password, role) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      localStorage.setItem('token', res.data.token);
      const userData = res.data.user;
      if (userData) {
        const userId = userData.id || userData._id;
        localStorage.setItem('userId', String(userId));
        if (!userData.id && userData._id) userData.id = String(userData._id);
        if (!userData._id && userData.id) userData._id = String(userData.id);
      }
      setUser(userData);
      await refreshClasses();
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, msg: err.response?.data?.msg || 'Unable to log in. Please check your connection and try again.' };
    }
  };

  const startRegister = async (userData) => {
    try {
      const res = await api.post('/auth/start-register', userData);
      return { success: true, msg: res.data.msg };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Unable to start registration. Please check your connection.' };
    }
  };

  const verifyOTP = async (verifyData) => {
    try {
      const res = await api.post('/auth/verify-otp', verifyData);
      localStorage.setItem('token', res.data.token);
      const userData = res.data.user;
      if (userData) {
        const userId = userData.id || userData._id;
        localStorage.setItem('userId', String(userId));
        if (!userData.id && userData._id) userData.id = String(userData._id);
        if (!userData._id && userData.id) userData._id = String(userData.id);
      }
      setUser(userData);
      await refreshClasses();
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Invalid or expired OTP' };
    }
  };

  const verifyCourseCode = async (code) => {
    try {
      const res = await api.post('/auth/verify-course-code', { code });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      await refreshClasses();
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Invalid code' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setClasses([]);
  };

  const value = {
    user,
    loading,
    classes,
    setUser,
    refreshClasses,
    login,
    startRegister,
    verifyOTP,
    verifyCourseCode,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
