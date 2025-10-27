import React, { useState, useEffect } from "react";

// Sample dummy data for reports
const sampleReports = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Report ${i + 1}`,
  description: `This is a detailed description of report number ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
  status: ["Pending", "Approved", "Rejected"][i % 3],
  priority: ["Normal", "High", "Urgent"][i % 3],
  createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toLocaleDateString(),
  updatedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toLocaleDateString(),
}));

export default function ViewReports() {
  const [reports, setReports] = useState(sampleReports);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterPriority]);

  // Filtered reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Styling helpers (match settings palette)
  const statusColor = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-500";
      case "Rejected":
        return "text-red-500";
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
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header (matches Settings header style) */}
        <div className="text-center mb-10 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>

          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            View Reports
          </h2>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Browse, filter, and inspect reports. Matches the app’s settings UI for a consistent experience.
          </p>
        </div>

        <div className="space-y-6">
          {/* Controls Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Reports</h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
              />

              <div className="flex gap-4 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none font-medium"
                >
                  <option value="All">All Priority</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </section>

          {/* Table Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
            <div className="overflow-x-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">ID</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Title</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Status</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Priority</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Created</th>
                    <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white">
                  {currentReports.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500 font-semibold">
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    currentReports.map((report) => (
                      <tr key={report.id} className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                        <td className="px-6 py-4 font-semibold text-gray-900">{report.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{report.title}</td>
                        <td className={`px-6 py-4 font-semibold ${statusColor(report.status)}`}>{report.status}</td>
                        <td className={`px-6 py-4 font-semibold ${priorityColor(report.priority)}`}>{report.priority}</td>
                        <td className="px-6 py-4 font-medium text-gray-700">{report.createdAt}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openModal(report)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-md hover:shadow-xl transform hover:scale-105 transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-4 py-2 rounded-xl font-semibold border ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                  } transition`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </section>

          {/* Modal — matches Settings modal style */}
          {showModal && selectedReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative animate-scale-in overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative">
                  <button
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white font-bold transition-all transform hover:scale-110 hover:rotate-90"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                  <h3 className="text-2xl font-black text-white">Report Details</h3>
                </div>

                <div className="p-6 space-y-4">
                  <h4 className="text-xl font-bold text-gray-900">{selectedReport.title}</h4>
                  <p className="text-gray-700">{selectedReport.description}</p>

                  <div className="flex gap-6 flex-wrap">
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-sm text-gray-500 font-semibold">Status</div>
                      <div className={`mt-1 font-bold ${statusColor(selectedReport.status)}`}>{selectedReport.status}</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-sm text-gray-500 font-semibold">Priority</div>
                      <div className={`mt-1 font-bold ${priorityColor(selectedReport.priority)}`}>{selectedReport.priority}</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-sm text-gray-500 font-semibold">Created</div>
                      <div className="mt-1 font-medium text-gray-700">{selectedReport.createdAt}</div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                      <div className="text-sm text-gray-500 font-semibold">Updated</div>
                      <div className="mt-1 font-medium text-gray-700">{selectedReport.updatedAt}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reused animations (same as Settings page) */}
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
