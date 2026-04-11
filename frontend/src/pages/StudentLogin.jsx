import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Lock, Mail, ChevronRight, Sun, Moon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/student-login', { email, password });
      // Fetch full user data via /me
      const meRes = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      login(res.data.token, meRes.data.data);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      if (!decoded.email.endsWith('@heritageit.edu.in')) {
        setError('Access restricted to @heritageit.edu.in accounts only.');
        return;
      }

      const res = await axios.post('http://localhost:5001/api/auth/google-login', {
        name: decoded.name,
        email: decoded.email,
        googleId: decoded.sub
      });
      const meRes = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      login(res.data.token, meRes.data.data);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-all duration-700
      ${isDark ? 'bg-gradient-to-br from-[#0F0C29] via-[#201A4A] to-[#150e3a] text-white' : 'bg-gradient-to-br from-[#f0f4ff] via-[#e8f0fe] to-[#fff5f7] text-gray-900'}`}>

      {/* Ambient orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none
        ${isDark ? 'bg-primary-600' : 'bg-blue-300'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none
        ${isDark ? 'bg-purple-600' : 'bg-pink-300'}`}></div>

      {/* Theme toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className={`absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
        ${isDark ? 'bg-white/10 text-amber-400 hover:bg-white/20' : 'bg-gray-900/10 text-indigo-600 hover:bg-gray-900/20'}`}>
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8 z-10"
      >
        <Link to="/" className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform
          ${isDark ? 'bg-white' : 'bg-white shadow-indigo-200'}`}>
          <GraduationCap className="text-primary-600 w-8 h-8" />
        </Link>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>School Management System</h1>
        <p className={`text-xs tracking-widest mt-1 uppercase font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student Authentication</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`w-full max-w-md backdrop-blur-xl rounded-3xl p-8 shadow-2xl z-10 border transition-all duration-500
          ${isDark ? 'bg-[#19153a]/80 border-white/5' : 'bg-white/80 border-gray-200/50 shadow-gray-200/50'}`}
      >
        <div className="mb-8">
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to your student account.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-4 p-3 rounded-xl text-sm text-center font-medium flex items-center justify-center gap-2
              ${isDark ? 'bg-red-500/20 border border-red-500/50 text-red-200' : 'bg-red-50 border border-red-200 text-red-600'}`}
            >
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Authentication Failed')}
            theme={isDark ? "filled_black" : "outline"}
            shape="pill"
            width="100%"
          />
        </div>

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 text-xs ${isDark ? 'bg-[#19153a] text-gray-500' : 'bg-white text-gray-400'}`}>Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input type="email" required
                className={`block w-full pl-12 pr-4 py-3 rounded-xl transition-all sm:text-sm focus:outline-none focus:ring-2
                  ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-primary-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary-500'}`}
                placeholder="student@heritageit.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input type="password" required
                className={`block w-full pl-12 pr-4 py-3 rounded-xl transition-all sm:text-sm focus:outline-none focus:ring-2
                  ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-primary-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary-500'}`}
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className={`text-xs font-medium transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'}`}>Forgot password?</Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Signing in...
              </div>
            ) : <>Sign In <ChevronRight className="ml-2 h-4 w-4" /></>}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Don't have an account? </span>
          <Link to="/student-signup" className={`font-medium transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'}`}>Sign up</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
