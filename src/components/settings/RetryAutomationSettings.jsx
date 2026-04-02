import { useState, useEffect } from "react";
import api from "../../api/apiconfig";
import { FiSave, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const RetryAutomationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    retryAutomationEnabled: false,
    retryDelayDays: 3,
    maxRetryAttempts: 2,
    retryConditions: {
      failed: true,
      notDelivered: true,
      rateLimit: false,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/retryAutomation/settings", {
        withCredentials: true,
      });
      if (response.data.status) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching retry settings:", error);
      toast.error("Failed to load retry settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await api.put("/api/retryAutomation/settings", settings, {
        withCredentials: true,
      });
      if (response.data.status) {
        toast.success("Retry settings saved successfully");
      }
    } catch (error) {
      console.error("Error saving retry settings:", error);
      toast.error("Failed to save retry settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiRefreshCw className="animate-spin text-2xl text-[#313166]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#313166] mb-2">Retry Automation</h2>
        <p className="text-gray-500 text-sm">
          Automatically retry sending failed WhatsApp messages after a specified delay.
        </p>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#313166] font-medium block">Enable Retry Automation</span>
            <span className="text-xs text-gray-400">Turn on automatic retries for failed messages</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={settings.retryAutomationEnabled}
              onChange={(e) => setSettings({ ...settings, retryAutomationEnabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#313166]"></div>
          </label>
        </div>

        <div className={`space-y-6 transition-opacity duration-200 ${!settings.retryAutomationEnabled ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {/* Retry Delay */}
          <div className="flex flex-col gap-2">
            <label className="text-[#313166] text-sm font-medium">Retry After (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              className="w-full md:w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#313166]/20 transition-all"
              value={settings.retryDelayDays}
              onChange={(e) => setSettings({ ...settings, retryDelayDays: parseInt(e.target.value) || 1 })}
            />
            <p className="text-xs text-gray-400">Wait X days before attempting the first retry.</p>
          </div>

          {/* Max Attempts */}
          <div className="flex flex-col gap-2">
            <label className="text-[#313166] text-sm font-medium">Max Retry Attempts</label>
            <input
              type="number"
              min="1"
              max="5"
              className="w-full md:w-1/3 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#313166]/20 transition-all"
              value={settings.maxRetryAttempts}
              onChange={(e) => setSettings({ ...settings, maxRetryAttempts: parseInt(e.target.value) || 1 })}
            />
            <p className="text-xs text-gray-400">Maximum number of times to retry a failed message.</p>
          </div>

          {/* Retry Conditions */}
          <div className="space-y-3">
            <label className="text-[#313166] text-sm font-medium block">Retry Only For:</label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#313166] border-gray-300 focus:ring-[#313166]"
                checked={settings.retryConditions.failed}
                onChange={(e) => setSettings({
                  ...settings,
                  retryConditions: { ...settings.retryConditions, failed: e.target.checked }
                })}
              />
              <span className="text-sm text-gray-600 group-hover:text-[#313166]">Failed messages (Meta errors)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#313166] border-gray-300 focus:ring-[#313166]"
                checked={settings.retryConditions.notDelivered}
                onChange={(e) => setSettings({
                  ...settings,
                  retryConditions: { ...settings.retryConditions, notDelivered: e.target.checked }
                })}
              />
              <span className="text-sm text-gray-600 group-hover:text-[#313166]">Not delivered (after 24h)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-[#313166] border-gray-300 focus:ring-[#313166]"
                checked={settings.retryConditions.rateLimit}
                onChange={(e) => setSettings({
                  ...settings,
                  retryConditions: { ...settings.retryConditions, rateLimit: e.target.checked }
                })}
              />
              <span className="text-sm text-gray-600 group-hover:text-[#313166]">Rate limit errors</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-[#313166] text-white rounded-lg hover:bg-[#313166]/90 transition-all disabled:opacity-50"
          >
            {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
        <FiAlertCircle className="text-blue-500 mt-1 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>Note:</strong> Retry automation only applies to messages sent via Meta WhatsApp Template API. 
          Retries will respect your current credit balance and messaging limits. 
          Messages will not be retried if the user has blocked your business or the number is invalid.
        </p>
      </div>
    </div>
  );
};

export default RetryAutomationSettings;
