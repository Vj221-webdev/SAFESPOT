import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ReportList = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = {
    lighting: { 
      label: 'Street Lighting', 
      gradient: 'from-yellow-400 to-orange-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    vandalism: { 
      label: 'Vandalism', 
      gradient: 'from-red-400 to-pink-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    noise: { 
      label: 'Noise', 
      gradient: 'from-purple-400 to-indigo-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )
    },
    waste: { 
      label: 'Waste & Litter', 
      gradient: 'from-green-400 to-emerald-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    infrastructure: { 
      label: 'Infrastructure', 
      gradient: 'from-orange-400 to-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    other: { 
      label: 'Other', 
      gradient: 'from-blue-400 to-cyan-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  };

  const urgencyConfig = {
    low: { label: 'Low', color: 'bg-green-500', gradient: 'from-green-400 to-emerald-500', icon: '●' },
    medium: { label: 'Medium', color: 'bg-yellow-500', gradient: 'from-yellow-400 to-orange-500', icon: '●●' },
    high: { label: 'High', color: 'bg-orange-500', gradient: 'from-orange-500 to-red-500', icon: '●●●' },
    critical: { label: 'Critical', color: 'bg-red-600', gradient: 'from-red-600 to-pink-600', icon: '●●●●', pulse: true }
  };

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reports:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getFilteredAndSortedReports = () => {
    let filtered = reports;

    if (filter !== 'all') {
      filtered = filtered.filter(report => report.category === filter);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'urgency':
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        default:
          return 0;
      }
    });

    return sorted;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: timestamp.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filteredReports = getFilteredAndSortedReports();

  const categoryStats = Object.keys(categories).map(catKey => ({
    key: catKey,
    ...categories[catKey],
    count: reports.filter(r => r.category === catKey).length
  })).filter(stat => stat.count > 0);

  const totalReports = reports.length;
  const urgentCount = reports.filter(r => r.urgency === 'critical' || r.urgency === 'high').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDelay: '0.15s'}}></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-pink-600 rounded-full animate-spin" style={{animationDelay: '0.3s'}}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-900 text-xl font-black mb-2">Loading Reports...</p>
          <p className="text-gray-600 font-medium">Fetching community data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1">{totalReports}</p>
            <p className="text-sm font-semibold text-gray-600">Total Reports</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1">{urgentCount}</p>
            <p className="text-sm font-semibold text-gray-600">Urgent Issues</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-150"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse animation-delay-300"></div>
                </div>
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1">Live</p>
            <p className="text-sm font-semibold text-gray-600">Real-time Updates</p>
          </div>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Community Reports
              </h2>
              <p className="text-gray-600 font-medium text-lg">
                {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
                {filter !== 'all' && ` in ${categories[filter]?.label}`}
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-700">Live Updates Active</span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter Category
              </label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-bold cursor-pointer"
              >
                <option value="all">All Categories</option>
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort By
              </label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-bold cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="urgency">Urgency Level</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center border border-gray-100 animate-fade-in">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full blur-xl opacity-50"></div>
              <div className="relative w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">No Reports Found</h3>
            <p className="text-gray-600 font-medium text-lg mb-8 max-w-md mx-auto">
              {filter === 'all' 
                ? 'Be the first to report a community issue and make a difference!' 
                : `No reports in ${categories[filter]?.label} category yet.`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                View All Reports
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredReports.map((report, index) => {
                const category = categories[report.category] || categories.other;
                const urgency = urgencyConfig[report.urgency] || urgencyConfig.medium;

                return (
                  <div 
                    key={report.id} 
                    className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image or Gradient Header */}
                    {report.imageUrl ? (
                      <div className="relative h-52 overflow-hidden">
                        <img 
                          src={report.imageUrl} 
                          alt="Report" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-2">
                          <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${category.gradient} backdrop-blur-sm shadow-lg flex items-center gap-2`}>
                            <div className="text-white">
                              {category.icon}
                            </div>
                            <span className="text-white font-black text-sm">{category.label}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${urgency.gradient} backdrop-blur-sm shadow-lg ${urgency.pulse ? 'animate-pulse' : ''}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-black">{urgency.icon}</span>
                              <span className="text-white font-black text-xs">{urgency.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`relative h-40 bg-gradient-to-br ${category.gradient} flex flex-col items-center justify-center overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                        <div className="relative text-center">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <div className="text-white">
                              {category.icon}
                            </div>
                          </div>
                          <div className="text-white font-black text-lg mb-2">{category.label}</div>
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm ${urgency.pulse ? 'animate-pulse' : ''}`}>
                            <span className="text-white text-sm font-black">{urgency.icon}</span>
                            <span className="text-white font-black text-xs">{urgency.label}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6">
                      <p className="text-gray-700 text-sm leading-relaxed mb-5 line-clamp-3 font-medium">
                        {report.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl mb-5">
                        <svg className="w-4 h-4 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-bold truncate">{report.location}</span>
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-5 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-sm opacity-50"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white">
                              <span className="text-white text-sm font-black">
                                {report.reporterName?.charAt(0) || 'A'}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 truncate max-w-[120px]">
                              {report.reporterName || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500 font-bold">
                              {formatTimestamp(report.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-xl">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-yellow-800 font-black">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Stats */}
            {categoryStats.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 animate-fade-in">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  Category Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {categoryStats.map((stat) => (
                    <div 
                      key={stat.key}
                      className="relative rounded-2xl p-6 text-center overflow-hidden group cursor-pointer hover:scale-105 transition-all duration-300 border-2 border-gray-100"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-15 transition-opacity`}></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <div className={`text-transparent bg-gradient-to-r ${stat.gradient} bg-clip-text`}>
                            {stat.icon}
                          </div>
                        </div>
                        <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                          {stat.count}
                        </div>
                        <div className="text-xs text-gray-600 font-bold">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
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
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

export default ReportList;