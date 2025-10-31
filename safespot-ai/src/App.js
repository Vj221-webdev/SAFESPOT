import AdminDashboard from './components/AdminDashboard';
import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Auth from './components/Auth';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
import ViewReports from './components/ViewReports';
import MoreInfo from './components/MoreInfo';
import HelpSupport from './components/HelpSupport';
import Settings from './components/Settings';
import NotificationCenter from "./components/NotificationCenter";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('form');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Load isAdmin from Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          currentUser.isAdmin = userData.isAdmin || false;
          currentUser.role = userData.role || 'user';
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleReportSubmitted = () => {
    setShowSuccessToast(true);
    setActiveTab('list');
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('form');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateTo = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            {/* Animated Logo */}
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl animate-pulse-slow">
              <svg
                className="w-14 h-14 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>

            {/* Spinner */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-600 rounded-full animate-spin animation-delay-300"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-2 animate-fade-in">
            SafeSpot
          </h2>
          <p className="text-gray-600 text-lg font-semibold animate-fade-in animation-delay-200">
            Loading your dashboard...
          </p>
          
          {/* Loading dots */}
          <div className="flex gap-2 justify-center mt-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce animation-delay-150"></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce animation-delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/90 shadow-lg sticky top-0 z-50 border-b border-gray-200/50 transition-all duration-300">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 cursor-pointer">
                    <svg
                      className="w-7 h-7 text-white transform group-hover:scale-110 transition-transform"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                    SafeSpot
                  </h1>
                  <p className="text-sm text-gray-600 font-semibold">
                    Community Safety Reporter
                  </p>
                </div>
              </div>

              {/* Mobile User Avatar */}
              <div className="md:hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg ring-2 ring-white transform hover:scale-110 transition-transform cursor-pointer">
                  <span className="text-white font-bold text-sm">
                    {user.displayName?.charAt(0) ||
                      user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Menu & Tabs */}
            <div className="flex items-center gap-4">
              {/* Navigation Tabs */}
              <nav className="flex gap-2 bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-inner">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'form'
                      ? 'bg-white text-gray-900 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Report</span>
                </button>
                <button
                  onClick={() => setActiveTab('db')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                    activeTab === 'db'
                      ? 'bg-white text-gray-900 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </nav>

              {/* Desktop User Menu */}
              <div className="hidden md:flex items-center gap-3 pl-4 border-l-2 border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 font-medium truncate max-w-[150px]">
                    {user.email}
                  </p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg ring-2 ring-white transform group-hover:scale-110 transition-all duration-300 cursor-pointer">
                    <span className="text-white font-bold">
                      {user.displayName?.charAt(0) ||
                        user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 🔔 NOTIFICATION BELL - ADDED HERE! */}
                <NotificationCenter user={user} />

                {/* Hamburger Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    aria-label="Open menu"
                    onClick={() => setMenuOpen((s) => !s)}
                    className={`p-2.5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 transform hover:scale-110 transition-all duration-300 shadow-lg ${
                      menuOpen ? 'scale-110 rotate-90' : ''
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden animate-slide-down">
                      <div className="p-2 flex flex-col gap-1">
                        <button
                          onClick={() => navigateTo('list')}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center gap-3 group"
                        >
                          <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Past Reports
                        </button>
                        <button
                          onClick={() => navigateTo('info')}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center gap-3 group"
                        >
                          <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          More Information
                        </button>
                        <button
                          onClick={() => navigateTo('help')}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center gap-3 group"
                        >
                          <svg className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Help & Support
                        </button>
                        <button
                          onClick={() => navigateTo('settings')}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center gap-3 group"
                        >
                          <svg className="w-5 h-5 text-gray-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Settings
                        </button>
                        {user?.isAdmin && (
                          <button
                            onClick={() => navigateTo('admin')}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center gap-3 group"
                          >
                            <svg className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Dashboard
                          </button>
                        )}
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full bg-gradient-to-r from-red-50 to-pink-50 text-left px-4 py-3 rounded-xl hover:from-red-100 hover:to-pink-100 font-bold text-red-600 transition-all duration-200 flex items-center gap-3 group"
                          >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-24 right-4 z-50 max-w-md animate-slide-in-right">
          <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl p-4 border-l-4 border-green-500 transform hover:scale-105 transition-transform">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-black text-gray-900 mb-1 flex items-center gap-2">
                  Report Submitted!
                  <span className="text-lg">🎉</span>
                </h4>
                <p className="text-sm text-gray-600 font-medium">
                  Your community issue has been logged successfully.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1 transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full flex-1">
        <div className="w-full">
          {activeTab === 'form' && <ReportForm onReportSubmitted={handleReportSubmitted} user={user} />}
          {activeTab === 'db' && <ReportList user={user} />}
          {activeTab === 'list' && <ViewReports user={user} />}
          {activeTab === 'info' && <MoreInfo user={user} />}
          {activeTab === 'help' && <HelpSupport user={user} />}
          {activeTab === 'settings' && <Settings user={user} />}
          {activeTab === 'admin' && <AdminDashboard user={user} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-white/10 relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div className="group">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-black">SafeSpot</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                A community-driven safety reporting platform with secure authentication and real-time updates.
              </p>
            </div>

            {/* Important Notice */}
            <div>
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Emergency Notice
              </h3>
              <div className="bg-gradient-to-br from-red-900/40 to-red-800/30 border border-red-700/50 rounded-xl p-4 backdrop-blur-sm hover:border-red-600/70 transition-colors">
                <p className="text-red-200 text-sm font-bold mb-1 flex items-center gap-2">
                  <span className="text-lg">🚨</span>
                  For Emergencies: Call 911
                </p>
                <p className="text-red-300 text-xs font-medium">SafeSpot is for non-emergency community issues only.</p>
              </div>
            </div>

            {/* Project Info */}
            <div>
              <h3 className="text-lg font-black mb-4">Project Info</h3>
              <div className="space-y-3">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 hover:bg-white/10 transition-colors">
                  <p className="text-gray-300 text-sm font-medium">Sprint 1: Authentication & Reporting</p>
                  <p className="text-gray-500 text-xs font-bold mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    React
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Firebase
                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                    Tailwind
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 text-sm font-semibold">Live & Secure</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-500 text-sm font-medium">
              &copy; 2025 SafeSpot | Class Project | Protected by Firebase Authentication
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;