import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Plus, Eye, Edit2, X, ChevronDown, BookOpen, Users, Layers, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const STATUS_COLORS = {
  Paid:    { dark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', light: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Pending: { dark: 'bg-amber-500/15 text-amber-400 border-amber-500/30',     light: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500'   },
  Overdue: { dark: 'bg-red-500/15 text-red-400 border-red-500/30',           light: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500'     },
};

/* Modern filter chip */
const FilterSelect = ({ icon: Icon, value, onChange, options, isDark }) => (
  <div className="relative">
    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border cursor-pointer transition-all duration-200 ${
      value
        ? isDark ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-indigo-50 border-indigo-300 shadow-md shadow-indigo-100'
        : isDark ? 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
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
  </div>
);

const inputCls = (isDark) =>
  `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
  }`;

const AdminFees = () => {
  const { isDark } = useTheme();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal]     = useState(false);
  const [viewFee, setViewFee]               = useState(null);
  const [editFee, setEditFee]               = useState(null);
  const [editForm, setEditForm]             = useState({});

  // Filters
  const [filterStudentId, setFilterStudentId] = useState('');
  const [filterClass, setFilterClass]         = useState('');
  const [filterStatus, setFilterStatus]       = useState('');

  const [newFee, setNewFee] = useState({ student: '', amount: '', type: '', status: 'Pending' });

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, []);

  const fetchData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/fees`,     { headers: getHeaders() }),
        axios.get(`${API_URL}/students`, { headers: getHeaders() }),
      ]);
      setFees(feesRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Unique classes derived from students
  const classes = useMemo(
    () => [...new Set(students.map(s => s.course).filter(Boolean))].sort(),
    [students]
  );

  // Students in selected class
  const classStudentIds = useMemo(() => {
    if (!filterClass) return null;
    return new Set(students.filter(s => s.course === filterClass).map(s => s._id));
  }, [filterClass, students]);

  const displayedFees = useMemo(() => {
    let list = fees;
    if (filterClass && classStudentIds) {
      list = list.filter(f => classStudentIds.has(f.student?._id));
    }
    if (filterStudentId) {
      list = list.filter(f => f.student?._id === filterStudentId);
    }
    if (filterStatus) {
      list = list.filter(f => f.status === filterStatus);
    }
    return list;
  }, [fees, filterClass, classStudentIds, filterStudentId, filterStatus]);

  // Stats
  const totalAll     = displayedFees.reduce((a, f) => a + f.amount, 0);
  const totalPaid    = displayedFees.filter(f => f.status === 'Paid').reduce((a, f) => a + f.amount, 0);
  const totalPending = displayedFees.filter(f => f.status !== 'Paid').reduce((a, f) => a + f.amount, 0);
  const collectionRate = totalAll > 0 ? Math.round((totalPaid / totalAll) * 100) : 0;

  // Add fee
  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/fees`, newFee, { headers: getHeaders() });
      setShowAddModal(false);
      setNewFee({ student: '', amount: '', type: '', status: 'Pending' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding fee');
    }
  };

  // Edit fee
  const openEdit = (fee) => {
    setEditFee(fee);
    setEditForm({ amount: fee.amount, type: fee.type, status: fee.status });
  };
  const handleEditFee = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/fees/${editFee._id}`, editForm, { headers: getHeaders() });
      setEditFee(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating fee');
    }
  };

  const StatusBadge = ({ status }) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isDark ? c.dark : c.light}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {status}
      </span>
    );
  };

  const modalBase = `rounded-2xl p-8 w-full shadow-2xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fees Management</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Review student financials and process incoming payments.</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
          <Plus className="w-4 h-4" /> Add Fee Invoice
        </motion.button>
      </div>

      {/* ── Modern Filter Bar ── */}
      <div className={`rounded-2xl px-5 py-4 border flex flex-wrap items-center gap-3 transition-all ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
        <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Filters</span>
        <div className="w-px h-5 bg-current opacity-10 shrink-0" />

        <FilterSelect icon={Layers} value={filterClass} isDark={isDark}
          onChange={e => { setFilterClass(e.target.value); setFilterStudentId(''); }}
          options={<>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </>} />

        <FilterSelect icon={Users} value={filterStudentId} isDark={isDark}
          onChange={e => setFilterStudentId(e.target.value)}
          options={<>
            <option value="">All Students</option>
            {(filterClass ? students.filter(s => s.course === filterClass) : students)
              .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </>} />

        <FilterSelect icon={CheckCircle} value={filterStatus} isDark={isDark}
          onChange={e => setFilterStatus(e.target.value)}
          options={<>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </>} />

        <div className="flex-1" />
        <AnimatePresence>
          {(filterClass || filterStudentId || filterStatus) && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => { setFilterClass(''); setFilterStudentId(''); setFilterStatus(''); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${isDark ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}>
              <X className="w-3 h-3" /> Clear
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Balance Due', value: `₹${totalPending.toLocaleString()}`, sub: `${displayedFees.filter(f => f.status !== 'Paid').length} invoices` },
          { label: 'Collection Rate', value: `${collectionRate}%`, bar: true },
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, sub: `${displayedFees.filter(f => f.status === 'Paid').length} invoices` },
        ].map((s, i) => (
          <div key={i} className={`rounded-[24px] p-6 shadow-xl border h-40 flex flex-col justify-center ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5' : 'bg-gradient-to-br from-white to-gray-50/80 border-white shadow-gray-200/50'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</h3>
            <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</span>
            {s.sub && <p className={`text-xs mt-1 font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.sub}</p>}
            {s.bar && (
              <div className={`w-full rounded-full h-2 mt-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${collectionRate}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className={`rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Fee Transactions <span className={`ml-2 text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({displayedFees.length})</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                {['Student', 'Class', 'Date', 'Category', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="7" className="py-8 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" /></div></td></tr>
              ) : displayedFees.length === 0 ? (
                <tr><td colSpan="7" className={`py-8 text-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No fee records match your filters.</td></tr>
              ) : displayedFees.map(tx => {
                const studentCourse = students.find(s => s._id === tx.student?._id)?.course || tx.student?.course || '—';
                return (
                  <tr key={tx._id} className={`border-b transition-colors group ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          {tx.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tx.student?.name || 'Unknown'}</p>
                          <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{tx.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        {studentCourse}
                      </span>
                    </td>
                    <td className={`py-4 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>{tx.type}</span>
                    </td>
                    <td className={`py-4 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{tx.amount.toFixed(2)}</td>
                    <td className="py-4"><StatusBadge status={tx.status} /></td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <motion.button whileHover={{ scale: 1.15 }} onClick={() => setViewFee(tx)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-blue-900/30 text-gray-400 hover:text-blue-400' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'}`} title="View Details">
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.15 }} onClick={() => openEdit(tx)}
                          className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-primary-900/30 text-gray-400 hover:text-primary-400' : 'hover:bg-primary-50 text-gray-400 hover:text-primary-600'}`} title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════ ADD FEE MODAL ══════════ */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onMouseDown={() => setShowAddModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`${modalBase} max-w-md`} onMouseDown={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add Fee Invoice</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddFee} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Class</label>
                  <select className={inputCls(isDark)} value={newFee._classFilter || ''}
                    onChange={e => setNewFee({ ...newFee, _classFilter: e.target.value, student: '' })}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student</label>
                  <select required className={inputCls(isDark)} value={newFee.student} onChange={e => setNewFee({ ...newFee, student: e.target.value })}>
                    <option value="">Select Student</option>
                    {(newFee._classFilter ? students.filter(s => s.course === newFee._classFilter) : students)
                      .map(s => <option key={s._id} value={s._id}>{s.name} — {s.course}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount (₹)</label>
                  <input required type="number" className={inputCls(isDark)} value={newFee.amount} onChange={e => setNewFee({ ...newFee, amount: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category / Type</label>
                  <input required type="text" placeholder="e.g. Tuition Fees" className={inputCls(isDark)} value={newFee.type} onChange={e => setNewFee({ ...newFee, type: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <select required className={inputCls(isDark)} value={newFee.status} onChange={e => setNewFee({ ...newFee, status: e.target.value })}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700">Create Invoice</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ VIEW DETAIL MODAL ══════════ */}
      <AnimatePresence>
        {viewFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onMouseDown={() => setViewFee(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`${modalBase} max-w-sm`} onMouseDown={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Fee Details</h2>
                <button onClick={() => setViewFee(null)}><X className="w-5 h-5" /></button>
              </div>
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-2">
                  {viewFee.student?.name?.charAt(0) || '?'}
                </div>
                <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewFee.student?.name}</p>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{viewFee.student?.email}</p>
              </div>
              {/* Detail rows */}
              {[
                { label: 'Class / Course', value: students.find(s => s._id === viewFee.student?._id)?.course || '—' },
                { label: 'Fee Type',       value: viewFee.type },
                { label: 'Amount',         value: `₹${viewFee.amount.toFixed(2)}` },
                { label: 'Date',           value: new Date(viewFee.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Transaction ID', value: viewFee.transactionId || '—' },
              ].map(({ label, value }) => (
                <div key={label} className={`flex justify-between py-3 border-b text-sm ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 text-sm items-center">
                <span className={`font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
                <StatusBadge status={viewFee.status} />
              </div>
              <button onClick={() => { setViewFee(null); openEdit(viewFee); }}
                className="mt-4 w-full py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit this Record
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ EDIT FEE MODAL ══════════ */}
      <AnimatePresence>
        {editFee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onMouseDown={() => setEditFee(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`${modalBase} max-w-sm`} onMouseDown={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Edit Fee Record</h2>
                <button onClick={() => setEditFee(null)}><X className="w-5 h-5" /></button>
              </div>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Editing fee for <strong>{editFee.student?.name}</strong>
              </p>
              <form onSubmit={handleEditFee} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount (₹)</label>
                  <input required type="number" className={inputCls(isDark)} value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category / Type</label>
                  <input required type="text" className={inputCls(isDark)} value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <select required className={inputCls(isDark)} value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setEditFee(null)}
                    className={`px-4 py-2 rounded-xl font-bold text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AdminFees;
