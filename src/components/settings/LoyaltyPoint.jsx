import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import api from "../../api/apiconfig";
import Loader from "../../utils/Loader";
import showToast from "../../utils/ToastNotification";
import deleteConfirmTostNotification from "../../utils/deleteConfirmTostNotification";
import VideoPopupWithShare from "../common/VideoPopupWithShare";
import { FaCoins } from "react-icons/fa";

function LoyaltyPoint() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // React Hook Form initialization
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      isActive: true,
      points: 100,
      rupees: 10,
    },
    mode: "onChange",
  });

  const watchPoints = watch("points", 100);
  const watchRupees = watch("rupees", 10);
  const watchIsActive = watch("isActive", true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/loyalty/rule");
      if (response.data) {
        setRules(response.data);
        reset({
          isActive: response.data.isActive ?? true,
          points: response.data.points ?? 100,
          rupees: response.data.rupees ?? 10,
        });
      }
    } catch (err) {
      setError("Failed to fetch loyalty rules");
      console.error("Error fetching rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/loyalty/rule", data);
      showToast("Loyalty rules saved successfully!", "success");
      await fetchRules(); // Refresh the data
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to save loyalty rules";
      showToast(errorMessage, "error");
      console.error("Error saving rules:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const onConfirm = async () => {
      try {
        await api.delete("/api/loyalty/rule");
        showToast("Loyalty rules reset to defaults!", "success");
        setRules(null);
        reset({
          isActive: true,
          points: 100,
          rupees: 10,
        });
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to reset loyalty rules";
        showToast(errorMessage, "error");
        console.error("Error deleting rules:", err);
      }
    };

    deleteConfirmTostNotification("This will reset your loyalty settings to default.", onConfirm);
  };

  if (loading) {
    return <Loader text="Loading loyalty rules..." />;
  }

  // Calculate rate preview (e.g. 1 point = 0.1 rupees)
  const rupeePerPoint = watchPoints > 0 ? (watchRupees / watchPoints).toFixed(4) : 0;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#313166] flex items-center gap-2">
                <FaCoins className="text-yellow-500 animate-pulse" />
                Loyalty Point Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">Configure your business conversion rate for loyalty points</p>
            </div>

            <VideoPopupWithShare
              video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ"
              buttonCss="flex items-center text-sm gap-2 px-4 py-2 text-gray-700 bg-white rounded border border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
            />
          </div>

          {/* Content */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Active Toggle Card */}
              <div className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
                <div>
                  <h3 className="font-semibold text-gray-900">Enable Loyalty Program</h3>
                  <p className="text-sm text-gray-500">Enable or disable loyalty rewards for your customers</p>
                </div>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#EC396F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#EC396F]"></div>
                    </label>
                  )}
                />
              </div>

              {/* Conversion Rules Panel */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-lg font-semibold text-[#313166]">Simple Point Conversion</h3>
                <p className="text-sm text-gray-500 -mt-4">Define how points translate into cash or discount value.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Points Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points Value
                    </label>
                    <div className="relative">
                      <Controller
                        name="points"
                        control={control}
                        rules={{
                          required: "Points amount is required",
                          min: {
                            value: 1,
                            message: "Points must be at least 1"
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full px-4 py-2.5 outline-none border border-gray-300 rounded-xl focus:border-[#EC396F] focus:ring-1 focus:ring-[#EC396F] transition-all"
                            placeholder="e.g. 100"
                          />
                        )}
                      />
                      {errors.points && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.points.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Rupees Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rupee Value (₹)
                    </label>
                    <div className="relative">
                      <Controller
                        name="rupees"
                        control={control}
                        rules={{
                          required: "Rupee equivalent is required",
                          min: {
                            value: 0,
                            message: "Rupees cannot be negative"
                          }
                        }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="number"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full px-4 py-2.5 outline-none border border-gray-300 rounded-xl focus:border-[#EC396F] focus:ring-1 focus:ring-[#EC396F] transition-all"
                            placeholder="e.g. 10"
                          />
                        )}
                      />
                      {errors.rupees && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.rupees.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Interactive Dynamic Preview Card */}
                <div className="bg-[#FFF8FA] border border-[#FEE2E2] rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FEE2E2] p-2 rounded-xl text-[#EC396F]">
                      <FaCoins size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Conversion rate formula</p>
                      <p className="text-base font-bold text-[#313166]">
                        {watchPoints} Points = ₹{watchRupees} Rupees
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-right text-sm">
                    <p className="text-xs text-gray-400">Value per Point</p>
                    <p className="font-semibold text-gray-700">₹{rupeePerPoint}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#313166] text-white py-3 px-6 rounded-xl font-medium hover:bg-[#252451] focus:outline-none focus:ring-2 focus:ring-[#313166] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving Rules...
                    </>
                  ) : (
                    "Save Conversion Rate"
                  )}
                </button>

                {rules && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="sm:w-1/3 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all focus:outline-none"
                  >
                    Reset Settings
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoyaltyPoint;
