import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword = () => {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
      setMessage({ type: 'success', text: res.data.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error processing request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative transition-all duration-700
      ${isDark ? 'bg-gradient-to-br from-[#0F0C29] via-[#201A4A] to-[#150e3a]' : 'bg-gradient-to-br from-[#f0f4ff] via-[#e8f0fe] to-[#fff5f7]'}`}>

      <button onClick={toggleTheme} className={`absolute top-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
        ${isDark ? 'bg-white/10 text-amber-400 hover:bg-white/20' : 'bg-gray-900/10 text-indigo-600 hover:bg-gray-900/20'}`}>
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className={`w-full max-w-md backdrop-blur-xl rounded-3xl p-8 shadow-2xl z-10 border transition-all duration-500
        ${isDark ? 'bg-[#19153a]/80 border-white/5 text-white' : 'bg-white/80 border-gray-200/50 text-gray-900'}`}>
        <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Reset Password</h2>
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enter your email and we'll send you a link to reset your password.</p>

        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium
            ${message.type === 'success'
              ? isDark ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isDark ? 'bg-red-500/20 text-red-200 border border-red-500/50' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input type="email" required
                className={`block w-full pl-12 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all
                  ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-primary-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-primary-500'}`}
                placeholder="name@school.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 transition-all disabled:opacity-70 shadow-lg shadow-purple-500/25">
            {loading ? 'Processing...' : <>Send Reset Link <ChevronRight className="ml-2 h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/" className={`font-medium transition-colors ${isDark ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-500'}`}>Return to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
