import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Wallet, Clock, BarChart3, Megaphone, Award, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, BarChart, Bar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API = 'http://localhost:5001/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [pendingFees, setPendingFees] = useState(0);
  const [paidFees, setPaidFees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [feeChartData, setFeeChartData] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);

  const userName = user?.name || 'Student';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [classRes, attendRes, feeRes, annRes] = await Promise.all([
        axios.get(`${API}/classes`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API}/attendance`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API}/fees`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API}/announcements`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);

      setClasses((classRes.data.data || []).slice(0, 3));
      setAnnouncements(annRes.data.data || []);

      // Process attendance
      const attList = attendRes.data.data || [];
      if (attList.length > 0) {
        const presents = attList.filter(a => a.status === 'Present').length;
        const pct = Math.round((presents / attList.length) * 100);
        setAttendancePercent(pct);

        // Monthly aggregation for chart
        const monthMap = {};
        attList.forEach(a => {
          const m = new Date(a.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
          if (!monthMap[m]) monthMap[m] = { present: 0, total: 0 };
          monthMap[m].total++;
          if (a.status === 'Present') monthMap[m].present++;
        });
        const graphData = Object.entries(monthMap).map(([month, d]) => ({
          month, rate: Math.round((d.present / d.total) * 100)
        }));
        setAttendanceData(graphData.length > 0 ? graphData : [{ month: 'N/A', rate: 0 }]);

        // Calculate badges
        let badges = 0;
        if (pct >= 90) badges += 2; // Perfect Attendance
        else if (pct >= 75) badges += 1;
        setBadgeCount(badges);
      } else {
        setAttendanceData([{ month: 'N/A', rate: 0 }]);
        setBadgeCount(0);
      }

      // Process fees
      const feeList = feeRes.data.data || [];
      const paid = feeList.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
      const pending = feeList.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0);
      setPaidFees(paid);
      setPendingFees(pending);
      if (paid > 0) setBadgeCount(prev => prev + 1); // Paid badge

      // Fee chart by month
      const feeMonthMap = {};
      feeList.forEach(f => {
        const m = new Date(f.date).toLocaleDateString(undefined, { month: 'short' });
        if (!feeMonthMap[m]) feeMonthMap[m] = { paid: 0, pending: 0 };
        if (f.status === 'Paid') feeMonthMap[m].paid += f.amount;
        else feeMonthMap[m].pending += f.amount;
      });
      setFeeChartData(Object.entries(feeMonthMap).map(([month, d]) => ({ month, ...d })));

    } catch (error) {
      console.error("Dashboard error", error);
    } finally {
      setLoading(false);
    }
  };

  const latestAnnouncement = announcements[0];

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome back, {userName}.</h1>
          <p className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your academic progress is looking excellent this semester.</p>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold shadow-sm border border-purple-100"
        >
           <CheckCircle2 className="w-5 h-5 fill-purple-200" />
           Status: Active
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Top Stats Cards — Clickable */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Fees Paid', value: `₹${paidFees.toLocaleString('en-IN')}`, badge: 'Paid', path: '/student/fees', icon: Wallet, iconColor: 'blue', accentColor: 'emerald' },
              { label: 'Pending Fees', value: `₹${pendingFees.toLocaleString('en-IN')}`, badge: pendingFees > 0 ? 'Due' : 'Clear', path: '/student/fees', icon: Clock, iconColor: 'red', accentColor: 'red' },
              { label: 'Attendance Rate', value: `${attendancePercent}%`, badge: 'Realtime', path: '/student/attendance', icon: BarChart3, iconColor: 'purple', accentColor: 'purple' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                onClick={() => navigate(stat.path)}
                className={`rounded-[24px] p-6 shadow-xl border relative overflow-hidden group flex flex-col justify-between transition-all duration-300
                  ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20 hover:border-gray-600' : `bg-gradient-to-br from-white to-${stat.accentColor}-50/30 border-white shadow-${stat.accentColor}-100/40 hover:border-${stat.accentColor}-200`}`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full z-0 transition-transform group-hover:scale-110 ${isDark ? `bg-${stat.accentColor}-900/20` : `bg-${stat.accentColor}-50`}`}></div>
                <div className="flex justify-between items-start z-10 relative mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${isDark ? `bg-${stat.iconColor}-900/30 text-${stat.iconColor}-400` : `bg-${stat.iconColor}-50 text-${stat.iconColor}-500`}`}><stat.icon className="w-6 h-6" /></div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide ${isDark ? `bg-${stat.accentColor}-900/40 text-${stat.accentColor}-300` : `bg-${stat.accentColor}-50 text-${stat.accentColor}-600`}`}>{stat.badge}</span>
                </div>
                <div className="z-10 relative">
                  <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</h3>
                  <p className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Chart */}
            <motion.div variants={itemVariants} className={`rounded-[24px] shadow-sm border p-6 flex flex-col h-80 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
              <div className="mb-4">
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Trend</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly presence rate (%)</p>
              </div>
              <div className="flex-1 w-full text-xs font-bold">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#f1f5f9'} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 12, fontWeight: 600}} />
                    <Tooltip cursor={{ fill: isDark ? '#ffffff05' : '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} />
                    <Area type="monotone" dataKey="rate" stroke={isDark ? "#34d399" : "#10b981"} strokeWidth={4} fillOpacity={1} fill="url(#colorAtt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Fee Analytics Chart */}
            <motion.div variants={itemVariants} className={`rounded-[24px] shadow-sm border p-6 flex flex-col h-80 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
              <div className="mb-4">
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fee Analytics</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Paid vs Pending by month</p>
              </div>
              <div className="flex-1 w-full text-xs font-bold">
                {feeChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={feeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff10' : '#f1f5f9'} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 12, fontWeight: 600}} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip cursor={{ fill: isDark ? '#ffffff05' : '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} formatter={(val) => `₹${val}`} />
                      <Bar dataKey="paid" fill={isDark ? "#34d399" : "#10b981"} radius={[6,6,0,0]} maxBarSize={40} />
                      <Bar dataKey="pending" fill={isDark ? "#f87171" : "#ef4444"} radius={[6,6,0,0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={`flex items-center justify-center h-full text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>No fee data yet</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Classes */}
            <motion.div variants={itemVariants} className={`lg:col-span-2 rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Classes</h3>
              </div>
              <div className="space-y-5">
                {classes.length === 0 ? (
                  <p className={`text-sm py-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No classes scheduled by admin yet.</p>
                ) : (
                  classes.map((cls, idx) => {
                     const d = new Date(cls.date);
                     return (
                       <motion.div
                         key={cls._id || idx}
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         whileHover={{ x: 4 }}
                         className="flex gap-4 items-center"
                       >
                          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-sm
                            ${isDark ? 'bg-purple-900/30 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                             <span className="text-[10px] uppercase font-bold tracking-wider">{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                             <span className="text-xl font-bold leading-none mt-0.5">{d.getDate()}</span>
                          </div>
                          <div>
                             <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{cls.title}</h4>
                             <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                <Clock className="w-3 h-3" /> {cls.time} • Room {cls.room}
                             </p>
                          </div>
                       </motion.div>
                     )
                  })
                )}
              </div>
            </motion.div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Announcement Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-primary-600 rounded-[24px] p-6 text-white shadow-xl shadow-primary-600/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full z-0"></div>
                <Megaphone className="w-8 h-8 text-white/80 mb-4 relative z-10" />
                <h3 className="text-lg font-bold mb-2 relative z-10">
                  {latestAnnouncement ? latestAnnouncement.title : 'School Announcement'}
                </h3>
                <p className="text-primary-100 text-sm mb-5 relative z-10 opacity-90 leading-relaxed">
                  {latestAnnouncement ? latestAnnouncement.content : 'No announcements yet. Check back soon!'}
                </p>
                {latestAnnouncement && (
                  <div className="text-primary-200 text-[10px] font-semibold uppercase relative z-10">
                    {new Date(latestAnnouncement.createdAt).toLocaleDateString()}
                  </div>
                )}
              </motion.div>

              {/* Badges Card */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`rounded-[24px] p-6 flex flex-col items-center justify-center shadow-sm text-center relative overflow-hidden border
                  ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}
              >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{String(badgeCount).padStart(2, '0')}</h3>
                  <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Badges Earned</p>
                  <div className="mt-3 flex flex-wrap gap-1 justify-center">
                    {badgeCount >= 1 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>💰 Fees Paid</motion.span>}
                    {attendancePercent >= 75 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isDark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>📅 Good Attendance</motion.span>}
                    {attendancePercent >= 90 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isDark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-600'}`}>⭐ Perfect Record</motion.span>}
                  </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default StudentDashboard;
