import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const AdminFees = () => {
  const { isDark } = useTheme();
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFee, setNewFee] = useState({ student: '', amount: '', type: '', status: 'Pending' });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [feesRes, studentsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/fees', { headers }),
        axios.get('http://localhost:5001/api/students', { headers })
      ]);
      setFees(feesRes.data.data);
      setStudents(studentsRes.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/fees', newFee, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddModal(false);
      fetchData(); // Refresh
      setNewFee({ student: '', amount: '', type: '', status: 'Pending' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding fee');
    }
  };

  const [filterStudentId, setFilterStudentId] = useState('');
  const displayedFees = filterStudentId ? fees.filter(f => f.student?._id === filterStudentId) : fees;
  const totalBalanceDue = displayedFees.filter(f => f.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalAll = displayedFees.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidDisp = displayedFees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const collectionRate = totalAll > 0 ? Math.round((totalPaidDisp / totalAll) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fees Management</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Review student financials and process incoming payments.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-white/5' : 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700'}`}
        >
          <Plus className="w-4 h-4" /> Add Fee Invoice
        </motion.button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl p-8 w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Fee Invoice</h2>
            <form onSubmit={handleAddFee} className="space-y-4">
               <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student</label>
                  <select required className={`w-full border rounded-xl px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} value={newFee.student} onChange={e => setNewFee({...newFee, student: e.target.value})}>
                     <option value="">Select Student</option>
                     {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                  </select>
               </div>
               <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount (₹)</label>
                  <input required type="number" className={`w-full border rounded-xl px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} value={newFee.amount} onChange={e => setNewFee({...newFee, amount: e.target.value})} />
               </div>
               <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category / Type</label>
                  <input required type="text" placeholder="e.g. Tuition Fees" className={`w-full border rounded-xl px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} value={newFee.type} onChange={e => setNewFee({...newFee, type: e.target.value})} />
               </div>
               <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <select required className={`w-full border rounded-xl px-4 py-2 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`} value={newFee.status} onChange={e => setNewFee({...newFee, status: e.target.value})}>
                     <option value="Paid">Paid</option>
                     <option value="Pending">Pending</option>
                     <option value="Overdue">Overdue</option>
                  </select>
               </div>
               <div className="flex justify-end gap-2 mt-6">
                 <button type="button" onClick={() => setShowAddModal(false)} className={`px-4 py-2 rounded-xl font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'text-gray-500 bg-gray-100'}`}>Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-xl font-bold">Create Invoice</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-[24px] p-6 shadow-xl border relative overflow-hidden h-44 flex flex-col justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-gradient-to-br from-white to-gray-50/80 border-white shadow-gray-200/50'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Balance Due</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalBalanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
        </div>

        <div className={`rounded-[24px] p-6 shadow-xl border relative overflow-hidden h-44 flex flex-col justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-gradient-to-br from-white to-gray-50/80 border-white shadow-gray-200/50'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Collection Rate</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{collectionRate}%</span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${collectionRate}%` }}></div>
            </div>
        </div>
      </div>

      <div className={`rounded-[24px] shadow-sm border p-6 mt-8 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
         <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Transaction History</h3>
            <select 
               className={`text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${isDark ? 'bg-white/5 border border-white/5 text-gray-300' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}
               value={filterStudentId}
               onChange={(e) => setFilterStudentId(e.target.value)}
            >
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
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Category</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Amount</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="5" className="py-4 text-center">Loading...</td></tr>
                  ) : displayedFees.length === 0 ? (
                    <tr><td colSpan="5" className={`py-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No transactions found.</td></tr>
                  ) : displayedFees.map((tx) => (
                     <tr key={tx._id} className={`border-b transition-colors py-4 ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                        <td className="py-5">
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                                 {tx.student?.name?.charAt(0) || '?'}
                              </div>
                              <div>
                                 <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tx.student?.name || 'Unknown'}</p>
                                 <p className={`text-[10px] font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tx.student?.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className={`py-5 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="py-5">
                           <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                              {tx.type}
                           </span>
                        </td>
                        <td className={`py-5 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{tx.amount.toFixed(2)}</td>
                        <td className="py-5">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center w-max gap-1.5 ${tx.status === 'Paid' ? (isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600')}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Paid' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                              {tx.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </motion.div>
  );
};

export default AdminFees;
