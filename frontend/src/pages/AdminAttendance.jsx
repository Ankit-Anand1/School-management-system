import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CalendarDays, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminAttendance = () => {
  const { isDark } = useTheme();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState({ student: '', date: new Date().toISOString().split('T')[0], status: 'Present', remarks: '' });
  const [filterStudentId, setFilterStudentId] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [attRes, stdRes] = await Promise.all([
        axios.get('http://localhost:5001/api/attendance', { headers }),
        axios.get('http://localhost:5001/api/students', { headers })
      ]);
      setAttendance(attRes.data.data);
      setStudents(stdRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendance = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/attendance', newAttendance, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2500);
      fetchData();
      setNewAttendance({ student: '', date: new Date().toISOString().split('T')[0], status: 'Present', remarks: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding attendance');
    }
  };

  const filteredAttendance = useMemo(() => {
    return filterStudentId ? attendance.filter(a => a.student?._id === filterStudentId) : attendance;
  }, [attendance, filterStudentId]);

  const presentDays = filteredAttendance.filter(a => a.status === 'Present').length;
  const percentage = filteredAttendance.length === 0 ? 0 : Math.round((presentDays / filteredAttendance.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Management</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monitor student presence across the campus.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-white/5' : 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700'}`}
        >
          <Plus className="w-4 h-4" /> Add Record
        </motion.button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onMouseDown={() => setShowAddModal(false)}>
          <div className={`rounded-2xl p-8 w-full max-w-md shadow-2xl ${isDark ? 'bg-gray-800' : 'bg-white'}`} onMouseDown={e => e.stopPropagation()}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Attendance</h2>
            <form onSubmit={handleAddAttendance} className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Student</label>
                  <select required className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newAttendance.student} onChange={e => setNewAttendance({...newAttendance, student: e.target.value})}>
                     <option value="">Select Student</option>
                     {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                  <input required type="date" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5" value={newAttendance.date} onChange={e => setNewAttendance({...newAttendance, date: e.target.value})} />
               </div>
               <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <select required className={`w-full border rounded-xl px-4 py-2.5 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} value={newAttendance.status} onChange={e => setNewAttendance({...newAttendance, status: e.target.value})}>
                     <option value="Present">Present</option>
                     <option value="Absent">Absent</option>
                     <option value="Late">Late</option>
                  </select>
               </div>
               <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remarks</label>
                  <input type="text" className={`w-full border rounded-xl px-4 py-2.5 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} value={newAttendance.remarks} onChange={e => setNewAttendance({...newAttendance, remarks: e.target.value})} />
               </div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setShowAddModal(false)} className={`px-4 py-2 rounded-xl font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'text-gray-500 bg-gray-100'}`}>Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Create Record</button>
               </div>
            </form>
          </div>
        </div>
      )}

       <div className={`rounded-[24px] p-6 shadow-xl border flex flex-col justify-center mb-8 max-w-md transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-gradient-to-br from-white to-gray-50/80 border-white shadow-gray-200/50'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>School Average Attendance</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{percentage}%</span>
            </div>
       </div>

      <div className={`rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
         <div className="flex items-center justify-between mb-6">
           <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Logs</h3>
           <select className={`text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none ${isDark ? 'bg-white/5 border border-white/5 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`} value={filterStudentId} onChange={e => setFilterStudentId(e.target.value)}>
             <option value="">All Students</option>
             {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
           </select>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Student</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Date</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Remarks</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="4" className="py-4 text-center">
                      <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
                    </td></tr>
                  ) : filteredAttendance.length === 0 ? (
                    <tr><td colSpan="4" className={`py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No attendance records found.</td></tr>
                  ) : filteredAttendance.map((rec) => (
                     <tr key={rec._id} className={`border-b transition-colors py-4 ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                        <td className="py-4">
                           <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{rec.student?.name || 'Unknown'}</div>
                        </td>
                        <td className={`py-4 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(rec.date).toLocaleDateString()}</td>
                        <td className="py-4">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center w-max gap-1.5 ${
                              rec.status === 'Present' ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : 
                              rec.status === 'Absent' ? (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600') : 
                              (isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-50 text-orange-600')}`}>
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
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl flex flex-col items-center justify-center shadow-2xl"
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
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Record Added!</h2>
            <p className="text-gray-300 font-medium">The attendance has been successfully logged.</p>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
};

export default AdminAttendance;
