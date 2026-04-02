import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Search, Filter, Calendar, RefreshCw, CheckCircle2, 
  Clock, AlertCircle, Eye, Mail, MessageSquare, TrendingUp,
  BarChart2, PieChart as PieChartIcon, Activity, Repeat, History
} from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";
import moment from "moment";
import { getWhatsappErrorDescription } from "../../utils/whatsappErrorCodes";

const EngagementDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [retryStats, setRetryStats] = useState(null);
  const [retryTimeline, setRetryTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryLoading, setRetryLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = `/api/whatsappMessage/logs?page=${page}&search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const res = await api.get(url);
      if (res.data.status) {
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load message logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      let url = "/api/whatsappMessage/analytics";
      const params = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      
      const res = await api.get(url);
      if (res.data.status) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const fetchRetryData = async () => {
    try {
      setRetryLoading(true);
      const [statsRes, timelineRes] = await Promise.all([
        api.get("/api/retryAutomation/statistics"),
        api.get("/api/retryAutomation/timeline")
      ]);
      
      if (statsRes.data.status) setRetryStats(statsRes.data.data);
      if (timelineRes.data.status) setRetryTimeline(timelineRes.data.status ? timelineRes.data.data : []);
    } catch (error) {
      console.error("Error fetching retry data:", error);
    } finally {
      setRetryLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  useEffect(() => {
    if (activeTab === "retry") {
      fetchRetryData();
    }
  }, [activeTab]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "read":
        return <CheckCircle2 size={16} className="text-blue-500" />;
      case "delivered":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "sent":
        return <CheckCircle2 size={16} className="text-gray-400" />;
      case "failed":
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-orange-500" />;
    }
  };

  const COLORS = ['#313166', '#4CAF50', '#2196F3', '#FFC107', '#F44336'];

  const renderOverview = () => {
    if (!analytics) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

    const { statusStats, typeStats, trendStats, isDaily } = analytics;
    const totalRead = statusStats.find(s => s._id === 'read')?.count || 0;
    const totalDelivered = (statusStats.find(s => s._id === 'delivered')?.count || 0) + totalRead;
    const totalSent = statusStats.reduce((acc, curr) => acc + curr.count, 0);

    // Format data for charts - Merge READ into DELIVERED for the pie chart to avoid double counting
    const pieData = [];
    statusStats.forEach(stat => {
      if (stat._id === 'read') return; // Skip read to merge into delivered
      if (stat._id === 'delivered') {
        pieData.push({ name: 'DELIVERED', value: totalDelivered });
      } else {
        pieData.push({ name: stat._id.toUpperCase(), value: stat.count });
      }
    });
    // If we have read but no delivered entries, add a DELIVERED entry
    if (totalRead > 0 && !pieData.find(p => p.name === 'DELIVERED')) {
      pieData.push({ name: 'DELIVERED', value: totalRead });
    }

    // Process trend stats for line chart
    const trendChartData = [];
    const trendGroups = {};
    
    trendStats.forEach(stat => {
      const key = isDaily 
        ? `${stat._id.year}-${stat._id.month}-${stat._id.day}`
        : `${stat._id.year}-${stat._id.month}`;
        
      if (!trendGroups[key]) {
        trendGroups[key] = {
          name: isDaily 
            ? `${stat._id.day} ${moment().month(stat._id.month - 1).format("MMM")}`
            : moment().month(stat._id.month - 1).format("MMM"),
          total: 0,
          delivered: 0,
          read: 0,
          failed: 0
        };
      }
      trendGroups[key].total += stat.count;
      // In trend chart, Delivered should also be cumulative (delivered + read)
      if (stat._id.status === 'delivered' || stat._id.status === 'read') {
        trendGroups[key].delivered += stat.count;
      }
      if (stat._id.status === 'read') trendGroups[key].read += stat.count;
      if (stat._id.status === 'failed') trendGroups[key].failed += stat.count;
    });

    Object.keys(trendGroups).forEach(key => {
      trendChartData.push(trendGroups[key]);
    });

    return (
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sent</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalSent}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalDelivered}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Eye size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Read</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalRead}
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Read Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {Math.round((totalRead / (totalSent || 1)) * 100)}%
              </h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Failed</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {statusStats.find(s => s._id === 'failed')?.count || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-[#313166]" />
                Delivery Performance ({isDaily ? 'Daily' : 'Monthly'})
              </div>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#313166" strokeWidth={2} />
                  <Line type="monotone" dataKey="read" stroke="#2196F3" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="#F44336" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-[#313166]" />
              Message Distribution
            </h3>
            <div className="h-64 flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-sm font-medium text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRetryReport = () => {
    if (retryLoading) return <div className="p-12 text-center"><RefreshCw className="animate-spin mx-auto text-[#313166]" /></div>;
    if (!retryStats) return <div className="p-12 text-center text-gray-500">No retry data available</div>;

    return (
      <div className="space-y-6">
        {/* Status Breakdown (Top Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium mb-1">Total Sent</p>
            <h3 className="text-xl font-bold text-gray-900">{retryStats.totalSent}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
            <p className="text-xs text-gray-500 font-medium mb-1">✅ Delivered</p>
            <h3 className="text-xl font-bold text-gray-900">{retryStats.delivered}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
            <p className="text-xs text-gray-500 font-medium mb-1">❌ Failed</p>
            <h3 className="text-xl font-bold text-gray-900">{retryStats.failed}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <p className="text-xs text-gray-500 font-medium mb-1">🔁 Retried</p>
            <h3 className="text-xl font-bold text-gray-900">{retryStats.retried}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-400">
            <p className="text-xs text-gray-500 font-medium mb-1">✅ Success after Retry</p>
            <h3 className="text-xl font-bold text-gray-900 text-green-600">{retryStats.successAfterRetry}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-400">
            <p className="text-xs text-gray-500 font-medium mb-1">❌ Still Failed</p>
            <h3 className="text-xl font-bold text-gray-900 text-red-600">{retryStats.stillFailed}</h3>
          </div>
        </div>

        {/* Retry Timeline View */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <History size={20} className="text-[#313166]" />
            Retry Timeline
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retryTimeline}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F44336" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F44336" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tickFormatter={(val) => moment(val).format("MMM DD")} />
                <YAxis />
                <Tooltip labelFormatter={(val) => moment(val).format("MMMM DD, YYYY")} />
                <Legend />
                <Area type="monotone" dataKey="successAfterRetry" name="Recovered" stroke="#4CAF50" fillOpacity={1} fill="url(#colorSuccess)" />
                <Area type="monotone" dataKey="stillFailed" name="Still Failed" stroke="#F44336" fillOpacity={1} fill="url(#colorFailed)" />
                <Area type="monotone" dataKey="retried" name="Total Retried" stroke="#2196F3" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Improvement Summary */}
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-green-900">Message Recovery Success</h4>
              <p className="text-sm text-green-700">You recovered {retryStats.successAfterRetry} messages that would have otherwise failed! 🎉</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Recovery Rate</p>
            <p className="text-3xl font-black text-green-900">{Math.round((retryStats.successAfterRetry / (retryStats.retried || 1)) * 100)}%</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-white text-[#313166] shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart2 size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "logs"
                ? "bg-white text-[#313166] shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare size={18} />
            Message Logs
          </button>
          <button
            onClick={() => setActiveTab("retry")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "retry"
                ? "bg-white text-[#313166] shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Repeat size={18} />
            Retry Report
          </button>
        </div>

        <button 
          onClick={() => { fetchLogs(); fetchAnalytics(); if(activeTab === "retry") fetchRetryData(); }}
          className="p-2 text-gray-500 hover:text-[#313166] hover:bg-gray-100 rounded-xl transition-all"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {activeTab === "overview" ? renderOverview() : activeTab === "retry" ? renderRetryReport() : (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, number or content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#313166]/20 focus:border-[#313166]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                  <Filter size={16} className="text-gray-400" />
                  <select 
                    className="text-sm focus:outline-none bg-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="delivered">Delivered</option>
                    <option value="read">Read</option>
                    <option value="failed">Failed</option>
                    <option value="retried">Retried</option>
                    <option value="success">Success after Retry</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                  <Repeat size={16} className="text-gray-400" />
                  <select 
                    className="text-sm focus:outline-none bg-transparent"
                    onChange={(e) => {
                      // Handle retry count filter if needed, for now just a placeholder
                    }}
                  >
                    <option value="">Retry Count</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-xl">
                  <Calendar size={16} className="text-gray-400" />
                  <div className="flex items-center gap-1">
                    <input 
                      type="date" 
                      className="text-xs focus:outline-none bg-transparent"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <span className="text-gray-300">-</span>
                    <input 
                      type="date" 
                      className="text-xs focus:outline-none bg-transparent"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {(statusFilter || startDate || endDate) && (
                  <button 
                    onClick={() => {
                      setStatusFilter("");
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm font-medium">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Retry Info</th>
                    <th className="px-6 py-4">Final Status</th>
                    <th className="px-6 py-4">Message</th>
                    <th className="px-6 py-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading messages...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">No messages found.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2" title={log.status}>
                              {getStatusIcon(log.status)}
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{log.status}</span>
                            </div>
                            {log.status === 'failed' && (
                              <div className="text-[10px] text-red-500 max-w-[180px] leading-tight mt-1 bg-red-50 p-1.5 rounded-lg border border-red-100 shadow-sm">
                                <span className="font-bold block mb-0.5">Failure Details:</span>
                                {getWhatsappErrorDescription(log.failureCode) || log.failureReason || "Message delivery failed"}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {log.firstname || log.lastname ? `${log.firstname} ${log.lastname}` : 'Unknown Customer'}
                            </div>
                            <div className="text-xs text-gray-500">{log.mobileNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                              <Repeat size={12} className={log.retryCount > 0 ? "text-blue-500" : "text-gray-300"} />
                              <span>{log.retryCount || 0} Retries</span>
                            </div>
                            {log.lastAttemptAt && (
                              <div className="text-[10px] text-gray-400">
                                Last: {moment(log.lastAttemptAt).format("MMM DD, HH:mm")}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {log.finalStatus === 'success' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 size={10} /> Success
                            </span>
                          ) : log.finalStatus === 'failed' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                              <AlertCircle size={10} /> Failed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                              <Clock size={10} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-xs text-gray-600 truncate" title={log.messageContent}>
                            {log.messageContent}
                          </p>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded mt-1 inline-block uppercase">
                            {log.messageType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                          {moment(log.timestamp).format("MMM DD, HH:mm")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EngagementDashboard;
