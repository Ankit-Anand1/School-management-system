import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, X, CheckCircle, Users, CalendarDays,
  ChevronDown, Layers, UserCheck, AlertCircle, Zap,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

/* Re-usable mini calendar date picker */
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_H   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function buildCal(year, month) {
  const first = new Date(year, month, 1).getDay();
  const dim   = new Date(year, month + 1, 0).getDate();
  const dim_p = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = first - 1; i >= 0; i--) cells.push({ day: dim_p - i, cur: false });
  for (let d = 1; d <= dim; d++)        cells.push({ day: d, cur: true });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)        cells.push({ day: d, cur: false });
  return cells;
}

const ModernDatePicker = ({ value, onChange, isDark, label }) => {
  const [open, setOpen] = useState(false);
  const parsed = value ? new Date(value) : new Date();
  const [view, setView] = useState({ y: parsed.getFullYear(), m: parsed.getMonth() });
  const cells    = useMemo(() => buildCal(view.y, view.m), [view]);
  const selDay   = value ? new Date(value).getDate()    : null;
  const selMonth = value ? new Date(value).getMonth()   : null;
  const selYear  = value ? new Date(value).getFullYear(): null;
  const today    = new Date();

  const select = (day) => {
    const d = new Date(view.y, view.m, day);
    onChange(d.toISOString().split('T')[0]);
    setOpen(false);
  };
  const prevM = () => setView(v => v.m === 0  ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  const nextM = () => setView(v => v.m === 11 ? { y: v.y + 1, m: 0  } : { y: v.y, m: v.m + 1 });

  return (
    <div className="relative">
      {label && <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</label>}
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border text-sm font-semibold text-left transition-all ${
          isDark ? 'bg-gray-700/60 border-white/10 text-white hover:border-white/20' : 'bg-gray-50 border-gray-200 text-gray-800 hover:border-gray-300'
        }`}>
        <CalendarDays className={`w-4 h-4 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
        <span className="flex-1">{value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select date'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity:0, y:-8, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.97 }} transition={{ duration:0.15 }}
            className={`absolute z-[200] mt-2 rounded-2xl shadow-2xl border p-4 w-72 ${
              isDark ? 'bg-[#1e2340] border-white/10' : 'bg-white border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={prevM}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{MONTHS_S[view.m]} {view.y}</span>
              <button type="button" onClick={nextM}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {DAYS_H.map(d => <div key={d} className={`text-center text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((cell, i) => {
                const isTod = cell.cur && cell.day === today.getDate() && view.m === today.getMonth() && view.y === today.getFullYear();
                const isSel = cell.cur && cell.day === selDay && view.m === selMonth && view.y === selYear;
                return (
                  <button key={i} type="button" onClick={() => cell.cur && select(cell.day)} disabled={!cell.cur}
                    className={`mx-auto w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      !cell.cur ? (isDark ? 'text-gray-700' : 'text-gray-300') :
                      isSel ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' :
                      isTod ? (isDark ? 'bg-white/10 text-indigo-300 font-bold' : 'bg-indigo-50 text-indigo-600 font-bold') :
                               (isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100')
                    }`}>{cell.day}</button>
                );
              })}
            </div>
            <button type="button" onClick={() => { const t = new Date(); setView({ y: t.getFullYear(), m: t.getMonth() }); select(t.getDate()); }}
              className={`mt-3 w-full py-1.5 text-xs font-bold rounded-lg transition-colors ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}>
              Today
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── constants ─────────────────────────────────────────────────────────── */
const STATUS_OPTIONS = ['Present', 'Absent', 'Late'];

const S_COLOR = {
  Present: {
    bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500',
  },
  Absent : {
    bg: 'bg-red-500',     text: 'text-red-600',     light: 'bg-red-50 text-red-700 border-red-200',
    dark: 'bg-red-500/15 text-red-400 border-red-500/30',           dot: 'bg-red-500',
  },
  Late   : {
    bg: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50 text-amber-700 border-amber-200',
    dark: 'bg-amber-500/15 text-amber-400 border-amber-500/30',     dot: 'bg-amber-500',
  },
};

/* ─── tiny helpers ───────────────────────────────────────────────────────── */
const inputCls = (isDark) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors ${
    isDark ? 'bg-gray-700/60 border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'
  }`;

const StatusBadge = ({ status, isDark }) => {
  const c = S_COLOR[status] || S_COLOR.Absent;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isDark ? c.dark : c.light}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

/* ─── Modern Filter Chip ─────────────────────────────────────────────────── */
const FilterSelect = ({ icon: Icon, label, value, onChange, options, isDark }) => (
  <div className="relative">
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200 ${
      value
        ? isDark ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-indigo-50 border-indigo-300 shadow-md shadow-indigo-100'
        : isDark ? 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
    }`}>
      {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${value ? (isDark ? 'text-indigo-400' : 'text-indigo-600') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />}
      <select
        value={value}
        onChange={onChange}
        className={`appearance-none bg-transparent text-sm font-semibold focus:outline-none cursor-pointer pr-5 ${
          value ? (isDark ? 'text-indigo-300' : 'text-indigo-700') : (isDark ? 'text-gray-300' : 'text-gray-600')
        }`}
      >
        {options}
      </select>
      <ChevronDown className={`w-3.5 h-3.5 shrink-0 -ml-4 pointer-events-none ${value ? (isDark ? 'text-indigo-400' : 'text-indigo-500') : (isDark ? 'text-gray-500' : 'text-gray-400')}`} />
    </div>
  </div>
);

/* ─── main component ─────────────────────────────────────────────────────── */
const AdminAttendance = () => {
  const { isDark } = useTheme();

  const [attendance, setAttendance] = useState([]);
  const [students, setStudents]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showSuccess, setShowSuccess] = useState({ show: false, msg: '' });

  /* modal modes: 'individual' | 'bulk' | null */
  const [addMode, setAddMode]       = useState(null);
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm]     = useState({});

  /* individual add form */
  const [newAtt, setNewAtt] = useState({
    _classFilter: '', student: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present', remarks: '',
  });

  /* bulk add form */
  const [bulk, setBulk] = useState({
    class: '',
    date: new Date().toISOString().split('T')[0],
    absentIds: new Set(),   // students marked absent
    remarks: '',
  });

  /* filters */
  const [filterClass,  setFilterClass]  = useState('');
  const [filterStu,    setFilterStu]    = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const getH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  /* ── fetch ── */
  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 6000);
    return () => clearInterval(iv);
  }, []);

  const fetchData = async () => {
    try {
      const [ar, sr] = await Promise.all([
        axios.get(`${API_URL}/attendance`, { headers: getH() }),
        axios.get(`${API_URL}/students`,   { headers: getH() }),
      ]);
      setAttendance(ar.data.data);
      setStudents(sr.data.data);
    } catch (e) { console.error(e); }
    finally   { setLoading(false); }
  };

  /* ── derived ── */
  const classes = useMemo(
    () => [...new Set(students.map(s => s.course).filter(Boolean))].sort(),
    [students]
  );

  const classStudentIds = useMemo(() => {
    if (!filterClass) return null;
    return new Set(students.filter(s => s.course === filterClass).map(s => s._id));
  }, [filterClass, students]);

  const bulkClassStudents = useMemo(
    () => bulk.class ? students.filter(s => s.course === bulk.class) : [],
    [bulk.class, students]
  );

  const filtered = useMemo(() => {
    let list = attendance;
    if (filterClass && classStudentIds) list = list.filter(a => classStudentIds.has(a.student?._id));
    if (filterStu)    list = list.filter(a => a.student?._id === filterStu);
    if (filterStatus) list = list.filter(a => a.status === filterStatus);
    return list;
  }, [attendance, filterClass, classStudentIds, filterStu, filterStatus]);

  const stats = useMemo(() => {
    const total   = filtered.length;
    const present = filtered.filter(a => a.status === 'Present').length;
    const absent  = filtered.filter(a => a.status === 'Absent').length;
    const late    = filtered.filter(a => a.status === 'Late').length;
    const pct     = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, pct };
  }, [filtered]);

  const flash = (msg) => { setShowSuccess({ show: true, msg }); setTimeout(() => setShowSuccess({ show: false, msg: '' }), 2800); };

  /* ── individual add ── */
  const handleAddIndividual = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/attendance`, {
        student: newAtt.student, date: newAtt.date, status: newAtt.status, remarks: newAtt.remarks,
      }, { headers: getH() });
      setAddMode(null);
      setNewAtt({ _classFilter: '', student: '', date: new Date().toISOString().split('T')[0], status: 'Present', remarks: '' });
      fetchData();
      flash('Attendance recorded!');
    } catch (err) { alert(err.response?.data?.message || 'Error adding attendance'); }
  };

  /* ── bulk add ── */
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!bulk.class || !bulkClassStudents.length) return;
    try {
      const records = bulkClassStudents.map(s => ({
        student : s._id,
        date    : bulk.date,
        status  : bulk.absentIds.has(s._id) ? 'Absent' : 'Present',
        remarks : bulk.remarks,
      }));
      await Promise.all(records.map(r => axios.post(`${API_URL}/attendance`, r, { headers: getH() })));
      setAddMode(null);
      setBulk({ class: '', date: new Date().toISOString().split('T')[0], absentIds: new Set(), remarks: '' });
      fetchData();
      flash(`Bulk attendance saved for ${records.length} students!`);
    } catch (err) { alert(err.response?.data?.message || 'Error saving bulk attendance'); }
  };

  /* ── edit ── */
  const openEdit = (rec) => {
    setEditRecord(rec);
    setEditForm({ status: rec.status, remarks: rec.remarks || '', date: rec.date?.split('T')[0] || '' });
  };
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/attendance/${editRecord._id}`, editForm, { headers: getH() });
      setEditRecord(null);
      fetchData();
      flash('Record updated!');
    } catch (err) { alert(err.response?.data?.message || 'Error updating attendance'); }
  };

  /* ── toggle absent in bulk ── */
  const toggleAbsent = (id) => {
    setBulk(prev => {
      const next = new Set(prev.absentIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { ...prev, absentIds: next };
    });
  };

  const clearFilters = () => { setFilterClass(''); setFilterStu(''); setFilterStatus(''); };
  const hasFilters   = filterClass || filterStu || filterStatus;

  const modalBase = `rounded-3xl p-8 w-full shadow-2xl ${isDark ? 'bg-[#1a1f35] text-white border border-white/10' : 'bg-white text-gray-900 border border-gray-100'}`;

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Management</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monitor and record student presence class-wise.</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setAddMode('individual')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-sm'}`}>
            <UserCheck className="w-4 h-4" /> Individual
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setAddMode('bulk')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all">
            <Layers className="w-4 h-4" /> Bulk Class
          </motion.button>
        </div>
      </div>

      {/* ── Modern Filter Bar ── */}
      <div className={`rounded-2xl px-5 py-4 border flex flex-wrap items-center gap-3 transition-all ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
        {/* Label */}
        <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Filters</span>

        <div className="w-px h-5 bg-current opacity-10 shrink-0" />

        {/* Class filter */}
        <FilterSelect
          icon={Layers}
          value={filterClass}
          isDark={isDark}
          onChange={e => { setFilterClass(e.target.value); setFilterStu(''); }}
          options={<>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </>}
        />

        {/* Student filter */}
        <FilterSelect
          icon={Users}
          value={filterStu}
          isDark={isDark}
          onChange={e => setFilterStu(e.target.value)}
          options={<>
            <option value="">All Students</option>
            {(filterClass ? students.filter(s => s.course === filterClass) : students)
              .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </>}
        />

        {/* Status filter */}
        <FilterSelect
          icon={CheckCircle}
          value={filterStatus}
          isDark={isDark}
          onChange={e => setFilterStatus(e.target.value)}
          options={<>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </>}
        />

        {/* Date pill placeholder gap */}
        <div className="flex-1" />

        {/* Clear */}
        <AnimatePresence>
          {hasFilters && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearFilters}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}>
              <X className="w-3 h-3" /> Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: stats.total,   grad: 'from-blue-500 to-indigo-500',    icon: CalendarDays },
          { label: 'Present',       value: stats.present, grad: 'from-emerald-500 to-teal-500',   icon: CheckCircle  },
          { label: 'Absent',        value: stats.absent,  grad: 'from-red-500 to-rose-500',        icon: AlertCircle  },
          { label: 'Rate',          value: `${stats.pct}%`, grad: 'from-violet-500 to-purple-500', icon: Zap          },
        ].map(({ label, value, grad, icon: Icon }, i) => (
          <motion.div key={i} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}
            className={`rounded-2xl p-5 border shadow-sm transition-all ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1e2340] border-white/5' : 'bg-white border-gray-100'}`}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
            <p className={`text-3xl font-bold bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Attendance Logs
            <span className={`ml-2.5 text-xs font-semibold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
              {filtered.length}
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <tr>
                {['Student', 'Class', 'Date', 'Status', 'Remarks', ''].map(h => (
                  <th key={h} className={`px-6 py-3 text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent text-sm">
              {loading ? (
                <tr><td colSpan="6" className="py-12 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" /></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="6" className={`py-12 text-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No attendance records for these filters.
                </td></tr>
              ) : filtered.map(rec => {
                const course = students.find(s => s._id === rec.student?._id)?.course || '—';
                return (
                  <motion.tr key={rec._id} layout
                    className={`group transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/80'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                          {rec.student?.name?.charAt(0) || '?'}
                        </div>
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{rec.student?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{course}</span>
                    </td>
                    <td className={`px-6 py-4 font-medium text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(rec.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={rec.status} isDark={isDark} /></td>
                    <td className={`px-6 py-4 max-w-[140px] truncate text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{rec.remarks || '—'}</td>
                    <td className="px-6 py-4">
                      <motion.button whileHover={{ scale: 1.15 }} onClick={() => openEdit(rec)}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-indigo-500/20 text-gray-500 hover:text-indigo-400' : 'hover:bg-indigo-50 text-gray-400 hover:text-indigo-600'}`}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════ INDIVIDUAL ADD MODAL ══════════ */}
      <AnimatePresence>
        {addMode === 'individual' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={() => setAddMode(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className={`${modalBase} max-w-md w-full`} onMouseDown={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Individual Attendance</h2>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Record for one student</p>
                  </div>
                </div>
                <button onClick={() => setAddMode(null)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleAddIndividual} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class (optional filter)</label>
                  <select className={inputCls(isDark)} value={newAtt._classFilter}
                    onChange={e => setNewAtt({ ...newAtt, _classFilter: e.target.value, student: '' })}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student *</label>
                  <select required className={inputCls(isDark)} value={newAtt.student}
                    onChange={e => setNewAtt({ ...newAtt, student: e.target.value })}>
                    <option value="">Select Student</option>
                    {(newAtt._classFilter ? students.filter(s => s.course === newAtt._classFilter) : students)
                      .map(s => <option key={s._id} value={s._id}>{s.name}{s.course ? ` — ${s.course}` : ''}</option>)}
                  </select>
                </div>
                <ModernDatePicker isDark={isDark} label="Date *" value={newAtt.date}
                  onChange={v => setNewAtt({ ...newAtt, date: v })} />
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map(s => {
                      const c = S_COLOR[s];
                      const active = newAtt.status === s;
                      return (
                        <button key={s} type="button" onClick={() => setNewAtt({ ...newAtt, status: s })}
                          className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-150 ${active ? (isDark ? c.dark : c.light) : (isDark ? 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}`}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remarks</label>
                  <input type="text" placeholder="Optional note…" className={inputCls(isDark)} value={newAtt.remarks}
                    onChange={e => setNewAtt({ ...newAtt, remarks: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setAddMode(null)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all">
                    Save Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ BULK CLASS ATTENDANCE MODAL ══════════ */}
      <AnimatePresence>
        {addMode === 'bulk' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={() => setAddMode(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className={`${modalBase} max-w-lg w-full max-h-[90vh] flex flex-col`} onMouseDown={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Bulk Class Attendance</h2>
                    <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Mark absent students — rest are auto-Present</p>
                  </div>
                </div>
                <button onClick={() => setAddMode(null)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleBulkSubmit} className="flex flex-col gap-4 overflow-hidden flex-1">
                {/* Class + Date row */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class *</label>
                    <select required className={inputCls(isDark)} value={bulk.class}
                      onChange={e => setBulk({ ...bulk, class: e.target.value, absentIds: new Set() })}>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date *</label>
                    <input required type="date" className={inputCls(isDark)} value={bulk.date}
                      onChange={e => setBulk({ ...bulk, date: e.target.value })} />
                  </div>
                </div>

                {/* Info banner */}
                {bulk.class && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold shrink-0 ${isDark ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'}`}>
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>
                      <strong>{bulkClassStudents.length - bulk.absentIds.size}</strong> will be marked <strong>Present</strong> · <strong>{bulk.absentIds.size}</strong> marked <strong>Absent</strong>
                    </span>
                  </motion.div>
                )}

                {/* Student checklist */}
                {bulk.class ? (
                  <div className={`overflow-y-auto rounded-2xl border flex-1 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
                    <div className={`sticky top-0 px-4 py-2.5 flex items-center justify-between border-b text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-[#1a1f35] border-white/5 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                      <span>Student — tick if ABSENT</span>
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => setBulk(p => ({ ...p, absentIds: new Set(bulkClassStudents.map(s => s._id)) }))}
                          className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                          All Absent
                        </button>
                        <button type="button"
                          onClick={() => setBulk(p => ({ ...p, absentIds: new Set() }))}
                          className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                          All Present
                        </button>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {bulkClassStudents.map(s => {
                        const isAbsent = bulk.absentIds.has(s._id);
                        return (
                          <motion.label key={s._id} whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                              isAbsent
                                ? (isDark ? 'bg-red-500/10 border-red-500/25' : 'bg-red-50 border-red-200')
                                : (isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]' : 'bg-white border-gray-100 hover:border-gray-200')
                            }`}>
                            {/* Custom checkbox */}
                            <div onClick={() => toggleAbsent(s._id)}
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                isAbsent ? 'bg-red-500 border-red-500' : (isDark ? 'border-white/20 bg-transparent' : 'border-gray-300 bg-white')
                              }`}>
                              {isAbsent && <X className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${isAbsent ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600') : (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600')}`}>
                                {s.name?.charAt(0)}
                              </div>
                              <span className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.name}</span>
                            </div>
                            <span className={`text-xs font-bold shrink-0 ${isAbsent ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`}>
                              {isAbsent ? 'Absent' : 'Present'}
                            </span>
                          </motion.label>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={`flex-1 flex flex-col items-center justify-center rounded-2xl border py-10 ${isDark ? 'border-white/5 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
                    <Layers className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">Select a class to load students</p>
                  </div>
                )}

                {/* Remarks + Actions */}
                <div className="shrink-0 space-y-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remarks (applied to all)</label>
                    <input type="text" placeholder="e.g. Sports day" className={inputCls(isDark)} value={bulk.remarks}
                      onChange={e => setBulk({ ...bulk, remarks: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setAddMode(null)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      Cancel
                    </button>
                    <button type="submit" disabled={!bulk.class || !bulkClassStudents.length}
                      className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Save {bulkClassStudents.length} Records
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ EDIT MODAL ══════════ */}
      <AnimatePresence>
        {editRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={() => setEditRecord(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 24, stiffness: 300 }}
              className={`${modalBase} max-w-sm w-full`} onMouseDown={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold">Edit Record</h2>
                  <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{editRecord.student?.name}</p>
                </div>
                <button onClick={() => setEditRecord(null)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleEdit} className="space-y-4">
                <ModernDatePicker isDark={isDark} label="Date" value={editForm.date}
                  onChange={v => setEditForm({ ...editForm, date: v })} />
                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map(s => {
                      const c = S_COLOR[s];
                      const active = editForm.status === s;
                      return (
                        <button key={s} type="button" onClick={() => setEditForm({ ...editForm, status: s })}
                          className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-150 ${active ? (isDark ? c.dark : c.light) : (isDark ? 'border-white/10 text-gray-400 bg-white/5 hover:bg-white/10' : 'border-gray-200 text-gray-500 hover:bg-gray-50')}`}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remarks</label>
                  <input type="text" placeholder="Optional note…" className={inputCls(isDark)} value={editForm.remarks}
                    onChange={e => setEditForm({ ...editForm, remarks: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setEditRecord(null)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showSuccess.show && (
          <motion.div initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white pointer-events-none">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span className="font-bold text-sm">{showSuccess.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AdminAttendance;
