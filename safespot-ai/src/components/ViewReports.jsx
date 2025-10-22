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

  // Styling helpers
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
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold mb-6">View Reports</h2>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex gap-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="All">All Priority</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">ID</th>
              <th className="px-6 py-3 text-left font-semibold">Title</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Priority</th>
              <th className="px-6 py-3 text-left font-semibold">Created At</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentReports.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No reports found.
                </td>
              </tr>
            ) : (
              currentReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{report.id}</td>
                  <td className="px-6 py-4">{report.title}</td>
                  <td className={`px-6 py-4 font-semibold ${statusColor(report.status)}`}>
                    {report.status}
                  </td>
                  <td className={`px-6 py-4 font-semibold ${priorityColor(report.priority)}`}>
                    {report.priority}
                  </td>
                  <td className="px-6 py-4">{report.createdAt}</td>
                  <td className="px-6 py-4">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold transition"
                      onClick={() => openModal(report)}
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
                ? "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-red-50"
            } transition`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Modal for Report Details */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 font-bold"
              onClick={closeModal}
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">{selectedReport.title}</h3>
            <p className="mb-4">{selectedReport.description}</p>
            <div className="flex gap-6 mb-4 flex-wrap">
              <div>
                <span className="font-semibold">Status: </span>
                <span className={statusColor(selectedReport.status)}>{selectedReport.status}</span>
              </div>
              <div>
                <span className="font-semibold">Priority: </span>
                <span className={priorityColor(selectedReport.priority)}>{selectedReport.priority}</span>
              </div>
            </div>
            <div className="flex gap-6 flex-wrap">
              <div>
                <span className="font-semibold">Created At: </span>
                {selectedReport.createdAt}
              </div>
              <div>
                <span className="font-semibold">Updated At: </span>
                {selectedReport.updatedAt}
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-4">
              <button
                className="px-6 py-2 rounded-xl border font-semibold hover:bg-gray-100 transition"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
