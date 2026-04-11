import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap, ShieldCheck, Users, CreditCard, CalendarCheck, BarChart3,
  BookOpen, ArrowRight, CheckCircle2, Sparkles, Sun, Moon, Star, Zap,
  Award, Bell, Globe, ChevronRight, Play, Menu, X
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Refs for GSAP
  const heroRef = useRef(null);
  const navRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubRef = useRef(null);
  const heroBtnsRef = useRef(null);
  const heroTagRef = useRef(null);
  const featuresRef = useRef(null);
  const featureCardsRef = useRef([]);
  const statsRef = useRef(null);
  const statsCardsRef = useRef([]);
  const ctaRef = useRef(null);
  const orbsRef = useRef([]);
  const floatingCardsRef = useRef([]);

  // toggleTheme comes from useTheme()

  // ===== GSAP ANIMATIONS =====
  useEffect(() => {
    const ctx = gsap.context(() => {

      // — Hero entrance timeline —
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo(heroTagRef.current, { y: 40, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 }, '-=0.3')
        .fromTo(heroTitleRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, '-=0.4')
        .fromTo(heroSubRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
        .fromTo(heroBtnsRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.3');

      // — Floating orbs parallax —
      orbsRef.current.forEach((orb, i) => {
        if (!orb) return;
        gsap.to(orb, {
          y: `${(i % 2 === 0 ? -1 : 1) * (30 + i * 10)}`,
          x: `${(i % 2 === 0 ? 1 : -1) * (20 + i * 5)}`,
          duration: 4 + i,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // — Floating dashboard cards —
      floatingCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 100, opacity: 0, rotateY: -15, rotateX: 10 },
          {
            y: 0, opacity: 1, rotateY: 0, rotateX: 0,
            duration: 1.2,
            delay: 0.8 + i * 0.2,
            ease: 'power3.out',
          }
        );
        // Continuous float
        gsap.to(card, {
          y: -12 + i * 4,
          duration: 3 + i * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5 + i * 0.3,
        });
      });

      // — Feature cards scroll trigger —
      featureCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 80, opacity: 0, scale: 0.9 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // — Stats counter animation —
      if (statsRef.current) {
        gsap.fromTo(statsRef.current,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      statsCardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.6,
            delay: i * 0.15,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

      // — CTA section —
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { y: 80, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.8, ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const features = [
    { icon: Users, title: 'Student Management', desc: 'Complete CRUD with profile uploads, real-time search, and role-based access control.', color: 'from-blue-500 to-cyan-400', bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50' },
    { icon: CreditCard, title: 'Fee Analytics', desc: 'Track payments, generate invoices, collection rates with interactive bar & pie charts.', color: 'from-emerald-500 to-teal-400', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    { icon: CalendarCheck, title: 'Attendance Tracking', desc: 'Daily presence monitoring with trend charts, automated student notifications.', color: 'from-purple-500 to-violet-400', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50' },
    { icon: BarChart3, title: 'Performance Graphs', desc: 'Recharts-powered academic analytics with monthly trends and GPA calculations.', color: 'from-orange-500 to-amber-400', bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50' },
    { icon: BookOpen, title: 'Class Scheduling', desc: 'Admin creates sessions, students see live schedules with room & time details.', color: 'from-pink-500 to-rose-400', bg: isDark ? 'bg-pink-500/10' : 'bg-pink-50' },
    { icon: Bell, title: 'Smart Notifications', desc: 'Real-time alerts for attendance, fees, announcements — auto-synced in seconds.', color: 'from-indigo-500 to-blue-400', bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50' },
  ];

  const stats = [
    { value: '500+', label: 'Students Managed', icon: Users },
    { value: '99.9%', label: 'System Uptime', icon: Zap },
    { value: '50K+', label: 'Fees Processed', icon: CreditCard },
    { value: '4.9★', label: 'User Rating', icon: Star },
  ];

  return (
    <div className={`min-h-screen font-sans overflow-hidden transition-all duration-700 ${isDark ? 'landing-bg-dark text-white' : 'landing-bg-light text-gray-900'}`}>

      {/* ===== ANIMATED MESH GRADIENT ORBS ===== */}
      <div ref={el => orbsRef.current[0] = el} className="mesh-orb w-[500px] h-[500px] top-[-10%] left-[-5%]"
        style={{ background: isDark ? 'radial-gradient(circle, #6366f1 0%, transparent 70%)' : 'radial-gradient(circle, #93c5fd 0%, transparent 70%)' }} />
      <div ref={el => orbsRef.current[1] = el} className="mesh-orb w-[400px] h-[400px] top-[20%] right-[-5%]"
        style={{ background: isDark ? 'radial-gradient(circle, #ec4899 0%, transparent 70%)' : 'radial-gradient(circle, #f9a8d4 0%, transparent 70%)' }} />
      <div ref={el => orbsRef.current[2] = el} className="mesh-orb w-[350px] h-[350px] top-[50%] left-[30%]"
        style={{ background: isDark ? 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' : 'radial-gradient(circle, #fde68a 0%, transparent 70%)' }} />
      <div ref={el => orbsRef.current[3] = el} className="mesh-orb w-[450px] h-[450px] bottom-[5%] right-[10%]"
        style={{ background: isDark ? 'radial-gradient(circle, #10b981 0%, transparent 70%)' : 'radial-gradient(circle, #6ee7b7 0%, transparent 70%)' }} />
      <div ref={el => orbsRef.current[4] = el} className="mesh-orb w-[300px] h-[300px] bottom-[30%] left-[5%]"
        style={{ background: isDark ? 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' : 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }} />

      {/* ===== NAVBAR ===== */}
      <nav ref={navRef} className={`relative z-50 px-6 md:px-16 py-5 backdrop-blur-xl border-b transition-all duration-500
        ${isDark ? 'border-white/5 bg-black/20 text-white' : 'border-gray-200/50 bg-white/60'}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500
              ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'}`}>
              <GraduationCap className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-bold text-lg tracking-tight">SchoolHub</span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 transition-colors hover:bg-white/10 rounded-xl">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => navigate('/admin-login')} className="px-4 py-2 text-sm font-semibold hover:text-indigo-500 transition-colors">Admin</button>
            <button onClick={() => navigate('/student-login')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all">Get Started</button>
          </div>

          <button className="md:hidden p-2 rounded-xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden mt-4 space-y-4 pb-4"
            >
              <div className="flex items-center justify-between px-2">
                <span className="text-sm font-semibold">Theme</span>
                <button onClick={toggleTheme} className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
              <button onClick={() => navigate('/admin-login')} className="w-full text-left px-2 py-3 text-sm font-semibold border-t border-white/5">Admin Login</button>
              <button onClick={() => navigate('/student-login')} className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg">Get Started</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section ref={heroRef} className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 min-h-[85vh]">



        {/* Title with animated gradient */}
        <h1 ref={heroTitleRef} className="max-w-5xl mx-auto mb-8">
          <span className={`block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] transition-colors duration-500
            ${isDark ? 'text-white' : 'text-gray-900'}`}>
            School Management
          </span>
          <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] gradient-text-animated mt-2">
            Reimagined
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={heroSubRef}
          className={`text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium transition-colors duration-500
            ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          A premium, fully dynamic dashboard for managing students, attendance, fees,
          classes & announcements — all synced in <span className="text-emerald-500 font-bold">real-time</span> from MongoDB.
        </p>

        {/* CTA buttons */}
        <div ref={heroBtnsRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button onClick={() => navigate('/student-login')}
            className="group px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 rounded-full text-sm font-bold text-white shadow-2xl shadow-purple-500/30 transition-all duration-300 flex items-center gap-3 hover:-translate-y-1 hover:shadow-purple-500/50 hover:scale-105">
            <Play className="w-4 h-4 fill-white" /> Enter Student Portal
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => navigate('/admin-login')}
            className={`px-8 py-4 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-3 backdrop-blur-xl hover:-translate-y-1 hover:scale-105
              ${isDark
                ? 'bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-xl shadow-white/5'
                : 'bg-white/80 border border-gray-200 hover:bg-white text-gray-700 shadow-xl shadow-gray-200/50'}`}>
            <ShieldCheck className="w-4 h-4" /> Admin Dashboard
          </button>
        </div>

        {/* Floating Preview Cards — Visual showcase */}
        <div className="relative max-w-4xl w-full h-[32rem] sm:h-56 mx-auto mt-10 md:mt-20">
          {/* Card 1 - Attendance */}
          <div ref={el => floatingCardsRef.current[0] = el}
            className={`absolute left-4 sm:left-0 top-32 sm:top-8 w-[280px] sm:w-64 p-6 rounded-[24px] shadow-2xl backdrop-blur-2xl transition-all duration-500 border z-10
              ${isDark ? 'bg-[#141928]/80 border-white/10 shadow-[0_0_40px_rgba(16,185,129,0.15)]' : 'bg-white/90 border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)]'}`}
            style={{ perspective: '1000px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CalendarCheck className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Attendance</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            <p className={`text-4xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>94.2%</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>School Average</p>
            <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-1.5 rounded-full relative" style={{ width: '94%' }}>
                 <div className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full shadow-md -mt-[3px]"></div>
              </div>
            </div>
          </div>

          {/* Card 2 - Fees */}
          <div ref={el => floatingCardsRef.current[1] = el}
            className={`absolute left-1/2 -translate-x-1/2 top-0 sm:-top-6 w-[300px] sm:w-72 p-6 rounded-[24px] shadow-2xl backdrop-blur-2xl transition-all duration-500 border z-20
              ${isDark ? 'bg-[#141928]/90 border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]' : 'bg-white/95 border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)]'}`}
            style={{ perspective: '1000px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</span>
              </div>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold flex items-center gap-1">
                 <ArrowRight className="w-3 h-3 -rotate-45" /> +12%
              </span>
            </div>
            <p className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>₹24,500</p>
            
            {/* Mini graph */}
            <div className="flex items-end gap-1.5 mt-5 h-8">
               {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                  <div key={i} className={`w-full rounded-t-sm ${i === 6 ? 'bg-purple-500' : (isDark ? 'bg-gray-800' : 'bg-gray-200')}`} style={{ height: `${h}%` }}></div>
               ))}
            </div>
          </div>

          {/* Card 3 - Students */}
          <div ref={el => floatingCardsRef.current[2] = el}
            className={`absolute right-4 sm:right-0 bottom-0 sm:top-8 w-[280px] sm:w-64 p-6 rounded-[24px] shadow-2xl backdrop-blur-2xl transition-all duration-500 border z-10
              ${isDark ? 'bg-[#141928]/80 border-white/10 shadow-[0_0_40px_rgba(236,72,153,0.15)]' : 'bg-white/90 border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.06)]'}`}
            style={{ perspective: '1000px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Students</span>
              </div>
            </div>
            <p className={`text-4xl font-black tracking-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>512</p>
            <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 rounded-xl p-2.5 border border-gray-100 dark:border-white/5">
               <div className="flex -space-x-2">
                 {['bg-blue-500', 'bg-pink-500', 'bg-amber-500'].map((c, i) => (
                   <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 ${isDark ? 'border-[#141928]' : 'border-white'} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                     {['A', 'B', 'C'][i]}
                   </div>
                 ))}
               </div>
               <span className={`text-xs font-bold pr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+42 New</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section ref={featuresRef} className="relative z-10 px-6 md:px-16 pb-32 pt-16">
        <div className="text-center mb-20">
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6
            ${isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-200/50'}`}>
            Features
          </span>
          <h2 className={`text-4xl md:text-5xl font-black tracking-tight mb-5 transition-colors duration-500
            ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Everything you need,<br />
            <span className="gradient-text-animated">built right in</span>
          </h2>
          <p className={`text-lg max-w-xl mx-auto font-medium transition-colors duration-500
            ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Production-level features, real API integrations, stunning charts & analytics — right out of the box.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                ref={el => featureCardsRef.current[i] = el}
                className={`group relative rounded-3xl p-8 transition-all duration-500 border cursor-default
                  ${isDark
                    ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] shadow-xl shadow-black/20'
                    : 'bg-white/70 border-gray-200/60 hover:bg-white hover:border-gray-300/80 shadow-lg shadow-gray-200/30 hover:shadow-xl'}`}
              >
                {/* Glow accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  ${isDark ? 'bg-gradient-to-bl ' + f.color.replace('from-', 'from-').replace('to-', 'to-') + ' opacity-[0.05]' : ''}`}
                  style={isDark ? { background: `linear-gradient(to bottom left, ${f.color.includes('blue') ? '#3b82f620' : f.color.includes('emerald') ? '#10b98120' : f.color.includes('purple') ? '#8b5cf620' : f.color.includes('orange') ? '#f59e0b20' : f.color.includes('pink') ? '#ec489920' : '#6366f120'}, transparent)` } : {}}></div>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className={`text-lg font-bold mb-3 transition-colors duration-500 ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section ref={statsRef} className="relative z-10 px-6 md:px-16 pb-32">
        <div className={`max-w-6xl mx-auto rounded-[32px] p-12 md:p-16 transition-all duration-500 backdrop-blur-xl border
          ${isDark
            ? 'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 border-white/5'
            : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-gray-200/50'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} ref={el => statsCardsRef.current[i] = el} className="text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className={`text-3xl md:text-4xl font-black tracking-tight mb-2 transition-colors duration-500
                    ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
                  <p className={`text-sm font-semibold transition-colors duration-500
                    ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <div ref={ctaRef}
          className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[32px] p-12 md:p-16 relative overflow-hidden shadow-2xl shadow-purple-600/20">

          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-tr-full pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-lg">
              <h2 className="text-3xl md:text-5xl font-black mb-5 text-white leading-tight">
                Ready to get<br />started?
              </h2>
              <p className="text-white/80 text-lg leading-relaxed font-medium mb-8">
                Join Heritage Institute's digital campus platform. Admin or student — your dashboard awaits with real-time data.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Real-time Sync', 'JWT Secured', 'Charts & Graphs', 'Role-Based', 'GSAP Animated'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-xs font-semibold text-white border border-white/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 shrink-0 w-full md:w-auto">
              <button onClick={() => navigate('/student-signup')}
                className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold shadow-2xl shadow-black/20 hover:bg-gray-50 hover:-translate-y-1 transition-all duration-300 text-center">
                Create Student Account
              </button>
              <button onClick={() => navigate('/admin-signup')}
                className="px-10 py-5 bg-white/10 border border-white/20 rounded-2xl font-bold text-white hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm text-center">
                Register as Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={`relative z-10 px-8 md:px-16 py-10 border-t transition-all duration-500
        ${isDark ? 'border-white/5' : 'border-gray-200/50'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <p className={`text-sm font-semibold transition-colors duration-500 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              © 2026 School Management System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
