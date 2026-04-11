import React, { useState, useEffect } from 'react';
import { Camera, UserCircle, AtSign, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL as API } from '../config';



const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', address: '', course: '', batch: '', guardianName: '', guardianPhone: ''
  });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({ attendance: '--', gpa: '--' });

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/users/profile`, { headers });
      setProfile(res.data.data);

      const attRes = await axios.get(`${API}/attendance`, { headers });
      const attList = attRes.data.data || [];
      if (attList.length > 0) {
         const pres = attList.filter(a => a.status === 'Present').length;
         const pct = Math.round((pres / attList.length) * 100);
         setStats({ attendance: `${pct}%`, gpa: pct > 90 ? '4.0' : pct > 80 ? '3.5' : pct > 60 ? '3.0' : '2.5' });
      } else {
         setStats({ attendance: 'N/A', gpa: 'N/A' });
      }
    } catch (error) { /* silent */ }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/users/profile`, profile, { headers: { Authorization: `Bearer ${token}` } });
      setProfile(res.data.data);
      // Refresh user data everywhere via AuthContext
      await refreshUser();
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally { setLoading(false); }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const token = localStorage.getItem('token');
      await axios.put(`${API}/auth/change-password`, passwords, { headers: { Authorization: `Bearer ${token}` } });
      setPasswords({ oldPassword: '', newPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
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
        <span>Directory</span><span>›</span><span className="text-primary-600">Student Profile</span>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h1>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleUpdateProfile}
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-70"
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
        {/* Left Column */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border flex flex-col items-center text-center relative ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
             <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full z-0 ${isDark ? 'bg-primary-900/20' : 'bg-primary-50'}`}></div>
             <div className="relative mb-4 z-10 mt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`w-28 h-28 rounded-full border-4 shadow-xl overflow-hidden bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-4xl text-white font-bold uppercase ${isDark ? 'border-[#141928]' : 'border-white'}`}
                >
                   {profile.name?.charAt(0) || 'U'}
                </motion.div>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = () => alert('Photo upload requires Cloudinary/S3 integration. Feature UI is ready!');
                    input.click();
                  }}
                  className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-primary-600 shadow-sm transition-colors ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border text-primary-600 border-gray-100 hover:bg-primary-50'}`}
                >
                   <Camera className="w-4 h-4" />
                </button>
             </div>
             <h2 className={`text-xl font-bold z-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>{profile.name}</h2>
             <p className={`text-xs font-semibold mb-4 z-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ID: {profile._id}</p>
             <div className="flex w-full gap-4 z-10">
                <div className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                   <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>GPA</p>
                   <p className="text-2xl font-bold text-primary-600">{stats.gpa}</p>
                </div>
                <div className={`flex-1 rounded-2xl p-4 border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                   <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Attendance</p>
                   <p className="text-2xl font-bold text-blue-600">{stats.attendance}</p>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Right Column (Forms) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants} className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
             <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'}`}><UserCircle className="w-6 h-6" /></div>
                <div><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3><p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update identity and demographic details</p></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
                  <input type="text" value={profile.name || ''} onChange={(e) => setProfile({...profile, name: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Course / Grade</label>
                  <input type="text" value={profile.course || ''} onChange={(e) => setProfile({...profile, course: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Guardian Name</label>
                  <input type="text" value={profile.guardianName || ''} onChange={(e) => setProfile({...profile, guardianName: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Guardian Phone</label>
                  <input type="text" value={profile.guardianPhone || ''} onChange={(e) => setProfile({...profile, guardianPhone: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
             <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}><AtSign className="w-6 h-6" /></div>
                <div><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Details</h3><p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage communication preferences</p></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email (Read Only)</label>
                  <input type="email" disabled value={profile.email || ''} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold cursor-not-allowed ${isDark ? 'bg-white/[0.02] border border-white/5 text-gray-500' : 'bg-gray-100 border border-gray-200 text-gray-500'}`} /></div>
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</label>
                  <input type="text" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
                <div className="md:col-span-2"><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Residential Address</label>
                  <input type="text" value={profile.address || ''} onChange={(e) => setProfile({...profile, address: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
             </div>
          </motion.div>

          <motion.div variants={itemVariants} className={`rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
             <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}><Lock className="w-6 h-6" /></div>
                <div><h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Password</h3><p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Update your security credentials</p></div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Password</label>
                  <input type="password" value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
                <div><label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>New Password</label>
                  <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isDark ? 'bg-white/5 border border-white/10 text-white focus:bg-white/10' : 'bg-gray-50 border border-gray-100 text-gray-800'}`} /></div>
                <div className="md:col-span-2">
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={handleChangePassword}
                     disabled={loading || !passwords.oldPassword || !passwords.newPassword}
                     className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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

export default StudentProfile;
