import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  CalendarCheck,
  UserCircle,
  LogOut,
  ShieldCheck,
  Bell,
  Settings,
  X,
  CheckCheck,
  Sun,
  Moon,
  Users,
  Menu
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5001/api';

const DashboardLayout = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout: authLogout } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  const navItems = role === 'student' ? [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Fees', path: '/student/fees', icon: CreditCard },
    { name: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Profile', path: '/student/profile', icon: UserCircle },
  ] : [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Fees', path: '/admin/fees', icon: CreditCard },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Profile', path: '/admin/profile', icon: UserCircle },
  ];

  // Fetch notifications with polling
  useEffect(() => {
    const fetchNotif = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data.data || []);
        setNotifCount(res.data.unreadCount || 0);
      } catch (e) { /* silent */ }
    };
    fetchNotif();
    const interval = setInterval(fetchNotif, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { /* silent */ }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes('fee') || q.includes('pay')) navigate(`/${role}/fees`);
      else if (q.includes('attend') || q.includes('present')) navigate(`/${role}/attendance`);
      else if (q.includes('profile') || q.includes('password')) navigate(`/${role}/profile`);
      else navigate(`/${role}/dashboard`);
      setSearchQuery('');
    }
  };

  // Use AuthContext user name instead of localStorage
  const userName = user?.name || 'User';

  const sidebarVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } }
  };

  const navItemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: (i) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-500 overflow-x-hidden ${isDark ? 'bg-[#0a0e1a] text-gray-100' : 'bg-[#f8f9ff] text-[#1e293b]'}`}>
      
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 768 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`flex flex-col shadow-xl z-50 shrink-0 transition-all duration-500 border-r overflow-hidden
        ${isDark ? 'bg-[#0f1322] border-white/5' : 'bg-white border-gray-100'}
        fixed inset-y-0 left-0 md:relative h-screen
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:w-20 md:translate-x-0'}`}
      >
        <div className={`p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-10 h-10 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 cursor-pointer"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="text-white font-bold text-xl">
                {role === 'student' ? <UserCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </span>
            </motion.div>
            {isSidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                <h1 className={`font-bold text-lg leading-tight transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>SchoolHub</h1>
                <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Premium Dashboard</p>
              </motion.div>
            )}
            {isSidebarOpen && (
              <button 
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-hidden">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center'} py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? isDark
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-primary-50 text-primary-600'
                        : isDark
                          ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  title={!isSidebarOpen ? item.name : ''}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        <div className={`p-4 space-y-3`}>
          {/* Theme toggle in sidebar */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleTheme}
            title={!isSidebarOpen ? "Toggle Theme" : ""}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center'} py-3 text-sm font-medium rounded-xl transition-all duration-300
              ${isDark ? 'text-gray-400 hover:text-amber-400 hover:bg-amber-400/10' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}>
            {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : ""}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center'} py-3 text-sm font-medium rounded-xl transition-all duration-300
              ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">Logout</span>}
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <header className={`h-16 md:h-20 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-8 z-[100] sticky top-0 shrink-0 transition-colors duration-500
          ${isDark ? 'bg-[#0a0e1a]/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
               className={`md:hidden p-2 rounded-xl transition-colors ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'}`}
               onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-full md:w-64 lg:w-96">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className={`w-full rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-300 pl-10
                  ${isDark
                    ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500/30 focus:bg-white/10'
                    : 'bg-gray-50 border border-gray-100 text-gray-800 placeholder-gray-400 focus:ring-primary-500/20 focus:bg-white'
                  }`}
              />
              <svg className={`w-4 h-4 absolute left-4 top-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 relative transition-colors duration-300 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setShowNotifPanel(!showNotifPanel)}
              >
                <Bell className="w-5 h-5" />
                {notifCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white text-[10px] text-white font-bold flex items-center justify-center leading-none"
                  >
                    {notifCount > 9 ? '9+' : notifCount}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifPanel && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border z-50 overflow-hidden transition-colors duration-500
                    ${isDark ? 'bg-[#141928] border-white/10' : 'bg-white border-gray-100'}`}
                  >
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h4>
                      <div className="flex gap-2">
                        {notifCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotifPanel(false)} className={`${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-auto">
                      {notifications.length === 0 ? (
                        <p className={`p-6 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet.</p>
                      ) : (
                        notifications.map((n, idx) => (
                          <motion.div
                            key={n._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`px-4 py-3 border-b transition-colors
                            ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50'}
                            ${!n.read ? (isDark ? 'bg-indigo-500/5' : 'bg-primary-50/50') : ''}`}
                          >
                            <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{n.message}</p>
                            <p className={`text-[10px] mt-1 font-semibold uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ duration: 0.3 }}
              className={`p-2 transition-colors duration-300 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => navigate(`/${role}/profile`)}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <div className={`h-6 w-px mx-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-colors duration-300
                ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
              onClick={() => navigate(`/${role}/profile`)}
            >
              <div className="text-right hidden md:block">
                <p className={`text-sm font-semibold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</p>
                <p className={`text-[11px] font-medium uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {role === 'student' ? 'Student' : 'Administrator'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
            </motion.div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          {/* Ambient blobs */}
          <div className={`absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 z-0 pointer-events-none
            ${isDark ? 'bg-indigo-900/40' : 'bg-primary-50'}`}></div>
          <div className={`absolute top-40 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 z-0 pointer-events-none
            ${isDark ? 'bg-purple-900/30' : 'bg-pink-50'}`}></div>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 max-w-6xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
