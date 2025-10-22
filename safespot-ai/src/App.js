import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './components/Auth';
import ReportForm from './components/ReportForm';
import ReportList from './components/ReportList';
// Pages
import ManageReports from './components/ManageReports';
import MoreInfo from './components/MoreInfo';
import HelpSupport from './components/HelpSupport';
import Settings from './components/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('form');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Close menu if clicked outside
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-gray-300 rounded-full animate-spin mx-auto"
              style={{ animationDelay: '0.15s' }}
            ></div>
          </div>
          <p className="text-gray-800 text-xl font-bold">Loading SafeSpot...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/95 shadow-2xl sticky top-0 z-50 border-b border-white/20">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group hover:scale-110 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    SafeSpot
                  </h1>
                  <p className="text-sm text-gray-600 font-semibold">
                    Community Safety Reporter
                  </p>
                </div>
              </div>

              {/* Mobile User Avatar */}
              <div className="md:hidden">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
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
              <nav className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'form'
                      ? 'bg-white text-gray-900 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="hidden sm:inline">Report</span>
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
                    activeTab === 'list'
                      ? 'bg-white text-gray-900 shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">
                    {user.displayName?.charAt(0) ||
                      user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Hamburger Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    aria-label="Open menu"
                    onClick={() => setMenuOpen((s) => !s)}
                    className="p-2 rounded-xl bg-black text-white hover:scale-105 transition-transform"
                  >
                    <svg
                      className="w-5 h-5"
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
                      <div className="p-2 flex flex-col gap-1">
                        <button
                          onClick={() => navigateTo('list')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 font-semibold"
                        >
                          View Past Reports
                        </button>
                        <button
                          onClick={() => navigateTo('manage')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 font-semibold"
                        >
                          Manage Reports
                        </button>
                        <button
                          onClick={() => navigateTo('info')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 font-semibold"
                        >
                          More Information
                        </button>
                        <button
                          onClick={() => navigateTo('help')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 font-semibold"
                        >
                          Help & Support
                        </button>
                        <button
                          onClick={() => navigateTo('settings')}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 font-semibold"
                        >
                          Settings
                        </button>
                        <div className="border-t mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 font-semibold"
                          >
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

      {/* Success Toast  */}
      {showSuccessToast && (
        <div className="fixed top-24 right-4 z-50 max-w-md animate-slide-in-right">
          <div className="backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl p-4 border-l-4 border-green-500">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
                <h4 className="font-black text-gray-900 mb-1">Report Submitted!</h4>
                <p className="text-sm text-gray-600 font-medium">
                  Your community issue has been logged successfully.
                </p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
      <main className="w-full">
        <div className="w-full">
          {activeTab === 'form' && <ReportForm onReportSubmitted={handleReportSubmitted} user={user} />}
          {activeTab === 'list' && <ReportList user={user} />}
          {activeTab === 'manage' && <ManageReports user={user} />}
          {activeTab === 'info' && <MoreInfo user={user} />}
          {activeTab === 'help' && <HelpSupport user={user} />}
          {activeTab === 'settings' && <Settings user={user} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl bg-gray-900/95 text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
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
                  className="w-5 h-5 text-red-400"
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
              <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4">
                <p className="text-red-200 text-sm font-bold mb-1">For Emergencies: Call 911</p>
                <p className="text-red-300 text-xs font-medium">SafeSpot is for non-emergency community issues only.</p>
              </div>
            </div>

            {/* Project Info */}
            <div>
              <h3 className="text-lg font-black mb-4">Project Info</h3>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm font-medium">Sprint 1: Authentication & Reporting</p>
                <p className="text-gray-500 text-xs font-bold">React • Firebase • Tailwind CSS</p>
                <div className="flex items-center gap-2 mt-3">
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




