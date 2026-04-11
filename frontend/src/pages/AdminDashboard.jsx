import React, { useState, useEffect } from 'react';
import { 
  Users, Wallet, TrendingUp, Eye, Edit2, CalendarDays, Plus, Megaphone, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL as API } from '../config';



const ModalWrapper = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    onMouseDown={onClose}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </motion.div>
  </div>
);

const AdminDashboard = () => {
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', course: '' });
  const [newClass, setNewClass] = useState({ title: '', date: '', time: '', room: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', category: 'General' });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getHeaders = () => {
    const t = localStorage.getItem('token');
    return { Authorization: `Bearer ${t}` };
  };

  const fetchData = async () => {
    try {
      const headers = getHeaders();
      const [studentRes, feesRes, attRes] = await Promise.all([
        axios.get(`${API}/students`, { headers }),
        axios.get(`${API}/fees`, { headers }),
        axios.get(`${API}/attendance`, { headers })
      ]);
      setStudents(studentRes.data.data);
      setFees(feesRes.data.data);
      setAttendance(attRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/students`, newStudent, { headers: getHeaders() });
      setShowAddModal(false);
      fetchData();
      setNewStudent({ name: '', email: '', password: '', course: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/students/${editingStudent._id}`, editingStudent, { headers: getHeaders() });
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating student');
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/classes`, newClass, { headers: getHeaders() });
      setShowClassModal(false);
      setNewClass({ title: '', date: '', time: '', room: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding class');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/announcements`, newAnnouncement, { headers: getHeaders() });
      setShowAnnouncementModal(false);
      setNewAnnouncement({ title: '', content: '', category: 'General' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating announcement');
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentDetailModal(true);
  };

  const totalFees = fees.reduce((acc, curr) => acc + curr.amount, 0);
  const paidFees = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
  const collectionRate = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const avgAttendance = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  // Fee pie data
  const pieData = [
    { name: 'Paid', value: paidFees },
    { name: 'Pending', value: totalFees - paidFees }
  ];
  const COLORS = ['#10b981', '#ef4444'];

  // Monthly student-fee chart
  const feeMonthMap = {};
  fees.forEach(f => {
    const m = new Date(f.date).toLocaleDateString(undefined, { month: 'short' });
    feeMonthMap[m] = (feeMonthMap[m] || 0) + f.amount;
  });
  const feeBarData = Object.entries(feeMonthMap).map(([month, amount]) => ({ month, amount }));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const modalOverlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalContentVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, scale: 0.9, y: 20 }
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Administrative Hub</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage students and monitor school performance.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAnnouncementModal(true)}
            className="px-5 py-2.5 bg-orange-50 text-orange-700 rounded-xl text-sm font-bold shadow-sm border border-orange-200 hover:bg-orange-100 flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" /> Announce
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowClassModal(true)}
            className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold shadow-sm border border-blue-200 hover:bg-blue-100 flex items-center gap-2"
          >
            <CalendarDays className="w-4 h-4" /> Schedule Class
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-white text-gray-700 rounded-xl text-sm font-bold shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Student
          </motion.button>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <ModalWrapper onClose={() => setShowAddModal(false)}>
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                 <input required type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
                 <input required type="email" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                 <input required type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Course / Class</label>
                 <input type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})} /></div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 bg-gray-100 rounded-xl font-bold">Cancel</button>
                 <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Create Student</motion.button>
               </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editingStudent && (
          <ModalWrapper onClose={() => setShowEditModal(false)}>
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            <form onSubmit={handleEditStudent} className="space-y-4">
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                 <input required type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Course / Class</label>
                 <input type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={editingStudent.course || ''} onChange={e => setEditingStudent({...editingStudent, course: e.target.value})} /></div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-500 bg-gray-100 rounded-xl font-bold">Cancel</button>
                 <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Save Changes</motion.button>
               </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClassModal && (
          <ModalWrapper onClose={() => setShowClassModal(false)}>
            <h2 className="text-xl font-bold mb-4">Schedule Class</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Class Title</label>
                 <input required type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newClass.title} onChange={e => setNewClass({...newClass, title: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                 <input required type="date" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5" value={newClass.date} onChange={e => setNewClass({...newClass, date: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
                 <input required type="text" placeholder="09:00 AM" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5" value={newClass.time} onChange={e => setNewClass({...newClass, time: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Room</label>
                 <input required type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5" value={newClass.room} onChange={e => setNewClass({...newClass, room: e.target.value})} /></div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setShowClassModal(false)} className="px-4 py-2 text-gray-500 bg-gray-100 rounded-xl font-bold">Cancel</button>
                 <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Schedule</motion.button>
               </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnnouncementModal && (
          <ModalWrapper onClose={() => setShowAnnouncementModal(false)}>
            <h2 className="text-xl font-bold mb-4">Create Announcement</h2>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                 <input required type="text" className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Content</label>
                 <textarea required rows={3} className="w-full bg-gray-50 border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none" value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                 <select className="w-full bg-gray-50 border rounded-xl px-4 py-2.5" value={newAnnouncement.category} onChange={e => setNewAnnouncement({...newAnnouncement, category: e.target.value})}>
                   <option>General</option><option>Exam</option><option>Events</option><option>Holiday</option>
                 </select></div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-4 py-2 text-gray-500 bg-gray-100 rounded-xl font-bold">Cancel</button>
                 <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Publish</motion.button>
               </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStudentDetailModal && selectedStudent && (
          <ModalWrapper onClose={() => setShowStudentDetailModal(false)}>
            <h2 className="text-xl font-bold mb-4">Student Profile</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{selectedStudent.name}</p>
                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500 font-semibold">Course</span><span className="font-bold">{selectedStudent.course || 'N/A'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500 font-semibold">Phone</span><span className="font-bold">{selectedStudent.phone || 'N/A'}</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500 font-semibold">Address</span><span className="font-bold">{selectedStudent.address || 'N/A'}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500 font-semibold">Joined</span><span className="font-bold">{new Date(selectedStudent.createdAt).toLocaleDateString()}</span></div>
            </div>
            <button onClick={() => setShowStudentDetailModal(false)} className="mt-6 w-full py-2.5 bg-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors">Close</button>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Users, label: 'Total Students', value: students.length, color: 'blue' },
          { icon: Wallet, label: 'Fees Collected', value: `₹${paidFees.toLocaleString('en-IN')}`, color: 'purple' },
          { icon: TrendingUp, label: 'Average Attendance', value: `${avgAttendance}%`, color: 'emerald' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`rounded-[24px] p-6 shadow-xl border flex flex-col justify-between h-40 relative overflow-hidden transition-all duration-300
              ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-gradient-to-br from-white to-indigo-50/30 border-white shadow-indigo-100/40'}`}
          >
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-${isDark ? '900/30' : '50'} text-${stat.color}-${isDark ? '400' : '500'} flex items-center justify-center`}>
               <stat.icon className="w-5 h-5 fill-current opacity-80" />
            </div>
            <div>
              <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</h3>
              <p className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Container */}
        <motion.div variants={itemVariants} className={`lg:col-span-2 rounded-[24px] p-6 shadow-sm border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly Fee Collection</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0.9}/>
                    <stop offset="95%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#f1f5f9'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip cursor={{ fill: isDark ? '#ffffff05' : '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} formatter={(val) => [`₹${val}`, 'Collected']} />
                <Bar dataKey="amount" fill="url(#colorAmount)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart Container */}
        <motion.div variants={itemVariants} className={`rounded-[24px] p-6 shadow-xl border flex flex-col justify-between ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-gradient-to-br from-white to-gray-50/80 border-gray-100 shadow-gray-200/50'}`}>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Collection Rate: {collectionRate}%</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                   <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#10b981" />
                     <stop offset="100%" stopColor="#047857" />
                   </linearGradient>
                   <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#ef4444" />
                     <stop offset="100%" stopColor="#b91c1c" />
                   </linearGradient>
                   <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                     <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity={isDark ? "0.4" : "0.1"} />
                   </filter>
                </defs>
                <Pie 
                   data={pieData} 
                   innerRadius={72} 
                   outerRadius={95} 
                   paddingAngle={8} 
                   dataKey="value" 
                   stroke="none"
                   cornerRadius={6}
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                       key={`cell-${index}`} 
                       fill={index === 0 ? "url(#colorCollected)" : "url(#colorOverdue)"} 
                       style={{ filter: "url(#shadow)" }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                      backgroundColor: isDark ? '#1e293b' : '#fff', 
                      color: isDark ? '#fff' : '#000' 
                   }} 
                   formatter={(val) => `₹${val}`} 
                   itemStyle={{ fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{collectionRate}%</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Collected</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Student Registry */}
      <motion.div variants={itemVariants} className={`rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
         <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Registry</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Student</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Class</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Actions</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="3" className="py-4 text-center">
                      <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
                    </td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan="3" className={`py-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No students registered yet.</td></tr>
                  ) : students.map((student, idx) => (
                     <motion.tr
                       key={student._id}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.04 }}
                       className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50/50'}`}
                     >
                        <td className="py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-sm">{student.name.charAt(0)}</div>
                              <div>
                                 <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                                 <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{student.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className={`py-4 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{student.course || 'N/A'}</td>
                        <td className="py-4">
                           <div className="flex items-center justify-end gap-2 text-gray-400">
                              <motion.button whileHover={{ scale: 1.2 }} onClick={() => handleViewStudent(student)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:text-primary-400 hover:bg-primary-900/40 text-gray-400' : 'hover:text-primary-600 hover:bg-primary-50 text-gray-400'}`} title="View"><Eye className="w-4 h-4" /></motion.button>
                              <motion.button whileHover={{ scale: 1.2 }} onClick={() => { setEditingStudent(student); setShowEditModal(true); }} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:text-primary-400 hover:bg-primary-900/40 text-gray-400' : 'hover:text-primary-600 hover:bg-primary-50 text-gray-400'}`} title="Edit"><Edit2 className="w-4 h-4" /></motion.button>
                           </div>
                        </td>
                     </motion.tr>
                  ))}
               </tbody>
            </table>
         </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
