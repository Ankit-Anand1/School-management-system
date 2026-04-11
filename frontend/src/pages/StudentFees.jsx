import React, { useState, useEffect } from 'react';
import { CreditCard, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const StudentFees = () => {
  const { isDark } = useTheme();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
    const interval = setInterval(fetchFees, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchFees = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/fees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = fees.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = fees.filter(f => f.status !== 'Paid').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>My Financials</h1>
          <p className={`font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>View and manage your fee payments.</p>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-[24px] p-6 shadow-sm border relative overflow-hidden flex flex-col justify-center ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Paid</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalPaid.toFixed(2)}</span>
            </div>
        </div>

        <div className={`rounded-[24px] p-6 shadow-sm border relative overflow-hidden flex flex-col justify-center ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-[10px] uppercase font-bold tracking-widest mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Current Balance Due</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{totalPending.toFixed(2)}</span>
            </div>
        </div>
      </div>

      <div className={`rounded-[24px] shadow-sm border p-6 ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
         <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment History</h3>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Date</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Description</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Transaction ID</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Amount</th>
                     <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</th>
                  </tr>
               </thead>
               <tbody className="text-sm">
                  {loading ? (
                    <tr><td colSpan="5" className={`py-5 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading...</td></tr>
                  ) : fees.length === 0 ? (
                    <tr><td colSpan="5" className={`py-5 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No fee records found.</td></tr>
                  ) : fees.map((tx) => (
                     <tr key={tx._id} className={`border-b transition-colors py-4 ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50/50'}`}>
                        <td className={`py-5 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{new Date(tx.date).toLocaleDateString()}</td>
                        <td className={`py-5 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tx.type}</td>
                        <td className={`py-5 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tx.transactionId || 'N/A'}</td>
                        <td className={`py-5 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₹{tx.amount.toFixed(2)}</td>
                        <td className="py-5">
                           <span className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase flex items-center w-max gap-1.5 ${tx.status === 'Paid' ? (isDark ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-50 text-red-600')}`}>
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

export default StudentFees;
