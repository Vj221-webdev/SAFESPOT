import React, { useState, useEffect } from "react";

const sampleReports = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Report ${i + 1}`,
  description: `This is a detailed description of report number ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  status: ["Pending", "Approved", "Rejected"][i % 3],
  priority: ["Normal", "High", "Urgent"][i % 3],
  assignedTo: `User ${i % 5 + 1}`,
  createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toLocaleDateString(),
  updatedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toLocaleDateString(),
}));

export default function ManageReports() {
  const [reports, setReports] = useState(sampleReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPriority]);

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" ? true : report.status === filterStatus;
    const matchesPriority = filterPriority === "All" ? true : report.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);
  
  const openModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  const statusConfig = {
    Approved: { color: "text-green-600", bg: "bg-green-100", badge: "bg-green-500" },
    Rejected: { color: "text-red-600", bg: "bg-red-100", badge: "bg-red-500" },
    Pending: { color: "text-yellow-600", bg: "bg-yellow-100", badge: "bg-yellow-500" }
  };

  const priorityConfig = {
    High: { color: "text-orange-600", bg: "bg-orange-100", badge: "bg-orange-500" },
    Urgent: { color: "text-red-600", bg: "bg-red-100", badge: "bg-red-500", pulse: true },
    Normal: { color: "text-gray-600", bg: "bg-gray-100", badge: "bg-gray-500" }
  };

  const updateReportStatus = (id, newStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toLocaleDateString() } : r))
    );
  };

  const deleteReport = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === "Pending").length,
    approved: reports.filter(r => r.status === "Approved").length,
    rejected: reports.filter(r => r.status === "Rejected").length,
    urgent: reports.filter(r => r.priority === "Urgent").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Manage Reports
          </h2>
          <p className="text-gray-600 font-medium">Review, approve, and manage all submitted reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.total}</p>
            <p className="text-sm font-semibold text-gray-600">Total Reports</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.pending}</p>
            <p className="text-sm font-semibold text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.approved}</p>
            <p className="text-sm font-semibold text-gray-600">Approved</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.rejected}</p>
            <p className="text-sm font-semibold text-gray-600">Rejected</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.urgent}</p>
            <p className="text-sm font-semibold text-gray-600">Urgent</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-semibold cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-semibold cursor-pointer"
              >
                <option value="All">All Priority</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentReports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-semibold">No reports found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">#{report.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{report.title}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{report.assignedTo.charAt(5)}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{report.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusConfig[report.status].bg} ${statusConfig[report.status].color}`}>
                          <span className={`w-2 h-2 rounded-full ${statusConfig[report.status].badge} mr-2`}></span>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${priorityConfig[report.priority].bg} ${priorityConfig[report.priority].color}`}>
                          <span className={`w-2 h-2 rounded-full ${priorityConfig[report.priority].badge} mr-2 ${priorityConfig[report.priority].pulse ? 'animate-pulse' : ''}`}></span>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-bold text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                            onClick={() => updateReportStatus(report.id, "Approved")}
                          >
                            ✓
                          </button>
                          <button
                            className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-bold text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                            onClick={() => updateReportStatus(report.id, "Pending")}
                          >
                            ⏱
                          </button>
                          <button
                            className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-bold text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                            onClick={() => updateReportStatus(report.id, "Rejected")}
                          >
                            ✕
                          </button>
                          <button
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-bold text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                            onClick={() => openModal(report)}
                          >
                            👁
                          </button>
                          <button
                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-xs shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                            onClick={() => deleteReport(report.id)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-2 flex-wrap animate-fade-in">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl font-bold border-2 border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              ←
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                  className={`px-4 py-2 rounded-xl font-bold border-2 transition-all transform hover:scale-105 ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-500"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl font-bold border-2 border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              →
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative animate-scale-in overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative">
                <button
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white font-bold transition-all transform hover:scale-110 hover:rotate-90"
                  onClick={closeModal}
                >
                  ✕
                </button>
                <h3 className="text-2xl font-black text-white pr-12">{selectedReport.title}</h3>
                <p className="text-blue-100 mt-1 font-medium">Report #{selectedReport.id}</p>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${statusConfig[selectedReport.status].bg} ${statusConfig[selectedReport.status].color}`}>
                      <span className={`w-2 h-2 rounded-full ${statusConfig[selectedReport.status].badge} mr-2`}></span>
                      {selectedReport.status}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Priority</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${priorityConfig[selectedReport.priority].bg} ${priorityConfig[selectedReport.priority].color}`}>
                      <span className={`w-2 h-2 rounded-full ${priorityConfig[selectedReport.priority].badge} mr-2`}></span>
                      {selectedReport.priority}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Assigned To</label>
                    <p className="text-gray-900 font-bold">{selectedReport.assignedTo}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Created</label>
                    <p className="text-gray-900 font-bold">{selectedReport.createdAt}</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-300 font-bold hover:bg-gray-100 transition-all"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out 0.4s both;
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}