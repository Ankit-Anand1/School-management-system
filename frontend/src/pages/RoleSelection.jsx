import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ShieldCheck, User } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 bg-gradient-to-br from-[#0F0C29] via-[#201A4A] to-[#150e3a] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      
      <div className="flex flex-col items-center mb-12 z-10">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg mb-6">
          <GraduationCap className="text-primary-600 w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">School Management System</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase font-semibold">Please select your portal</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 z-10"
      >
        <button 
          onClick={() => navigate('/admin-login')}
          className="group relative bg-[#19153a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden hover:border-purple-500/50 transition-all text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-sm border border-purple-500/30">
               <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Admin Portal</h2>
          <p className="text-gray-400 text-sm relative z-10">Manage students, fees, attendance, and generate reports.</p>
        </button>

        <button 
          onClick={() => navigate('/student-login')}
          className="group relative bg-[#19153a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden hover:border-blue-500/50 transition-all text-left"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-sm border border-blue-500/30">
               <User className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Student Portal</h2>
          <p className="text-gray-400 text-sm relative z-10">Track your attendance, manage fee payments, and view profile.</p>
        </button>
      </motion.div>
    </div>
  );
};

export default RoleSelection;
