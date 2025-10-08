import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const ReportList = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const categories = {
    lighting: { label: 'Street Lighting', gradient: 'from-yellow-400 to-orange-500' },
    vandalism: { label: 'Vandalism', gradient: 'from-red-400 to-pink-500' },
    noise: { label: 'Noise', gradient: 'from-purple-400 to-indigo-500' },
    waste: { label: 'Waste & Litter', gradient: 'from-green-400 to-emerald-500' },
    infrastructure: { label: 'Infrastructure', gradient: 'from-orange-400 to-red-500' },
    other: { label: 'Other', gradient: 'from-blue-400 to-cyan-500' }
  };

  const urgencyConfig = {
    low: { label: 'Low', color: 'bg-green-500', icon: '●' },
    medium: { label: 'Medium', color: 'bg-yellow-500', icon: '●●' },
    high: { label: 'High', color: 'bg-orange-500', icon: '●●●' },
    critical: { label: 'Critical', color: 'bg-red-600', icon: '●●●●' }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDelay: '0.15s'}}></div>
        </div>
        <p className="text-white text-lg font-bold">Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Card */}
      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Community Reports
            </h2>
            <p className="text-gray-600 mt-1 font-medium">
              {filteredReports.length} {filteredReports.length === 1 ? 'report' : 'reports'}
              {filter !== 'all' && ` in ${categories[filter]?.label}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-600">Live Updates</span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Filter Category
            </label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 font-medium"
            >
              <option value="all">All Categories</option>
              {Object.entries(categories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Sort By
            </label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 font-medium"
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
        <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-16 text-center border border-white/20">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600 font-medium">
            {filter === 'all' 
              ? 'Be the first to report a community issue!' 
              : `No reports in ${categories[filter]?.label} yet.`}
          </p>
        </div>
      ) : (
        <>
          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredReports.map((report) => {
              const category = categories[report.category] || categories.other;
              const urgency = urgencyConfig[report.urgency] || urgencyConfig.medium;

              return (
                <div 
                  key={report.id} 
                  className="group backdrop-blur-xl bg-white/95 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-white/20"
                >
                  {/* Image or Gradient Header */}
                  {report.imageUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={report.imageUrl} 
                        alt="Report" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${category.gradient} backdrop-blur-sm`}>
                          <span className="text-white font-bold text-sm">{category.label}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg ${urgency.color} backdrop-blur-sm flex items-center gap-1.5`}>
                          <span className="text-white text-xs font-bold">{urgency.icon}</span>
                          <span className="text-white font-bold text-xs">{urgency.label}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`relative h-32 bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                      <div className="text-center">
                        <div className="text-white font-black text-lg mb-1">{category.label}</div>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${urgency.color} bg-white/20 backdrop-blur-sm`}>
                          <span className="text-white text-xs">{urgency.icon}</span>
                          <span className="text-white font-bold text-xs">{urgency.label}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-5">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3 font-medium">
                      {report.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl mb-4">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-semibold truncate">{report.location}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {report.reporterName?.charAt(0) || 'A'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                            {report.reporterName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {formatTimestamp(report.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600 font-semibold">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Stats */}
          {categoryStats.length > 0 && (
            <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-6 border border-white/20">
              <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Category Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categoryStats.map((stat) => (
                  <div 
                    key={stat.key}
                    className="relative rounded-2xl p-4 text-center overflow-hidden group cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className="relative z-10">
                      <div className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
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
  );
};

export default ReportList;