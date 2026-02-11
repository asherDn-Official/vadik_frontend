import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Search, Filter, ArrowLeft, ArrowRight, TrendingUp, History, CreditCard, Clock } from "lucide-react";
import api from "../../../../api/apiconfig";

export default function CreditUsageHistoryModal({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/api/whatsapp-credits/history/usage", {
        params: {
          page,
          limit: pagination.limit,
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });

      if (response.data.status) {
        setHistory(response.data.data);
        setPagination({
          ...pagination,
          page: response.data.pagination.page,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        });
      }
    } catch (error) {
      console.error("Error fetching usage history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory(1);
    }
  }, [isOpen, dateRange]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    return history.filter((item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  // Basic Analytics
  const analytics = useMemo(() => {
    if (!history.length) return { totalUsed: 0, avgPerDay: 0, mostUsed: "N/A" };

    const totalUsed = history.reduce((acc, item) => acc + item.creditsUsed, 0);
    
    // Most used description
    const descriptions = history.reduce((acc, item) => {
      acc[item.description] = (acc[item.description] || 0) + 1;
      return acc;
    }, {});
    
    const mostUsed = Object.entries(descriptions).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Average per day (based on visible history)
    const uniqueDays = new Set(history.map(item => new Date(item.date).toDateString())).size;
    const avgPerDay = uniqueDays > 0 ? totalUsed / uniqueDays : 0;

    return { totalUsed, avgPerDay, mostUsed };
  }, [history]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">WhatsApp Credit Usage History</h2>
            <p className="text-sm text-gray-500">Detailed logs and analytics of your credit consumption</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-pink-50 rounded-xl text-pink-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Consumed (Page)</p>
                  <h3 className="text-2xl font-bold text-gray-800">₹ {analytics.totalUsed.toFixed(2)}</h3>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                Updated just now
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Daily Usage</p>
                  <h3 className="text-2xl font-bold text-gray-800">₹ {analytics.avgPerDay.toFixed(2)}</h3>
                </div>
              </div>
              <p className="text-xs text-gray-400">Based on current view</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600">
                  <History className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">Most Used Template</p>
                  <h3 className="text-lg font-bold text-gray-800 truncate" title={analytics.mostUsed}>
                    {analytics.mostUsed}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-400">Top activity by frequency</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <input 
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer p-1"
                />
                <span className="text-gray-400">to</span>
                <input 
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer p-1"
                />
              </div>
              <button 
                onClick={() => setDateRange({start: "", end: ""})}
                className="text-xs text-gray-500 hover:text-pink-600 font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Credits Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
                          <p className="text-gray-400 text-sm">Loading detailed history...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <Calendar className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{formatDate(item.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700 font-medium">{item.description}</p>
                          {item.status === "failed" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Payment Issue / Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.status === 'failed' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}`}>
                            {item.status === 'failed' ? '₹ 0.00' : `- ₹ ${item.creditsUsed.toFixed(2)}`}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Filter className="w-10 h-10 text-gray-200" />
                          <p className="text-gray-400">No usage records found for this period</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing <span className="font-semibold text-gray-800">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-semibold text-gray-800">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold text-gray-800">{pagination.total}</span> records
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchHistory(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show a few page buttons around current page
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchHistory(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pagination.page === pageNum
                              ? "bg-pink-600 text-white"
                              : "hover:bg-white border border-transparent hover:border-gray-200 text-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.page - 2 ||
                      pageNum === pagination.page + 2
                    ) {
                      return <span key={pageNum} className="text-gray-400">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => fetchHistory(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
