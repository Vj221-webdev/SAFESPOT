import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';

export default function MoreInfo({ user, onNavigate }) {
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    pendingReports: 0,
    userReports: 0
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from Firebase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total reports
        const reportsRef = collection(db, 'reports');
        const allReports = await getDocs(reportsRef);
        const totalReports = allReports.size;

        // Get resolved reports
        const resolvedQuery = query(reportsRef, where('status', '==', 'resolved'));
        const resolvedSnapshot = await getDocs(resolvedQuery);
        const resolvedReports = resolvedSnapshot.size;

        // Get pending reports
        const pendingQuery = query(reportsRef, where('status', '==', 'pending'));
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingReports = pendingSnapshot.size;

        // Get user's reports
        let userReports = 0;
        if (user) {
          const userQuery = query(reportsRef, where('reporterId', '==', user.uid));
          const userSnapshot = await getDocs(userQuery);
          userReports = userSnapshot.size;
        }

        // Get recent reports
        const recentQuery = query(reportsRef, orderBy('timestamp', 'desc'), limit(5));
        const recentSnapshot = await getDocs(recentQuery);
        const recent = recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setStats({
          totalReports,
          resolvedReports,
          pendingReports,
          userReports
        });
        setRecentReports(recent);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const quickActions = [
    {
      id: 1,
      title: "Submit Report",
      description: "Report a new community issue",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      action: () => onNavigate && onNavigate('form')
    },
    {
      id: 2,
      title: "My Reports",
      description: "View your submitted reports",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
      action: () => onNavigate && onNavigate('list')
    },
    {
      id: 3,
      title: "AI Camera",
      description: "Use AI to auto-fill reports",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
      action: () => onNavigate && onNavigate('form')
    },
    {
      id: 4,
      title: "Get Help",
      description: "Contact support team",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
      action: () => onNavigate && onNavigate('help')
    }
  ];

  const features = [
    {
      id: 1,
      title: "AI-Powered Detection",
      description: "Point camera at an issue and AI automatically categorizes and describes it in seconds.",
      icon: "🤖",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Real-Time Notifications",
      description: "Get instant updates when your report status changes or when issues are resolved.",
      icon: "🔔",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 3,
      title: "Location Tracking",
      description: "Automatic GPS detection pinpoints exact locations with street-level accuracy.",
      icon: "📍",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: 4,
      title: "Secure & Private",
      description: "Firebase authentication with encrypted storage keeps your data safe and private.",
      icon: "🔒",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const getCategoryIcon = (category) => {
    const icons = {
      lighting: '💡',
      vandalism: '🚨',
      noise: '🔊',
      waste: '🗑️',
      infrastructure: '🏗️',
      other: '📌'
    };
    return icons[category] || '📌';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Platform Overview
          </h2>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Quick actions, community stats, and everything you need to make the most of SafeSpot
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                onClick={action.action}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 text-left animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {action.icon}
                </div>
                <h4 className="font-black text-gray-900 text-lg mb-2">{action.title}</h4>
                <p className="text-gray-600 text-sm font-medium">{action.description}</p>
                <div className="mt-4 flex items-center text-purple-600 font-bold text-sm group-hover:gap-2 transition-all">
                  <span>Go</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Community Impact
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">
                    {loading ? '...' : stats.totalReports}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">Total Reports</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">
                    {loading ? '...' : stats.resolvedReports}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">Resolved</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalReports ? (stats.resolvedReports / stats.totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">
                    {loading ? '...' : stats.pendingReports}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">Pending</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalReports ? (stats.pendingReports / stats.totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">
                    {loading ? '...' : stats.userReports}
                  </p>
                  <p className="text-sm font-semibold text-gray-600">Your Reports</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                  style={{ width: `${stats.totalReports ? (stats.userReports / stats.totalReports) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Activity
          </h3>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 font-semibold">Loading recent reports...</p>
              </div>
            ) : recentReports.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 font-semibold">No reports yet. Be the first to report an issue!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentReports.map((report, index) => (
                  <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{getCategoryIcon(report.category)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-gray-900 capitalize">{report.category}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyColor(report.urgency)}`}>
                            {report.urgency}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{report.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {report.location.substring(0, 30)}...
                          </span>
                          <span>{getTimeAgo(report.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <svg className="w-7 h-7 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Key Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg mb-2">{feature.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 text-white relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <h3 className="text-3xl font-black mb-4">Ready to Make an Impact?</h3>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join our community in making neighborhoods safer. Every report matters!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => onNavigate && onNavigate('form')}
                className="px-8 py-4 bg-white text-purple-600 rounded-xl font-black shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit Your First Report
              </button>
              <button
                onClick={() => onNavigate && onNavigate('help')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-black hover:bg-white/20 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out 0.2s both;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}