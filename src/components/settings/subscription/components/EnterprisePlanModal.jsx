import { useState } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import api from "../../../../api/apiconfig";
import showToast from "../../../../utils/ToastNotification";

export default function EnterprisePlanModal({ isOpen, onClose }) {
  const [customerLimit, setCustomerLimit] = useState("");
  const [activityLimit, setActivityLimit] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerLimit || !activityLimit) {
      showToast("Please fill in all fields", "error");
      return;
    }

    const customers = parseInt(customerLimit);
    const activities = parseInt(activityLimit);

    if (customers <= 5000 && activities <= 20000) {
      showToast(
        "Enterprise plan requests are only available for more than 5,000 customers or 20,000 activities.",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/enterprise-requests", {
        customerLimit: parseInt(customerLimit),
        activityLimit: parseInt(activityLimit),
      });

      if (response.data.status) {
        showToast(response.data.message, "success");
        onClose();
      }
    } catch (error) {
      console.error("Error submitting enterprise request:", error);
      showToast(
        error.response?.data?.message || "Failed to submit request",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl  overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-pink-700 to-purple-800">
          <h2 className="text-xl font-semibold text-white">Enterprise Plan Request</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Enterprise plans are available for businesses with more than 5,000 customers or 20,000 activities with other features.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Limit 
            </label>
            <input
              type="number"
              value={customerLimit}
              onChange={(e) => setCustomerLimit(e.target.value)}
              placeholder="e.g. 5001"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Limit 
            </label>
            <input
              type="number"
              value={activityLimit}
              onChange={(e) => setActivityLimit(e.target.value)}
              placeholder="e.g. 20001"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-pink-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

EnterprisePlanModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
