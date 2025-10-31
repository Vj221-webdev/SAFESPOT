import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function ViewReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Load real reports from Firebase
  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || "N/A",
        updatedAt: doc.data().updatedAt?.toDate().toLocaleDateString() || "N/A",
      }));
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPriority]);

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All" ? true : report.status === filterStatus;
    const matchesPriority = filterPriority === "All" ? true : report.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / reportsPerPage));

  const handlePageChange = (page) => setCurrentPage(page);
  
  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  // Styling helpers
  const statusColor = (status) => {
    switch (status) {
      case "Approved":
      case "Resolved":
        return "text-green-500";
      case "Rejected":
        return "text-red-500";
      case "In Progress":
        return "text-blue-500";
      default:
        return "text-yellow-500";
    }
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-orange-500";
      case "Urgent":
        return "text-red-600";
      case "Critical":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Community Reports
          </h2>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Browse all community reports. Search, filter, and view detailed information about each report.
          </p>
        </div>

        <div className="space-y-6">
          {/* Stats Section */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-blue-600">{reports.length}</div>
              <div className="text-sm font-semibold text-gray-600 mt-1">Total Reports</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-yellow-500">
                {reports.filter(r => r.status === "Pending").length}
              </div>
              <div className="text-sm font-semibold text-gray-600 mt-1">Pending</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-green-500">
                {reports.filter(r => r.status === "Approved" || r.status === "Resolved").length}
              </div>
              <div className="text-sm font-semibold text-gray-600 mt-1">Resolved</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-3xl font-black text-blue-500">
                {reports.filter(r => r.status === "In Progress").length}
              </div>
              <div className="text-sm font-semibold text-gray-600 mt-1">In Progress</div>
            </div>
          </section>

          {/* Controls Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Search & Filter</h3>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
              />

              <div className="flex gap-4 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium"
                >
                  <option value="All">All Priority</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="text-sm text-gray-600 font-semibold">
                Showing {currentReports.length} of {filteredReports.length} reports
              </div>
            </div>
          </section>

          {/* Table Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="overflow-x-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Title</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Category</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Status</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Priority</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Submitted</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {currentReports.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-gray-500 font-semibold text-lg">No reports found</p>
                          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentReports.map((report) => (
                      <tr key={report.id} className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                        <td className="px-6 py-4 font-semibold text-gray-900 max-w-xs truncate">
                          {report.title || "Untitled"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {report.category || "General"}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-semibold ${statusColor(report.status)}`}>
                          {report.status || "Pending"}
                        </td>
                        <td className={`px-6 py-4 font-semibold ${priorityColor(report.priority)}`}>
                          {report.priority || "Normal"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 text-sm">
                          {report.createdAt}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openModal(report)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 gap-2 flex-wrap">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-xl font-semibold border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                  } transition`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-xl font-semibold border ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                      } transition`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-xl font-semibold border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                  } transition`}
                >
                  Next
                </button>
              </div>
            )}
          </section>

          {/* Modal */}
          {showModal && selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative flex-shrink-0">
                  <button
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white font-bold transition-all transform hover:scale-110 hover:rotate-90"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                  <h3 className="text-2xl font-black text-white pr-12">Report Details</h3>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedReport.title || "Untitled Report"}
                    </h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                      {selectedReport.category || "General"}
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedReport.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-xs text-gray-500 font-semibold mb-1">Status</div>
                      <div className={`font-bold ${statusColor(selectedReport.status)}`}>
                        {selectedReport.status || "Pending"}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-xs text-gray-500 font-semibold mb-1">Priority</div>
                      <div className={`font-bold ${priorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority || "Normal"}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-xs text-gray-500 font-semibold mb-1">Submitted</div>
                      <div className="font-medium text-gray-700 text-sm">
                        {selectedReport.createdAt}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-xs text-gray-500 font-semibold mb-1">Updated</div>
                      <div className="font-medium text-gray-700 text-sm">
                        {selectedReport.updatedAt}
                      </div>
                    </div>
                  </div>

                  {selectedReport.location && (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="text-sm text-gray-700 font-semibold">Location</div>
                      </div>
                      <div className="text-gray-800 font-medium">{selectedReport.location}</div>
                    </div>
                  )}

                  {selectedReport.submittedBy && (
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-xs text-gray-500 font-semibold mb-1">Submitted By</div>
                      <div className="font-medium text-gray-700">{selectedReport.submittedBy}</div>
                    </div>
                  )}

                  {selectedReport.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border-2 border-gray-200">
                      <img 
                        src={selectedReport.imageUrl} 
                        alt="Report"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {selectedReport.adminNotes && (
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <div className="text-sm text-orange-700 font-semibold">Admin Notes</div>
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">{selectedReport.adminNotes}</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
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
          animation: fade-in 0.3s ease-out;
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

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.28s cubic-bezier(.2,.8,.2,1);
        }
      `}</style>
    </div>
  );
}