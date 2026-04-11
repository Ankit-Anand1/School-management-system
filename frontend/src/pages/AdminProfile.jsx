import React, { useState, useEffect } from 'react';
import { UserCircle, AtSign, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL as API } from '../config';



const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.data);
    } catch (error) { console.error(error); }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/users/profile`, profile, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.data);
      // Refresh user data everywhere via AuthContext
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`${API}/auth/change-password`, passwords, { headers: { Authorization: `Bearer ${token}` } });
      setPasswords({ oldPassword: '', newPassword: '' });
      setMessage({ type: 'success', text: 'Password changed!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
        <span>Directory</span><span>›</span><span className="text-primary-600">Admin Profile</span>
      </motion.div>
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleUpdateProfile}
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          <ShieldCheck className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl text-sm font-semibold mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col items-center text-center relative overflow-hidden ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full z-0 ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}></div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-5xl text-white font-bold shadow-xl mt-4 z-10"
          >
            {profile.name?.charAt(0) || 'A'}
          </motion.div>
          <h2 className={`text-xl font-bold mt-4 z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h2>
          <p className={`text-xs font-semibold z-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{profile.email}</p>
          <span className={`mt-3 px-3 py-1 rounded-lg text-xs font-bold z-10 ${isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-600'}`}>Administrator</span>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'}`}><UserCircle className="w-6 h-6" /></div>
              <div><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3><p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update your profile details</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
                <input type="text" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-100 text-gray-800'}`} /></div>
              <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                <input type="text" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-100 text-gray-800'}`} /></div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}><Lock className="w-6 h-6" /></div>
              <div><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</h3><p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update your security credentials</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Old Password</label>
                <input type="password" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-100 text-gray-800'}`} /></div>
              <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>New Password</label>
                <input type="password" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className={`w-full border rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-100 text-gray-800'}`} /></div>
              <div className="md:col-span-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChangePassword}
                  disabled={loading || !passwords.oldPassword || !passwords.newPassword}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                >
                  Update Password
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
