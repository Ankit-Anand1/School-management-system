import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ChevronRight, Sun, Moon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
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
      const res = await axios.post('http://localhost:5001/api/auth/admin-login', { email, password });
      // Fetch full user data via /me
      const meRes = await axios.get('http://localhost:5001/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      login(res.data.token, meRes.data.data);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans transition-all duration-700
      ${isDark ? 'bg-gradient-to-br from-[#0F0C29] via-[#201A4A] to-[#150e3a] text-white' : 'bg-gradient-to-br from-[#f0f4ff] via-[#e8f0fe] to-[#faf5ff] text-gray-900'}`}>

      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 pointer-events-none
        ${isDark ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 pointer-events-none
        ${isDark ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>

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
          ${isDark ? 'bg-white' : 'bg-white shadow-purple-200'}`}>
          <ShieldCheck className="text-purple-600 w-8 h-8" />
        </Link>
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>School Management System</h1>
        <p className={`text-xs tracking-widest mt-1 uppercase font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admin Authentication</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className={`w-full max-w-md backdrop-blur-xl rounded-3xl p-8 shadow-2xl z-10 border transition-all duration-500
          ${isDark ? 'bg-[#19153a]/80 border-white/5' : 'bg-white/80 border-gray-200/50 shadow-gray-200/50'}`}
      >
        <div className="mb-8">
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Login</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enter your administrative credentials.</p>
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input type="email" required
                className={`block w-full pl-12 pr-4 py-3 rounded-xl transition-all sm:text-sm focus:outline-none focus:ring-2
                  ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-purple-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'}`}
                placeholder="admin@school.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                  ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-purple-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-purple-500'}`}
                placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Link to="/forgot-password" className={`text-xs font-medium transition-colors ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}>Forgot password?</Link>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
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
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Need an admin account? </span>
          <Link to="/admin-signup" className={`font-medium transition-colors ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'}`}>Register</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
