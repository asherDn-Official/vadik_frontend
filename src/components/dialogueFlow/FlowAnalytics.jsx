import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  MessageSquare,
  BarChart2,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import api from '../../api/apiconfig';
import showToast from '../../utils/ToastNotification';

const getSubmissionFields = (sub) => {
  const primaryData = sub?.payloadData && Object.keys(sub.payloadData || {}).length > 0
    ? sub.payloadData
    : sub?.responses && Object.keys(sub.responses || {}).length > 0
      ? sub.responses
      : sub?.rawPayload?.data && Object.keys(sub.rawPayload.data || {}).length > 0
        ? sub.rawPayload.data
        : {};

  const filtered = { ...primaryData };
  delete filtered.flow_token;
  delete filtered.status;
  delete filtered.action;
  delete filtered.screen;

  return filtered;
};

const FlowAnalytics = ({ flow, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions');

  useEffect(() => {
    let mounted = true;
    let refreshTimer = null;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/whatsappFlow/analytics/${flow._id}`);
        if (mounted) setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        showToast('Failed to load flow analytics', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (flow?._id) {
      fetchAnalytics();
      refreshTimer = setInterval(fetchAnalytics, 10000);
    }

    return () => {
      mounted = false;
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [flow]);

  const refreshAnalytics = async () => {
    if (!flow?._id) return;
    try {
      setLoading(true);
      const response = await api.get(`/api/whatsappFlow/analytics/${flow._id}`);
      setData(response.data);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
      showToast('Failed to refresh flow analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!data?.submissions?.length) return;
    
    // Get all unique keys from all submissions to build headers
    const allKeys = new Set();
    data.submissions.forEach(sub => {
      Object.keys(getSubmissionFields(sub)).forEach(key => allKeys.add(key));
    });
    
    const headers = ['Date', 'Customer', 'Phone', ...Array.from(allKeys)];
    const csvRows = [headers.join(',')];
    
    data.submissions.forEach(sub => {
      const submissionFields = getSubmissionFields(sub);
      const row = [
        new Date(sub.timestamp).toLocaleString(),
        `"${sub.customerId?.firstname || ''} ${sub.customerId?.lastname || ''}"`,
        sub.customerPhone,
        ...Array.from(allKeys).map(key => `"${submissionFields?.[key] || ''}"`)
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `flow_submissions_${flow.name}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#CB376D] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500">Analyzing flow data...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{flow.name} Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Track submissions and customer responses for this flow</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('submissions')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'submissions' ? 'bg-white text-[#CB376D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Submissions
            </button>
            <button 
              onClick={() => setActiveTab('insights')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'insights' ? 'bg-white text-[#CB376D] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Insights
            </button>
          </div>

          <button 
            onClick={exportToCSV}
            disabled={!data?.submissions?.length}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button 
            onClick={refreshAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-[#CB376D]/10 rounded-xl text-[#CB376D]">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Submissions</div>
              <div className="text-2xl font-bold text-gray-900">{data?.totalSubmissions || 0}</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#CB376D] rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Submission</div>
              <div className="text-sm font-bold text-gray-900">
                {data?.submissions?.[0] ? new Date(data.submissions[0].timestamp).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-bold text-gray-900">Live & Collecting</span>
                </div>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <BarChart2 size={20} />
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-8 pb-8 overflow-hidden">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
          {activeTab === 'submissions' ? (
            <>
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Recent Responses</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Filter size={14} />
                  <span>Filtered by: All Time</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {!data?.submissions?.length ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
                    <MessageSquare size={48} className="mb-4 opacity-20" />
                    <p>No submissions recorded yet for this flow.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Customer</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Responses</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.submissions.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#CB376D]/5 flex items-center justify-center text-[#CB376D]">
                                <User size={14} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">
                                  {sub.customerId ? `${sub.customerId.firstname} ${sub.customerId.lastname}` : 'Anonymous'}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <Phone size={10} />
                                  {sub.customerPhone}
                                </div>
                                {sub.triggerMessage?.content && (
                                  <div className="mt-1 text-[10px] text-gray-500">
                                    Reply: <span className="font-medium text-gray-700">{sub.triggerMessage.content}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {Object.keys(getSubmissionFields(sub)).length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(getSubmissionFields(sub)).map(([key, val], i) => (
                                  <div key={i} className="px-2 py-1 bg-gray-50 rounded border border-gray-100 text-[10px]">
                                    <span className="text-gray-400 font-medium mr-1">{key.replace(/_/g, ' ')}:</span>
                                    <span className="text-gray-700 font-bold">{String(val)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-1 text-[10px] text-gray-500">
                                <div className="font-semibold text-gray-700">No form fields captured</div>
                                <div>Flow token only: {sub.flowToken || sub.responses?.flow_token || 'n/a'}</div>
                                {(sub.screen || sub.rawPayload?.screen) && (
                                  <div>Screen: {sub.screen || sub.rawPayload?.screen}</div>
                                )}
                                {(sub.action || sub.rawPayload?.action) && (
                                  <div>Action: {sub.action || sub.rawPayload?.action}</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(sub.timestamp).toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
               <BarChart2 size={64} className="text-gray-100 mb-6" />
               <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Insights</h3>
               <p className="text-gray-500 max-w-sm">We're aggregating data to provide deeper insights like completion rates, popular choices, and dropout points.</p>
               <button className="mt-8 px-6 py-2 bg-[#CB376D]/10 text-[#CB376D] rounded-xl font-bold text-sm">Enable AI Analysis</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowAnalytics;
