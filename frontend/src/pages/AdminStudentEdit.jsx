import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, User, Mail, BookOpen, MapPin, Users2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

import { API_URL as API } from '../config';

const AdminStudentEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', course: '', phone: '', address: '', guardianName: '', guardianPhone: '', fatherName: '', motherName: '', batch: ''
  });

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data.data;
      setForm({
        name: data.name || '',
        email: data.email || '',
        course: data.course || '',
        phone: data.phone || '',
        address: data.address || '',
        guardianName: data.guardianName || '',
        guardianPhone: data.guardianPhone || '',
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        batch: data.batch || ''
      });
    } catch (err) {
      setError('Failed to fetch student details.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/students/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Student updated successfully!');
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const inputClass = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
        <button onClick={() => navigate('/admin/students')} className="hover:text-primary-600 transition-colors">Students</button>
        <span>›</span>
        <span className="text-primary-600">Edit Student</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/students')}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Student</h1>
            <p className="text-gray-500 text-sm font-medium">Update student information</p>
          </div>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm font-semibold text-red-600">
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm font-semibold text-green-600">
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center"><User className="w-6 h-6" /></div>
            <div><h3 className="text-lg font-bold text-gray-900">Personal Information</h3><p className="text-sm text-gray-500">Student's identity details</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Full Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Email Address *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Phone Number</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
            <div><h3 className="text-lg font-bold text-gray-900">Academic Details</h3><p className="text-sm text-gray-500">Course and batch information</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Course / Class</label>
              <input type="text" name="course" value={form.course} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Batch / Year</label>
              <input type="text" name="batch" value={form.batch} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Guardian Info */}
        <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Users2 className="w-6 h-6" /></div>
            <div><h3 className="text-lg font-bold text-gray-900">Guardian Details</h3><p className="text-sm text-gray-500">Parent or guardian contact info</p></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Guardian Name</label>
              <input type="text" name="guardianName" value={form.guardianName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Guardian Phone</label>
              <input type="text" name="guardianPhone" value={form.guardianPhone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Father's Name</label>
              <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Mother's Name</label>
              <input type="text" name="motherName" value={form.motherName} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-2">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/students')} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 hover:bg-primary-700 flex items-center gap-2 disabled:opacity-70"
          >
            <ShieldCheck className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminStudentEdit;
