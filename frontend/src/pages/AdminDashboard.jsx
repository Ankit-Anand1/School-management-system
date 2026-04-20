import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Wallet, TrendingUp, Eye, Edit2, CalendarDays, Plus,
  Megaphone, X, ChevronDown, Layers, BookOpen, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL as API } from '../config';

/* ─────────────────────────────────────────────────────────────────────────── */
/* Modern FilterChip (same as Attendance page)                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const FilterChip = ({ icon: Icon, value, onChange, options, isDark, placeholder }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200 ${
    value
      ? isDark ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-indigo-50 border-indigo-300 shadow-md shadow-indigo-100'
      : isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
  }`}>
    {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${value ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />}
    <select value={value} onChange={onChange}
      className={`appearance-none bg-transparent text-sm font-semibold focus:outline-none cursor-pointer pr-5 ${
        value ? (isDark ? 'text-indigo-300' : 'text-indigo-700') : (isDark ? 'text-gray-300' : 'text-gray-600')
      }`}>
      {options}
    </select>
    <ChevronDown className={`w-3.5 h-3.5 shrink-0 -ml-4 pointer-events-none ${value ? (isDark ? 'text-indigo-400' : 'text-indigo-500') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* Modern Date Picker — replaces the ugly native <input type="date">           */
/* ─────────────────────────────────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function buildCalendar(year, month) {
  const first    = new Date(year, month, 1).getDay();
  const daysInM  = new Date(year, month + 1, 0).getDate();
  const daysInPM = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ day: daysInPM - i, cur: false });
  for (let d = 1; d <= daysInM; d++)   cells.push({ day: d, cur: true });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)        cells.push({ day: d, cur: false });
  return cells;
}

const ModernDatePicker = ({ value, onChange, isDark, label }) => {
  const [open, setOpen]   = useState(false);
  const parsed = value ? new Date(value) : new Date();
  const [view, setView]   = useState({ y: parsed.getFullYear(), m: parsed.getMonth() });

  const cells    = useMemo(() => buildCalendar(view.y, view.m), [view]);
  const selDay   = value ? new Date(value).getDate()   : null;
  const selMonth = value ? new Date(value).getMonth()  : null;
  const selYear  = value ? new Date(value).getFullYear(): null;

  const select = (day) => {
    const d = new Date(view.y, view.m, day);
    onChange(d.toISOString().split('T')[0]);
    setOpen(false);
  };

  const prevM = () => setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const nextM = () => setView(v => v.m === 11 ? { y: v.y + 1, m: 0  } : { y: v.y, m: v.m + 1 });

  const today = new Date();

  return (
    <div className="relative">
      {label && <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>}
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-left transition-all ${
          isDark ? 'bg-gray-700/60 border-white/10 text-white hover:border-white/20'
                 : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
        }`}>
        <CalendarDays className={`w-4 h-4 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
        <span className="flex-1">{value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
            className={`absolute z-[200] mt-2 rounded-2xl shadow-2xl border p-4 w-72 ${
              isDark ? 'bg-[#1e2340] border-white/10' : 'bg-white border-gray-200'
            }`}>

            {/* Month / Year nav */}
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevM}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {MONTHS[view.m]} {view.y}
              </span>
              <button type="button" onClick={nextM}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className={`text-center text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d}</div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((cell, i) => {
                const isToday    = cell.cur && cell.day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
                const isSelected = cell.cur && cell.day === selDay && view.m === selMonth && view.y === selYear;
                return (
                  <button key={i} type="button"
                    onClick={() => cell.cur && select(cell.day)}
                    disabled={!cell.cur}
                    className={`mx-auto w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      !cell.cur ? (isDark ? 'text-gray-700' : 'text-gray-300') :
                      isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' :
                      isToday   ? (isDark ? 'bg-white/10 text-indigo-300 font-bold' : 'bg-indigo-50 text-indigo-600 font-bold') :
                                  (isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100')
                    }`}>
                    {cell.day}
                  </button>
                );
              })}
            </div>

            {/* Today shortcut */}
            <button type="button" onClick={() => select(today.getDate())}
              className={`mt-3 w-full py-1.5 text-xs font-bold rounded-lg transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}>
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Modal wrapper                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const ModalWrapper = ({ children, onClose, isDark }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onMouseDown={onClose}>
    <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className={`rounded-3xl p-8 w-full max-w-md shadow-2xl border ${isDark ? 'bg-[#1a1f35] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
      onMouseDown={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </div>
);

/* Shared input style */
const inp = (isDark) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
    isDark ? 'bg-gray-700/60 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'
  }`;

/* ─────────────────────────────────────────────────────────────────────────── */
/* Recharts custom tooltip                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
const BarTooltip = ({ active, payload, label, isDark }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold ${isDark ? 'bg-[#1e2340] border-white/10 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>{label}</p>
      <p className="text-lg font-black">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Main Dashboard                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { token }  = useAuth();
  const { isDark } = useTheme();

  const [students,   setStudents]   = useState([]);
  const [fees,       setFees]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading,    setLoading]    = useState(true);

  /* modals */
  const [showAddModal,         setShowAddModal]         = useState(false);
  const [showEditModal,        setShowEditModal]        = useState(false);
  const [showClassModal,       setShowClassModal]       = useState(false);
  const [showAnnouncementModal,setShowAnnouncementModal]= useState(false);
  const [showStudentDetail,    setShowStudentDetail]    = useState(false);
  const [selectedStudent,      setSelectedStudent]      = useState(null);
  const [editingStudent,       setEditingStudent]       = useState(null);

  /* forms */
  const [newStudent,      setNewStudent]      = useState({ name:'', email:'', password:'', course:'' });
  const [newClass,        setNewClass]        = useState({ title:'', date:'', time:'', room:'' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title:'', content:'', category:'General' });

  /* chart filters */
  const curYear = new Date().getFullYear();
  const [chartYear,  setChartYear]  = useState(String(curYear));
  const [chartMonth, setChartMonth] = useState('');   // '' = all months in year

  /* registry filter */
  const [regClass, setRegClass] = useState('');

  const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, fRes, aRes] = await Promise.all([
        axios.get(`${API}/students`,    { headers: getH() }),
        axios.get(`${API}/fees`,        { headers: getH() }),
        axios.get(`${API}/attendance`,  { headers: getH() }),
      ]);
      setStudents(sRes.data.data);
      setFees(fRes.data.data);
      setAttendance(aRes.data.data);
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  /* ── derived stats ── */
  const totalFees  = fees.reduce((a, f) => a + f.amount, 0);
  const paidFees   = fees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);
  const collRate   = totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;
  const presCount  = attendance.filter(a => a.status === 'Present').length;
  const avgAtt     = attendance.length > 0 ? Math.round((presCount / attendance.length) * 100) : 0;

  const pieData = [
    { name: 'Paid',    value: paidFees },
    { name: 'Pending', value: totalFees - paidFees },
  ];

  /* ── unique classes from students ── */
  const classes = useMemo(
    () => [...new Set(students.map(s => s.course).filter(Boolean))].sort(),
    [students]
  );

  /* ── filtered students for registry ── */
  const regStudents = useMemo(
    () => regClass ? students.filter(s => s.course === regClass) : students,
    [students, regClass]
  );

  /* ── fee bar chart data ── */
  const feeBarData = useMemo(() => {
    const yr = Number(chartYear);

    if (chartMonth !== '') {
      // single month — show day-by-day
      const mn = Number(chartMonth);
      const dayMap = {};
      fees.forEach(f => {
        const d = new Date(f.date);
        if (d.getFullYear() === yr && d.getMonth() === mn && f.status === 'Paid') {
          const key = d.getDate();
          dayMap[key] = (dayMap[key] || 0) + f.amount;
        }
      });
      const daysInMonth = new Date(yr, mn + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => ({
        month: String(i + 1),
        amount: dayMap[i + 1] || 0,
      }));
    }

    // all months of selected year
    const monthMap = {};
    fees.forEach(f => {
      const d = new Date(f.date);
      if (d.getFullYear() === yr && f.status === 'Paid') {
        const key = d.getMonth();
        monthMap[key] = (monthMap[key] || 0) + f.amount;
      }
    });
    return Array.from({ length: 12 }, (_, i) => ({
      month: MONTHS[i],
      amount: monthMap[i] || 0,
    }));
  }, [fees, chartYear, chartMonth]);

  /* year options */
  const yearOptions = useMemo(() => {
    const yrs = new Set(fees.map(f => new Date(f.date).getFullYear()));
    yrs.add(curYear);
    return [...yrs].sort((a, b) => b - a);
  }, [fees]);

  /* ── handlers ── */
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/students`, newStudent, { headers: getH() }); setShowAddModal(false); fetchData(); setNewStudent({ name:'', email:'', password:'', course:'' }); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try { await axios.put(`${API}/students/${editingStudent._id}`, editingStudent, { headers: getH() }); setShowEditModal(false); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/classes`, newClass, { headers: getH() }); setShowClassModal(false); setNewClass({ title:'', date:'', time:'', room:'' }); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try { await axios.post(`${API}/announcements`, newAnnouncement, { headers: getH() }); setShowAnnouncementModal(false); setNewAnnouncement({ title:'', content:'', category:'General' }); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const containerVariants = { hidden: { opacity:0 }, visible: { opacity:1, transition:{ staggerChildren:0.07 } } };
  const itemVariants      = { hidden: { opacity:0, y:18 }, visible: { opacity:1, y:0, transition:{ duration:0.38 } } };

  /* ── label helpers ── */
  const labelCls = isDark ? 'block text-xs font-bold mb-1.5 text-gray-400' : 'block text-xs font-bold mb-1.5 text-gray-500';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Administrative Hub</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Manage students and monitor school performance.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { label:'Announce',        icon: Megaphone,     cls:'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100', fn: () => setShowAnnouncementModal(true) },
            { label:'Schedule Class',  icon: CalendarDays,  cls:'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',         fn: () => setShowClassModal(true) },
            { label:'Add Student',     icon: Plus,          cls:`${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`, fn: () => setShowAddModal(true) },
          ].map(({ label, icon: Icon, cls, fn }) => (
            <motion.button key={label} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={fn}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border flex items-center gap-2 shadow-sm transition-all ${cls}`}>
              <Icon className="w-4 h-4" /> {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ══════════ MODALS ══════════ */}

      {/* Add Student */}
      <AnimatePresence>
        {showAddModal && (
          <ModalWrapper isDark={isDark} onClose={() => setShowAddModal(false)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="space-y-4">
              {[{ l:'Full Name', k:'name', t:'text' }, { l:'Email', k:'email', t:'email' }, { l:'Password', k:'password', t:'text' }].map(({ l, k, t }) => (
                <div key={k}><label className={labelCls}>{l}</label>
                  <input required type={t} className={inp(isDark)} value={newStudent[k]} onChange={e => setNewStudent({ ...newStudent, [k]: e.target.value })} /></div>
              ))}
              <div><label className={labelCls}>Course / Class</label>
                <input type="text" className={inp(isDark)} value={newStudent.course} onChange={e => setNewStudent({ ...newStudent, course: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">Create Student</button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Edit Student */}
      <AnimatePresence>
        {showEditModal && editingStudent && (
          <ModalWrapper isDark={isDark} onClose={() => setShowEditModal(false)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Student</h2>
              <button onClick={() => setShowEditModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div><label className={labelCls}>Full Name</label>
                <input required type="text" className={inp(isDark)} value={editingStudent.name} onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} /></div>
              <div><label className={labelCls}>Course / Class</label>
                <input type="text" className={inp(isDark)} value={editingStudent.course || ''} onChange={e => setEditingStudent({ ...editingStudent, course: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">Save Changes</button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Schedule Class — uses ModernDatePicker */}
      <AnimatePresence>
        {showClassModal && (
          <ModalWrapper isDark={isDark} onClose={() => setShowClassModal(false)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Schedule Class</h2>
              <button onClick={() => setShowClassModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div><label className={labelCls}>Class Title</label>
                <input required type="text" className={inp(isDark)} value={newClass.title} onChange={e => setNewClass({ ...newClass, title: e.target.value })} /></div>
              <ModernDatePicker isDark={isDark} label="Date *" value={newClass.date}
                onChange={v => setNewClass({ ...newClass, date: v })} />
              <div><label className={labelCls}>Time</label>
                <input required type="text" placeholder="09:00 AM" className={inp(isDark)} value={newClass.time} onChange={e => setNewClass({ ...newClass, time: e.target.value })} /></div>
              <div><label className={labelCls}>Room</label>
                <input required type="text" className={inp(isDark)} value={newClass.room} onChange={e => setNewClass({ ...newClass, room: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowClassModal(false)} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">Schedule</button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <ModalWrapper isDark={isDark} onClose={() => setShowAnnouncementModal(false)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Create Announcement</h2>
              <button onClick={() => setShowAnnouncementModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div><label className={labelCls}>Title</label>
                <input required type="text" className={inp(isDark)} value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} /></div>
              <div><label className={labelCls}>Content</label>
                <textarea required rows={3} className={`${inp(isDark)} resize-none`} value={newAnnouncement.content} onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })} /></div>
              <div><label className={labelCls}>Category</label>
                <select className={inp(isDark)} value={newAnnouncement.category} onChange={e => setNewAnnouncement({ ...newAnnouncement, category: e.target.value })}>
                  {['General','Exam','Events','Holiday'].map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm shadow-lg">Publish</button>
              </div>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Student Detail Modal */}
      <AnimatePresence>
        {showStudentDetail && selectedStudent && (
          <ModalWrapper isDark={isDark} onClose={() => setShowStudentDetail(false)}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Student Profile</h2>
              <button onClick={() => setShowStudentDetail(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedStudent.name}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{selectedStudent.email}</p>
              </div>
            </div>
            <div className="space-y-0">
              {[
                { l:'Course',  v: selectedStudent.course  || 'N/A' },
                { l:'Phone',   v: selectedStudent.phone   || 'N/A' },
                { l:'Address', v: selectedStudent.address || 'N/A' },
                { l:'Joined',  v: new Date(selectedStudent.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) },
              ].map(({ l, v }) => (
                <div key={l} className={`flex justify-between py-3 border-b text-sm ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{l}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowStudentDetail(false)}
              className={`mt-5 w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              Close
            </button>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* ── Top Stats ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Users,     label: 'Total Students',    value: students.length,                     grad: 'from-blue-500 to-indigo-500'  },
          { icon: Wallet,    label: 'Fees Collected',    value: `₹${paidFees.toLocaleString('en-IN')}`, grad: 'from-violet-500 to-purple-500' },
          { icon: TrendingUp,label: 'Avg Attendance',    value: `${avgAtt}%`,                        grad: 'from-emerald-500 to-teal-500'  },
        ].map(({ icon: Icon, label, value, grad }) => (
          <motion.div key={label} whileHover={{ scale: 1.03, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
            className={`rounded-[24px] p-6 shadow-xl border h-40 flex flex-col justify-between relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5' : 'bg-gradient-to-br from-white to-indigo-50/30 border-white shadow-indigo-100/40'}`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</h3>
              <p className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Analytics Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar Chart */}
        <motion.div variants={itemVariants}
          className={`lg:col-span-2 rounded-[24px] p-6 shadow-sm border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>

          {/* Chart header + filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Monthly Fee Collection</h3>
            <div className="flex gap-2 flex-wrap">
              {/* Year filter */}
              <FilterChip isDark={isDark} icon={CalendarDays} value={chartYear} onChange={e => { setChartYear(e.target.value); setChartMonth(''); }}
                options={yearOptions.map(y => <option key={y} value={y}>{y}</option>)} />
              {/* Month filter */}
              <FilterChip isDark={isDark} icon={BookOpen} value={chartMonth} onChange={e => setChartMonth(e.target.value)}
                options={<>
                  <option value="">All Months</option>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </>} />
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor={isDark ? '#818cf8' : '#6366f1'} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={isDark ? '#818cf8' : '#6366f1'} stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff08' : '#f1f5f9'} />
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={8} />
                {/* ✅ FIX: domain + tickFormatter properly scaled */}
                <YAxis axisLine={false} tickLine={false} width={70}
                  tick={{ fill: isDark ? '#94a3b8' : '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  domain={[0, dataMax => Math.ceil(dataMax * 1.2 / 500) * 500 || 1000]}
                />
                <Tooltip content={<BarTooltip isDark={isDark} />} cursor={{ fill: isDark ? '#ffffff05' : '#f8fafc' }} />
                <Bar dataKey="amount" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div variants={itemVariants}
          className={`rounded-[24px] p-6 shadow-xl border flex flex-col justify-between ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5' : 'bg-gradient-to-br from-white to-gray-50/80 border-gray-100 shadow-gray-200/50'}`}>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Collection Rate: {collRate}%</h3>
          <div className="h-64 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="paidGrad"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981"/><stop offset="100%" stopColor="#047857"/></linearGradient>
                  <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444"/><stop offset="100%" stopColor="#b91c1c"/></linearGradient>
                </defs>
                <Pie data={pieData} innerRadius={72} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={6}>
                  <Cell fill="url(#paidGrad)" />
                  <Cell fill="url(#pendingGrad)" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius:'16px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }}
                  formatter={v => `₹${v.toLocaleString('en-IN')}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{collRate}%</span>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Collected</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {[{ label:'Paid', color:'bg-emerald-500', value: paidFees }, { label:'Pending', color:'bg-red-500', value: totalFees - paidFees }].map(l => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${l.color} shrink-0`} />
                <div>
                  <p className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l.label}</p>
                  <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{l.value.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Student Registry ── */}
      <motion.div variants={itemVariants}
        className={`rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>

        {/* Registry header + class filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Registry</h3>
            <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Showing {regStudents.length} of {students.length} students
            </p>
          </div>

          {/* Class pills */}
          {classes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setRegClass('')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  !regClass ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                }`}>
                All <span className="opacity-70 ml-1">({students.length})</span>
              </button>
              {classes.map(cls => (
                <button key={cls} onClick={() => setRegClass(cls)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    regClass === cls ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent'
                  }`}>
                  {cls} <span className="opacity-70 ml-1">({students.filter(s => s.course === cls).length})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                {['Student', 'Class', 'Actions'].map(h => (
                  <th key={h} className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${h === 'Actions' ? 'text-right' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="3" className="py-8 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></div>
                </td></tr>
              ) : regStudents.length === 0 ? (
                <tr><td colSpan="3" className={`py-8 text-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No students found.</td></tr>
              ) : regStudents.map((s, idx) => (
                <motion.tr key={s._id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx * 0.03 }}
                  className={`border-b group transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50/60'}`}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.name}</p>
                        <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    {s.course
                      ? <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{s.course}</span>
                      : <span className={`text-xs font-medium ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>N/A</span>
                    }
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <motion.button whileHover={{ scale:1.2 }} onClick={() => { setSelectedStudent(s); setShowStudentDetail(true); }}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:text-indigo-400 hover:bg-indigo-900/30 text-gray-500' : 'hover:text-indigo-600 hover:bg-indigo-50 text-gray-400'}`} title="View">
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button whileHover={{ scale:1.2 }} onClick={() => { setEditingStudent(s); setShowEditModal(true); }}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:text-indigo-400 hover:bg-indigo-900/30 text-gray-500' : 'hover:text-indigo-600 hover:bg-indigo-50 text-gray-400'}`} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
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
