import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
  User,
  Phone,
  MessageSquare,
  BarChart2,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import api from '../../api/apiconfig';
import showToast from '../../utils/ToastNotification';

const COLORS = ['#CB376D', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const getSubmissionFields = (sub) => {
  const primaryData =
    sub?.payloadData && Object.keys(sub.payloadData || {}).length > 0
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

const buildInsights = (submissions) => {
  if (!submissions?.length) return null;

  const fieldCounts = {};
  const fieldValues = {};
  const dateMap = {};
  const customerSet = new Set();

  submissions.forEach((sub) => {
    const fields = getSubmissionFields(sub);
    const phone = sub.customerPhone || 'unknown';
    customerSet.add(phone);

    const day = new Date(sub.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dateMap[day] = (dateMap[day] || 0) + 1;

    Object.entries(fields).forEach(([key, val]) => {
      fieldCounts[key] = (fieldCounts[key] || 0) + 1;
      if (!fieldValues[key]) fieldValues[key] = {};
      const v = String(val).trim();
      fieldValues[key][v] = (fieldValues[key][v] || 0) + 1;
    });
  });

  const dailyTrend = Object.entries(dateMap)
    .map(([date, count]) => ({ date, count }))
    .slice(-14);

  const fieldDistributions = Object.entries(fieldValues).map(([field, values]) => ({
    field,
    data: Object.entries(values)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value })),
  }));

  const submissionsWithFields = submissions.filter((s) => Object.keys(getSubmissionFields(s)).length > 0);

  return {
    uniqueCustomers: customerSet.size,
    dailyTrend,
    fieldDistributions,
    completionRate: submissions.length
      ? Math.round((submissionsWithFields.length / submissions.length) * 100)
      : 0,
    avgFieldsPerSubmission: submissionsWithFields.length
      ? (
          submissionsWithFields.reduce((acc, s) => acc + Object.keys(getSubmissionFields(s)).length, 0) /
          submissionsWithFields.length
        ).toFixed(1)
      : 0,
  };
};

const FlowAnalytics = ({ flow, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('submissions');

  const fetchAnalytics = useCallback(
    async (isRefresh = false) => {
      if (!flow?._id) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const response = await api.get(`/api/whatsappFlow/analytics/${flow._id}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        showToast('Failed to load flow analytics', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [flow]
  );

  useEffect(() => {
    fetchAnalytics(false);
  }, [fetchAnalytics]);

  const exportToCSV = () => {
    if (!data?.submissions?.length) return;
    const allKeys = new Set();
    data.submissions.forEach((sub) => {
      Object.keys(getSubmissionFields(sub)).forEach((key) => allKeys.add(key));
    });
    const headers = ['Date', 'Customer', 'Phone', ...Array.from(allKeys)];
    const csvRows = [headers.join(',')];
    data.submissions.forEach((sub) => {
      const fields = getSubmissionFields(sub);
      const row = [
        new Date(sub.timestamp).toLocaleString(),
        `"${sub.customerId ? `${sub.customerId.firstname} ${sub.customerId.lastname}` : 'Anonymous'}"`,
        sub.customerPhone,
        ...Array.from(allKeys).map((key) => `"${fields?.[key] || ''}"`),
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
        <p className="text-sm font-medium text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  const insights = buildInsights(data?.submissions);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{flow.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Track submissions and customer responses for this flow</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {['submissions', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  activeTab === tab ? 'bg-white text-[#CB376D] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all shadow-sm"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={!data?.submissions?.length}
              className="flex items-center gap-2 px-4 py-2 bg-[#CB376D] text-white rounded-lg text-sm font-bold hover:bg-[#b02e5d] disabled:opacity-50 transition-all shadow-sm"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 pt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<CheckCircle2 size={20} />}
          color="pink"
          label="Total Submissions"
          value={data?.totalSubmissions || 0}
        />
        <StatCard
          icon={<Users size={20} />}
          color="blue"
          label="Unique Customers"
          value={insights?.uniqueCustomers || 0}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          color="emerald"
          label="Form Completion"
          value={`${insights?.completionRate || 0}%`}
        />
        <StatCard
          icon={<Clock size={20} />}
          color="amber"
          label="Last Submission"
          value={
            data?.submissions?.[0]
              ? new Date(data.submissions[0].timestamp).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })
              : 'Never'
          }
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-8 pt-5 overflow-auto">
        {activeTab === 'submissions' ? (
          <SubmissionsTab submissions={data?.submissions} />
        ) : (
          <InsightsTab insights={insights} submissions={data?.submissions} />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }) => {
  const colorMap = {
    pink: 'bg-[#CB376D]/10 text-[#CB376D]',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
        <div className="text-xl font-bold text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
};

const SubmissionsTab = ({ submissions }) => {
  if (!submissions?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
        <MessageSquare size={48} className="mb-4 opacity-20" />
        <p className="font-semibold text-gray-500">No submissions recorded yet</p>
        <p className="text-sm mt-1">When customers complete this flow, responses will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <FileText size={16} className="text-[#CB376D]" />
          Recent Responses
        </h3>
        <span className="text-xs text-gray-400 font-medium">{submissions.length} total</span>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                Customer
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                Responses
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {submissions.map((sub, idx) => {
              const fields = getSubmissionFields(sub);
              const hasFields = Object.keys(fields).length > 0;
              return (
                <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#CB376D]/10 flex items-center justify-center text-[#CB376D] font-bold text-sm flex-shrink-0">
                        {(sub.customerId?.firstname || 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {sub.customerId
                            ? `${sub.customerId.firstname} ${sub.customerId.lastname}`
                            : 'Anonymous'}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone size={9} />
                          {sub.customerPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    {hasFields ? (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(fields).map(([key, val], i) => (
                          <div
                            key={i}
                            className="px-2.5 py-1 bg-[#CB376D]/5 border border-[#CB376D]/10 rounded-lg text-[11px]"
                          >
                            <span className="text-gray-400 font-medium mr-1 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-gray-800 font-bold">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                        <span className="text-xs text-gray-500 italic">Flow completed</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-medium text-gray-500 flex items-center gap-1 whitespace-nowrap">
                      <Calendar size={11} />
                      {new Date(sub.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InsightsTab = ({ insights, submissions }) => {
  if (!insights || !submissions?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-gray-400">
        <BarChart2 size={48} className="mb-4 opacity-20" />
        <p className="font-semibold text-gray-500">No data to analyze yet</p>
        <p className="text-sm mt-1">Insights will appear once customers start submitting this flow.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-[#CB376D] to-[#e05a8a] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80">Form Completion Rate</div>
          <div className="text-4xl font-bold mt-1">{insights.completionRate}%</div>
          <div className="text-xs opacity-70 mt-1">
            {insights.avgFieldsPerSubmission} avg fields per submission
          </div>
        </div>
        <Award size={56} className="opacity-20" />
      </div>

      {/* Daily Trend */}
      {insights.dailyTrend?.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#CB376D]" />
            Submission Trend
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={insights.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#CB376D"
                strokeWidth={2}
                dot={{ fill: '#CB376D', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Field Distributions */}
      {insights.fieldDistributions?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {insights.fieldDistributions.map((fd, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-1 capitalize">{fd.field.replace(/_/g, ' ')}</h3>
              <p className="text-[10px] text-gray-400 mb-4 uppercase tracking-widest">Response Distribution</p>
              {fd.data.length <= 4 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={fd.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {fd.data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={fd.data} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {fd.data.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
          <BarChart2 size={36} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-gray-500">No form field responses yet</p>
          <p className="text-xs mt-1">Once customers submit form fields, breakdowns will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FlowAnalytics;
