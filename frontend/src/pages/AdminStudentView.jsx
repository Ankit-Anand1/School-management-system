import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, User, Mail, Phone, MapPin, BookOpen, Calendar, Users2 } from 'lucide-react';
import axios from 'axios';

import { API_URL as API } from '../config';

const AdminStudentView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const headers = getHeaders();
      const [studentRes, attRes, feeRes] = await Promise.all([
        axios.get(`${API}/students/${id}`, { headers }),
        axios.get(`${API}/attendance?studentId=${id}`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${API}/fees`, { headers }).catch(() => ({ data: { data: [] } }))
      ]);
      setStudent(studentRes.data.data);
      setAttendance(attRes.data.data || []);
      // Filter fees for this student
      const allFees = feeRes.data.data || [];
      setFees(allFees.filter(f => f.student?._id === id || f.student === id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/students/${id}`, { headers: getHeaders() });
      navigate('/admin/students');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 font-medium">Student not found.</p>
        <button onClick={() => navigate('/admin/students')} className="mt-4 text-primary-600 font-bold text-sm">← Back to Students</button>
      </div>
    );
  }

  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const attPercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const totalPaid = fees.filter(f => f.status === 'Paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.status !== 'Paid').reduce((s, f) => s + f.amount, 0);

  const infoFields = [
    { icon: Mail, label: 'Email', value: student.email },
    { icon: Phone, label: 'Phone', value: student.phone || '—' },
    { icon: BookOpen, label: 'Course', value: student.course || '—' },
    { icon: Calendar, label: 'Batch', value: student.batch || '—' },
    { icon: MapPin, label: 'Address', value: student.address || '—' },
    { icon: Users2, label: 'Guardian', value: student.guardianName || '—' },
    { icon: Phone, label: 'Guardian Phone', value: student.guardianPhone || '—' },
    { icon: Calendar, label: 'Joined', value: new Date(student.createdAt).toLocaleDateString() },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <button onClick={() => navigate('/admin/students')} className="hover:text-primary-600 transition-colors">Students</button>
        <span>›</span>
        <span className="text-primary-600">{student.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/admin/students')}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Profile</h1>
            <p className="text-gray-500 text-sm font-medium">Detailed view of student information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/admin/students/edit/${id}`)}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary-700 flex items-center gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200 hover:bg-red-100 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </motion.button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onMouseDown={() => setShowDeleteModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center" onMouseDown={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-500" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student?</h3>
            <p className="text-sm text-gray-500 mb-6">This will permanently delete <strong>{student.name}</strong>.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full z-0"></div>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-4xl text-white font-bold shadow-xl mt-4 z-10">
            {student.name?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-4 z-10">{student.name}</h2>
          <p className="text-xs font-semibold text-gray-500 z-10">{student.email}</p>
          <span className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold z-10">{student.course || 'Student'}</span>

          {/* Quick Stats */}
          <div className="flex w-full gap-3 mt-6 z-10">
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 border border-gray-100">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Attendance</p>
              <p className="text-xl font-bold text-emerald-600">{attPercent}%</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-2xl p-3 border border-gray-100">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Fees Paid</p>
              <p className="text-xl font-bold text-blue-600">₹{totalPaid}</p>
            </div>
          </div>
          {totalPending > 0 && (
            <div className="mt-3 w-full bg-red-50 rounded-xl p-3 border border-red-100 z-10">
              <p className="text-xs font-bold text-red-600">⚠ Pending: ₹{totalPending}</p>
            </div>
          )}
        </div>

        {/* Information Grid */}
        <div className="lg:col-span-2 bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {infoFields.map((field, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                  <field.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{field.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{field.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Attendance ({attendance.length} records)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Date</th>
                <th className="pb-3 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Status</th>
                <th className="pb-3 text-[10px] uppercase font-bold text-gray-400 tracking-widest">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan="3" className="py-6 text-center text-gray-400">No attendance records</td></tr>
              ) : attendance.slice(0, 10).map(a => (
                <tr key={a._id} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-600">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      a.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                      a.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>{a.status}</span>
                  </td>
                  <td className="py-3 text-gray-500">{a.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStudentView;
