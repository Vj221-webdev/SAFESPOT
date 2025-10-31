import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  notifyReportApproved, 
  notifyReportRejected, 
  notifyAdminNote, 
  notifyReportResolved,
  notifyReportInProgress 
} from '../services/notificationService';

const AdminDashboard = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await import('firebase/firestore').then(m => m.getDoc(m.doc(db, 'users', user.uid)));
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin:', error);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  // Load all reports
  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Update report status with notification
  const updateStatus = async (reportId, newStatus) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        reviewedBy: user.uid,
        reviewedAt: new Date()
      });

      // 🔔 SEND NOTIFICATION TO USER
      const report = reports.find(r => r.id === reportId);
      if (report && report.userId) {
        // Send appropriate notification based on status
        if (newStatus === 'approved') {
          await notifyReportApproved(reportId, report.userId);
        } else if (newStatus === 'rejected') {
          await notifyReportRejected(reportId, report.userId);
        } else if (newStatus === 'resolved') {
          await notifyReportResolved(reportId, report.userId);
        } else if (newStatus === 'in-review') {
          await notifyReportInProgress(reportId, report.userId);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Add admin note with notification
  const addNote = async () => {
    if (!selectedReport || !adminNote.trim()) return;

    try {
      const reportRef = doc(db, 'reports', selectedReport.id);
      const existingNotes = selectedReport.adminNotes || '';
      const newNote = `[${new Date().toLocaleString()}] ${user.displayName || user.email}: ${adminNote}\n${existingNotes}`;
      
      await updateDoc(reportRef, {
        adminNotes: newNote
      });
      
      // 🔔 SEND NOTIFICATION TO USER
      if (selectedReport.userId) {
        await notifyAdminNote(selectedReport.id, selectedReport.userId);
      }
      
      setAdminNote('');
      setSelectedReport(null);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note');
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await deleteDoc(doc(db, 'reports', reportId));
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  const getFilteredReports = () => {
    let filtered = reports;

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.category === filter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => (r.status || 'pending') === statusFilter);
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'from-green-500 to-emerald-500';
      case 'in-review': return 'from-blue-500 to-cyan-500';
      case 'resolved': return 'from-purple-500 to-pink-500';
      case 'rejected': return 'from-red-500 to-pink-500';
      default: return 'from-yellow-500 to-orange-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        );
      case 'resolved':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        );
      case 'in-review':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  const filteredReports = getFilteredReports();

  const stats = {
    total: reports.length,
    pending: reports.filter(r => !r.status || r.status === 'pending').length,
    inReview: reports.filter(r => r.status === 'in-review').length,
    approved: reports.filter(r => r.status === 'approved').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 shadow-2xl mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg font-medium">Manage and review community reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
            <div className="text-3xl font-black text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm font-semibold text-gray-600">Total</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-5 border border-yellow-200">
            <div className="text-3xl font-black text-yellow-700 mb-1">{stats.pending}</div>
            <div className="text-sm font-semibold text-yellow-600">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-5 border border-blue-200">
            <div className="text-3xl font-black text-blue-700 mb-1">{stats.inReview}</div>
            <div className="text-sm font-semibold text-blue-600">In Review</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-5 border border-green-200">
            <div className="text-3xl font-black text-green-700 mb-1">{stats.approved}</div>
            <div className="text-sm font-semibold text-green-600">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-5 border border-purple-200">
            <div className="text-3xl font-black text-purple-700 mb-1">{stats.resolved}</div>
            <div className="text-sm font-semibold text-purple-600">Resolved</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg p-5 border border-red-200">
            <div className="text-3xl font-black text-red-700 mb-1">{stats.rejected}</div>
            <div className="text-sm font-semibold text-red-600">Rejected</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Filter by Category</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-semibold"
              >
                <option value="all">All Categories</option>
                <option value="lighting">Street Lighting</option>
                <option value="vandalism">Vandalism</option>
                <option value="noise">Noise</option>
                <option value="waste">Waste & Litter</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-semibold"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">No reports match your current filters</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    {report.imageUrl && (
                      <div className="lg:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-700 capitalize">
                              {report.category}
                            </span>
                            <span className="px-3 py-1 bg-orange-100 rounded-lg text-sm font-bold text-orange-700 capitalize">
                              {report.urgency}
                            </span>
                            <div className={`flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${getStatusColor(report.status || 'pending')} rounded-lg`}>
                              <div className="text-white">
                                {getStatusIcon(report.status || 'pending')}
                              </div>
                              <span className="text-sm font-bold text-white capitalize">
                                {(report.status || 'pending').replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 font-medium mb-2">{report.description}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="font-semibold">{report.location}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>By: {report.reporterName}</span>
                            <span>•</span>
                            <span>{report.timestamp.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Notes */}
                      {report.adminNotes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <p className="text-xs font-bold text-blue-900 mb-1">Admin Notes:</p>
                          <p className="text-xs text-blue-700 whitespace-pre-wrap">{report.adminNotes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => updateStatus(report.id, 'in-review')}
                          disabled={report.status === 'in-review'}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 transition-all"
                        >
                          In Review
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'approved')}
                          disabled={report.status === 'approved'}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'resolved')}
                          disabled={report.status === 'resolved'}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 transition-all"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => updateStatus(report.id, 'rejected')}
                          disabled={report.status === 'rejected'}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 disabled:scale-100 transition-all"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                          Add Note
                        </button>
                        <button
                          onClick={() => deleteReport(report.id)}
                          className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Add Admin Note</h3>
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNote('');
                }}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-semibold text-gray-700 mb-2">Report: {selectedReport.category}</p>
              <p className="text-sm text-gray-600">{selectedReport.description}</p>
            </div>

            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Enter your note... (User will be notified)"
              rows="4"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNote('');
                }}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addNote}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Add Note & Notify User 🔔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;