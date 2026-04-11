import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const StudentAttendance = () => {
  const { isDark } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/attendance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendance(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = () => {
     setShowSuccessAnimation(true);
     setTimeout(() => setShowSuccessAnimation(false), 2500);
     
     // Optimistic update
     setAttendance(prev => [
       { _id: 'temp-' + Date.now(), date: new Date().toISOString(), status: 'Present', remarks: 'Self-marked' },
       ...prev
     ]);
  };

  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const percentage = attendance.length === 0 ? 0 : Math.round((presentDays / attendance.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>My Attendance</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>View your daily attendance records.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMarkAttendance}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 ${isDark ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
        >
          <CalendarDays className="w-4 h-4" /> Mark Present Today
        </motion.button>
      </div>

       <div className={`rounded-[24px] p-6 shadow-sm border flex flex-col justify-center mb-8 max-w-md ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Overall Attendance Rate</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
            </div>
       </div>

      <div className={`rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
         <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance History</h3>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Date</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Remarks</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="3" className={`py-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading...</td></tr>
                  ) : attendance.length === 0 ? (
                    <tr><td colSpan="3" className={`py-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No attendance records found.</td></tr>
                  ) : attendance.map((rec) => (
                     <tr key={rec._id} className={`border-b transition-colors py-4 ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                        <td className={`py-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="py-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center w-max gap-1.5 ${
                              rec.status === 'Present' ? (isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600') : 
                              rec.status === 'Absent' ? (isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-600') : (isDark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-50 text-orange-600')}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                 rec.status === 'Present' ? 'bg-emerald-500' : 
                                 rec.status === 'Absent' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                              {rec.status}
                           </span>
                        </td>
                        <td className={`py-4 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{rec.remarks || '-'}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className={`backdrop-blur-xl border p-8 rounded-3xl flex flex-col items-center justify-center shadow-2xl ${isDark ? 'bg-[#1a1f35]/90 border-white/10 shadow-emerald-500/20' : 'bg-white/90 border-white shadow-emerald-500/20'}`}
          >
            <motion.div 
               initial={{ pathLength: 0 }} 
               animate={{ pathLength: 1 }} 
               transition={{ duration: 0.5, delay: 0.2 }}
               className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/50"
            >
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
              </svg>
            </motion.div>
            <h2 className={`text-2xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Perfect!</h2>
            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Your attendance is marked for today.</p>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default StudentAttendance;
