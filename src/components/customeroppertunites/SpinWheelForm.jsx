import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import SpinWheelPreview from "./SpinWheelPreview";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const SpinWheelForm = ({ campaign, onSave, onCancel }) => {
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    noOfSpins: 0,
    couponOptions: [],
    targetedCoupons: [],
    expiryDate: "",
    allocatedQuizCampainId: "", // selected quiz campaign _id
    isActive: true,
    segments: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/api/coupons/all");
        const list = response.data?.data || [];
        setCoupons(list);
        setLoadingCoupons(false);

        // Default select first targeted coupon if none selected
        if (list.length > 0) {
          setFormData((prev) => {
            if (Array.isArray(prev.targetedCoupons) && prev.targetedCoupons.length > 0) return prev;
            return { ...prev, targetedCoupons: [list[0]._id] };
          });
          setErrors((prev) => {
            const next = { ...prev };
            delete next.targetedCoupons;
            return next;
          });
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoadingCoupons(false);
      }
    };

    fetchCoupons();
  }, []);

  // Fetch quizzes for "Select Blog" dropdown
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("https://app.vadik.ai/api/quiz");
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
        setQuizzes(list);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        showToast(error?.response?.data?.message || "Failed to load quizzes", "error");
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Ensure selected quiz (by allocatedQuizCampainId) is present in dropdown by fetching its details
  useEffect(() => {
    const selectedId = formData?.allocatedQuizCampainId;
    if (!selectedId) return;
    if (quizzes?.some((q) => q?._id === selectedId)) return; // already in list

    const fetchSelectedQuiz = async () => {
      try {
        const res = await api.get(`/quiz/${selectedId}`);
        const data = res?.data;
        if (data && data._id) {
          setQuizzes((prev) => [{ ...data }, ...(Array.isArray(prev) ? prev : [])]);
        }
      } catch (error) {
        console.error("Error fetching selected quiz:", error);
      }
    };

    fetchSelectedQuiz();
  }, [formData?.allocatedQuizCampainId, quizzes]);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name ?? "",
        noOfSpins: campaign.noOfSpins ?? 0,
        couponOptions: Array.isArray(campaign.couponOptions) ? campaign.couponOptions : [],
        targetedCoupons: Array.isArray(campaign.targetedCoupons) ? campaign.targetedCoupons : [],
        isActive: typeof campaign.isActive === 'boolean' ? campaign.isActive : true,
        expiryDate: campaign.expiryDate ? campaign.expiryDate.slice(0, 10) : "",
        allocatedQuizCampainId: campaign.allocatedQuizCampainId ?? "",
        segments: Array.isArray(campaign.segments) ? campaign.segments : [],
        _id: campaign._id,
      });
    }
  }, [campaign]);

  const colors = [
    "#E91E63",
    "#FF4081",
    "#F06292",
    "#EC407A",
    "#E91E63",
    "#AD1457",
    "#C2185B",
    "#D81B60",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field-specific error when user types a valid-like value
    setErrors((prev) => {
      const next = { ...prev };
      if (field === 'name' && value?.trim()) delete next.name;
      if (field === 'noOfSpins' && Number(value) >= 1) delete next.noOfSpins;
      if (field === 'expiryDate' && value) delete next.expiryDate;
      return next;
    });
  };

  const handleSegmentChange = (segmentId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.map((s) =>
        s.id === segmentId ? { ...s, [field]: value } : s
      ),
    }));
    // Clear coupons/table validation if at least two couponIds are present
    setErrors((prev) => {
      const next = { ...prev };
      const count = (formData.segments || [])
        .map((s) => (s.id === segmentId ? value : s.couponId))
        .filter((id) => id && String(id).trim().length > 0).length;
      if (field === 'couponId' && count >= 3) delete next.segments;
      return next;
    });
  };

  const addSegment = () => {
    const newSegment = {
      id: Date.now(),
      productName: "",
      offer: "0.00",
      color: colors[formData?.segments?.length % colors.length],
      image: null,
      couponId: "",
    };
    setFormData((prev) => ({
      ...prev,
      segments: [...(prev?.segments || []), newSegment],
      noOfSpins: (prev?.segments?.length || 0) + 1,
    }));
    // If after adding we reach 2 segments and both selected, clear error handled elsewhere
  };

  const removeSegment = (segmentId) => {
    if (formData?.segments?.length > 1) {
      setFormData((prev) => ({
        ...prev,
        segments: prev.segments.filter((s) => s.id !== segmentId),
        noOfSpins: prev.segments.length - 1,
      }));
    }
  };

  const handleCouponSelect = async (segmentId, couponId) => {
    if (!couponId) {
      // If cleared selection, re-validate
      setFormData((prev) => ({
        ...prev,
        segments: prev.segments.map(s =>
          s.id === segmentId ? { ...s, couponId: "", productName: "", offer: "0.00", couponType: undefined } : s
        )
      }));
      return;
    }

    try {
      // Fetch coupon details using provided API to auto-fill row
      const res = await api.post("/api/coupons/couponforCampains", { coupons: couponId });
      const data = res?.data?.data || {};

      setFormData((prev) => ({
        ...prev,
        segments: prev.segments.map(s =>
          s.id === segmentId ? {
            ...s,
            couponId,
            productName: data.name || "",
            offer: String(data.discount ?? "0"),
            couponType: data.couponType,
          } : s
        )
      }));

      // Clear table validation if at least 3 coupons selected
      setErrors((prev) => {
        const next = { ...prev };
        const count = (formData.segments || [])
          .map((s) => (s.id === segmentId ? couponId : s.couponId))
          .filter((id) => id && String(id).trim().length > 0).length;
        if (count >= 3) delete next.segments;
        return next;
      });
    } catch (error) {
      console.error("Failed to fetch coupon details", error);
      showToast(error?.response?.data?.message || "Failed to fetch coupon details", "error");
    }
  };

  const handleTargetedCouponChange = (couponId) => {
    // Enforce exactly one targeted coupon selected
    setFormData((prev) => ({
      ...prev,
      targetedCoupons: [couponId],
    }));

    // Clear targeted coupon validation once selected
    setErrors((prev) => {
      const next = { ...prev };
      delete next.targetedCoupons;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";

    const noOfSpinsNum = Number(formData.noOfSpins);
    if (!Number.isInteger(noOfSpinsNum) || noOfSpinsNum < 1)
      newErrors.noOfSpins = "No Of Spins must be at least 1";

    if (!formData.expiryDate) newErrors.expiryDate = "Expiry Date is required";

    if (!Array.isArray(formData.targetedCoupons) || formData.targetedCoupons.length === 0)
      newErrors.targetedCoupons = "Select at least one targeted coupon";

    const validCouponIds = (formData.segments || [])
      .map((s) => s.couponId)
      .filter((id) => id && String(id).trim().length > 0);

    if (validCouponIds.length < 3)
      newErrors.segments = "Minimum 3 coupons in the table";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Convert YYYY-MM-DD to ISO midnight
    const expiryIso = formData.expiryDate ? `${formData.expiryDate}T00:00:00.000Z` : "";

    const payload = {
      name: formData.name.trim(),
      noOfSpins: noOfSpinsNum,
      couponOptions: validCouponIds,
      targetedCoupons: formData.targetedCoupons,
      isActive: formData.isActive,
      allocatedQuizCampainId: formData.allocatedQuizCampainId || "",
      expiryDate: expiryIso,
    };

    try {
      if (formData._id) {
        // Update existing spin wheel
        await api.put(`/api/spinWheels/${formData._id}`, payload);
        showToast("Spin wheel updated successfully!", "success");
      } else {
        // Create new spin wheel
        await api.post("/api/spinWheels", payload);
        showToast("Spin wheel created successfully!", "success");
      }
      onSave();
    } catch (error) {
      showToast(error.response?.data?.message || "Request failed", "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Spin Wheel</h2>
        <p className="text-gray-600">
          Add excitement with a spin-to-win experience that keeps your customers
          engaged and coming back.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div>
            <SpinWheelPreview segments={formData.segments} />
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                placeholder="Enter Campaign Name"
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Of Spins
              </label>
              <input
                type="number"
                value={formData.noOfSpins}
                onChange={(e) =>
                  handleInputChange("noOfSpins", parseInt(e.target.value || '0', 10))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.noOfSpins ? 'border-red-500' : 'border-gray-300'}`}
                // min="1"
                // max="4"
              />
              {errors.noOfSpins && <p className="mt-1 text-sm text-red-600">{errors.noOfSpins}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData?.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
            </div>

            {/* Select  (Quiz Campaign) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quiz
              </label>
              <select
                value={formData.allocatedQuizCampainId || ""}
                onChange={(e) => handleInputChange("allocatedQuizCampainId", e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none border-gray-300"
                disabled={loadingQuizzes}
              >
                <option value="">{loadingQuizzes ? "Loading..." : "Select Quiz"}</option>
                {!loadingQuizzes && quizzes?.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.campaignName}
                  </option>
                ))}
              </select>
            </div>

            {formData?.targetedCoupons?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Targeted Coupons
                </label>
                <div className="space-y-2">
                  {coupons?.filter(c => formData.targetedCoupons.includes(c._id)).map(coupon => (
                    <div key={coupon._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetedCoupons.includes(coupon._id)}
                        onChange={(e) => handleTargetedCouponChange(coupon._id, e.target.checked)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {coupon.name} ({coupon.code})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Segments Table */}
        {formData?.segments?.length > 0 ? (
          <div className="overflow-x-auto mt-8">
            {errors.segments && (
              <p className="mb-2 text-sm text-red-600">{errors.segments}</p>
            )}
            <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    S.no
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Coupon
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product Name
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Offer %
                  </th>
                  {/* <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Add Image
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Choose Color
                  </th> */}
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData?.segments?.map((segment, index) => (
                  <tr key={segment.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 text-sm">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      {loadingCoupons ? (
                        <div className="text-sm text-gray-500">Loading coupons...</div>
                      ) : (
                        <select
                          value={segment.couponId}
                          onChange={(e) => handleCouponSelect(segment.id, e.target.value)}
                          className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                        >
                          <option value="">Select Coupon</option>
                          {coupons?.map((coupon) => (
                            <option key={coupon._id} value={coupon._id}>
                              {coupon.name} ({coupon.code})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <input
                        type="text"
                        placeholder="Enter Product Name"
                        value={segment.productName}
                        onChange={(e) =>
                          handleSegmentChange(
                            segment.id,
                            "productName",
                            e.target.value
                          )
                        }
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                      />
                    </td>
                    <td className="border border-gray-200 px-4 py-3">
                      <input
                        type="text"
                        value={segment.offer + " %"}
                        onChange={(e) =>
                          handleSegmentChange(
                            segment.id,
                            "offer",
                            e.target.value.replace(" %", "")
                          )
                        }
                        disabled={true}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                      />
                    </td>

                    <td className="border border-gray-200 px-4 py-3">
                      {formData?.segments?.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSegment(segment.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-gray-300 rounded-lg p-8 text-center">
            {errors.segments && (
              <p className="mb-2 text-sm text-red-600">{errors.segments}</p>
            )}
            <p className="text-gray-500 mb-3">No spins added yet.</p>
            <button
              type="button"
              onClick={addSegment}
              className="inline-flex items-center px-4 py-2 text-pink-600 hover:text-pink-700 transition-colors"
            >
              Add first Spin <Plus className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={addSegment}
            className="flex items-center px-4 py-2 text-pink-600 hover:text-pink-700 transition-colors"
          >
            Add Spin <Plus className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Targeted Coupons</h3>
          <p className="text-sm text-gray-500 mb-2">
            Select coupons that will be targeted for this spin wheel campaign.
          </p>
          {errors.targetedCoupons && (
            <p className="mb-2 text-sm text-red-600">{errors.targetedCoupons}</p>
          )}
          {loadingCoupons ? (
            <div>Loading coupons...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <label key={coupon._id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="targetedCoupons"
                    checked={formData?.targetedCoupons?.includes(coupon._id)}
                    onChange={() => handleTargetedCouponChange(coupon._id)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">{coupon.name}</div>
                    <div className="text-xs text-gray-500">
                      {coupon.code} - {coupon.discount}{coupon.couponType === 'percentage' ? '%' : '₹'} off
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            {campaign ? 'Save Spin Wheel' : 'Create Spin Wheel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpinWheelForm;