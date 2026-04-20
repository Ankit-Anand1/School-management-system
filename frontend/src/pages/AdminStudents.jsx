import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Eye, Edit2, Trash2, Search, Users, BookOpen } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_URL as API } from '../config';



const AdminStudents = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]           = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterClass, setFilterClass]   = useState('');

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    fetchStudents();
    const interval = setInterval(fetchStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API}/students`, { headers: getHeaders() });
      setStudents(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/students/${id}`, { headers: getHeaders() });
      setDeleteConfirm(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  // Unique classes
  const classes = useMemo(
    () => [...new Set(students.map(s => s.course).filter(Boolean))].sort(),
    [students]
  );

  const filtered = students.filter(s => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || s.course === filterClass;
    return matchSearch && matchClass;
  });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Management</h1>
          <p className={`font-medium text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {students.length} student{students.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/admin/students/add')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10 shadow-white/5' : 'bg-primary-600 text-white shadow-primary-500/20 hover:bg-primary-700'}`}
        >
          <Plus className="w-4 h-4" /> Add Student
        </motion.button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className={`absolute left-4 top-3.5 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
        <input
          type="text"
          placeholder="Search by name, email, or course..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 ${isDark ? 'bg-[#141928] border-white/5 text-white placeholder-gray-600' : 'bg-white border-gray-200'}`}
        />
      </motion.div>

      {/* Class-wise Filter Pills */}
      {classes.length > 0 && (
        <motion.div variants={itemVariants} className={`rounded-[20px] p-4 border ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Filter by Class</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterClass('')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                !filterClass
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                  : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              All <span className="ml-1 opacity-70">({students.length})</span>
            </button>
            {classes.map(cls => {
              const count = students.filter(s => s.course === cls).length;
              return (
                <button key={cls}
                  onClick={() => setFilterClass(cls)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterClass === cls
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {cls} <span className="ml-1 opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`rounded-2xl p-5 border shadow-sm transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{students.length}</p>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Total Students</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-5 border shadow-sm transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {[...new Set(students.map(s => s.course).filter(Boolean))].length}
              </p>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Active Courses</p>
            </div>
          </div>
        </div>
        <div className={`rounded-2xl p-5 border shadow-sm transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-[#141928] to-[#1a1f35] border-white/5 shadow-black/20' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-500'}`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{filtered.length}</p>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Showing</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onMouseDown={() => setDeleteConfirm(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            onMouseDown={e => e.stopPropagation()}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Student?</h3>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className={`px-5 py-2.5 rounded-xl text-sm font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Table */}
      <motion.div variants={itemVariants} className={`rounded-[24px] shadow-sm border p-6 overflow-hidden ${isDark ? 'bg-[#141928] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Student</th>
                <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Course</th>
                <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</th>
                <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Joined</th>
                <th className={`pb-3 text-[10px] uppercase font-bold tracking-widest text-right ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="5" className="py-10 text-center">
                  <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className={`py-10 text-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {search ? 'No students match your search.' : 'No students registered yet. Click "Add Student" to get started.'}
                </td></tr>
              ) : filtered.map((student, idx) => (
                <motion.tr
                  key={student._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`border-b transition-colors group ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50/50'}`}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
                        {student.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                        <p className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                      {student.course || 'N/A'}
                    </span>
                  </td>
                  <td className={`py-4 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{student.phone || '—'}</td>
                  <td className={`py-4 font-medium text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(student.createdAt).toLocaleDateString()}</td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => navigate(`/admin/students/view/${student._id}`)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:text-blue-400 hover:bg-blue-900/30 text-gray-500' : 'hover:text-blue-600 hover:bg-blue-50 text-gray-400'}`}
                        title="View"
                      ><Eye className="w-4 h-4" /></motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => navigate(`/admin/students/edit/${student._id}`)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:text-primary-400 hover:bg-primary-900/30 text-gray-500' : 'hover:text-primary-600 hover:bg-primary-50 text-gray-400'}`}
                        title="Edit"
                      ><Edit2 className="w-4 h-4" /></motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setDeleteConfirm(student)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:text-red-400 hover:bg-red-900/30 text-gray-500' : 'hover:text-red-600 hover:bg-red-50 text-gray-400'}`}
                        title="Delete"
                      ><Trash2 className="w-4 h-4" /></motion.button>
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

export default AdminStudents;
