import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { X, Plus } from "lucide-react";
import SpinWheelPreview from "./SpinWheelPreview";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import Quiz from "./Quiz";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const SpinWheelForm = ({ campaign, onSave, onCancel }) => {
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [isQuizePopupOpen, setIsQuizePopupOpen] = useState(false);



  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
    setError,
    clearErrors,
    trigger
  } = useForm({
    defaultValues: {
      name: "",
      noOfSpins: 0,
      couponOptions: [],
      targetedCoupons: [],
      expiryDate: "",
      allocatedQuizCampainId: "",
      isActive: true,
      segments: [],
    },
    mode: "onChange",
  });

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

  const formData = watch();

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/api/coupons/all");
        const list = response.data?.data || [];
        setCoupons(list);
        setLoadingCoupons(false);

        // Default select first targeted coupon if none selected
        if (list.length > 0) {
          const currentTargeted = getValues("targetedCoupons");
          if (!currentTargeted || currentTargeted.length === 0) {
            setValue("targetedCoupons", [list[0]._id]);
            clearErrors("targetedCoupons");
          }
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoadingCoupons(false);
      }
    };

    fetchCoupons();
  }, [getValues, setValue, clearErrors]);


  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/api/quiz?fully=true");
      const list = Array.isArray(res?.data) ? res.data : (res?.data?.docs || []);
      setQuizzes(list);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      showToast(error?.response?.data?.message || "Failed to load quizzes", "error");
    } finally {
      setLoadingQuizzes(false);
    }
  };
  useEffect(() => {
    fetchQuizzes();
  }, [isQuizePopupOpen]);


  // Ensure selected quiz (by allocatedQuizCampainId) is present in dropdown by fetching its details
  useEffect(() => {
    const selectedId = getValues("allocatedQuizCampainId");
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
  }, [getValues, quizzes]);

  useEffect(() => {
    if (campaign) {
      const {
        name,
        noOfSpins,
        couponOptions,
        targetedCoupons,
        isActive,
        expiryDate,
        allocatedQuizCampainId,
        segments,
        _id
      } = campaign;

      setValue("name", name ?? "");
      setValue("noOfSpins", noOfSpins ?? 0);
      setValue("couponOptions", Array.isArray(couponOptions) ? couponOptions : []);
      setValue("targetedCoupons", Array.isArray(targetedCoupons) ? targetedCoupons : []);
      setValue("isActive", typeof isActive === 'boolean' ? isActive : true);
      // Convert incoming ISO/string to Date object for DatePicker
      setValue("expiryDate", expiryDate ? new Date(expiryDate) : null);
      setValue("allocatedQuizCampainId", allocatedQuizCampainId ?? "");
      setValue("segments", Array.isArray(segments) ? segments : []);
      setValue("_id", _id);
    }
  }, [campaign, setValue]);

  const handleSegmentChange = (segmentId, field, value) => {
    const updatedSegments = formData.segments.map((s) =>
      s.id === segmentId ? { ...s, [field]: value } : s
    );
    setValue("segments", updatedSegments);

    // Clear segments validation if at least three couponIds are present
    const count = updatedSegments
      .map((s) => s.couponId)
      .filter((id) => id && String(id).trim().length > 0).length;

    if (count >= 3) {
      clearErrors("segments");
    }
  };

  const addSegment = () => {
    const newSegment = {
      id: Date.now(),
      productName: "",
      offer: "0.00",
      color: colors[formData.segments?.length % colors.length],
      image: null,
      couponId: "",
    };

    const updatedSegments = [...(formData.segments || []), newSegment];
    setValue("segments", updatedSegments);
    setValue("noOfSpins", updatedSegments.length);
  };

  const removeSegment = (segmentId) => {
    if (formData.segments?.length > 1) {
      const updatedSegments = formData.segments.filter((s) => s.id !== segmentId);
      setValue("segments", updatedSegments);
      setValue("noOfSpins", updatedSegments.length);
    }
  };

  const handleCouponSelect = async (segmentId, couponId) => {
    if (!couponId) {
      // If cleared selection, re-validate
      const updatedSegments = formData.segments.map(s =>
        s.id === segmentId ? { ...s, couponId: "", productName: "", offer: "0.00", couponType: undefined } : s
      );
      setValue("segments", updatedSegments);
      return;
    }

    try {
      // Fetch coupon details using provided API to auto-fill row
      const res = await api.post("/api/coupons/couponforCampains", { coupons: couponId });
      const data = res?.data?.data || {};

      const updatedSegments = formData.segments.map(s =>
        s.id === segmentId ? {
          ...s,
          couponId,
          productName: data.name || "",
          offer: String(data.discount ?? "0"),
          couponType: data.couponType,
        } : s
      );

      setValue("segments", updatedSegments);

      // Clear table validation if at least 3 coupons selected
      const count = updatedSegments
        .map((s) => s.couponId)
        .filter((id) => id && String(id).trim().length > 0).length;

      if (count >= 3) {
        clearErrors("segments");
      }
    } catch (error) {
      console.error("Failed to fetch coupon details", error);
      showToast(error?.response?.data?.message || "Failed to fetch coupon details", "error");
    }
  };

  const handleTargetedCouponChange = (couponId) => {
    // Enforce exactly one targeted coupon selected
    setValue("targetedCoupons", [couponId]);
    clearErrors("targetedCoupons");
  };

  const onSubmit = async (data) => {
    // Additional validation for segments
    const validCouponIds = (data.segments || [])
      .map((s) => s.couponId)
      .filter((id) => id && String(id).trim().length > 0);

    if (validCouponIds.length < 3) {
      setError("segments", {
        type: "manual",
        message: "Minimum 3 coupons in the table"
      });
      return;
    }

    // Convert Date to ISO midnight in UTC
    const expiryIso = data.expiryDate ? `${format(data.expiryDate, "yyyy-MM-dd")}T00:00:00.000Z` : "";

    const payload = {
      name: data.name.trim(),
      noOfSpins: Number(data.noOfSpins),
      couponOptions: validCouponIds,
      targetedCoupons: data.targetedCoupons,
      isActive: data.isActive,
      allocatedQuizCampainId: data.allocatedQuizCampainId || "",
      expiryDate: expiryIso,
    };

    try {
      if (data._id) {
        // Update existing spin wheel
        await api.put(`/api/spinWheels/${data._id}`, payload);
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

      <form onSubmit={handleSubmit(onSubmit)}>
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
                placeholder="Enter Campaign Name"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Name must be less than or equal to 50 characters"
                  }
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Of Spins
              </label>
              <input
                type="number"
                {...register("noOfSpins", {
                  required: "No Of Spins is required",
                  min: {
                    value: 1,
                    message: "No Of Spins must be at least 1"
                  },
                  valueAsNumber: true
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.noOfSpins ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.noOfSpins && <p className="mt-1 text-sm text-red-600">{errors.noOfSpins.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <Controller
                name="expiryDate"
                control={control}
                rules={{ required: "Expiry Date is required" }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                    minDate={new Date()}
                    wrapperClassName="w-full"
                    isClearable
                  />
                )}
              />
              {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>}
            </div>

            {/* Select (Quiz Campaign) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quiz
              </label>
              <Controller
                name="allocatedQuizCampainId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
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
                )}
              />
              <div className="text-sm text-blue-900 cursor-pointer text-end  underline" onClick={() => setIsQuizePopupOpen(true)}
              >
                Create Quize
              </div>

            </div>

            {formData.targetedCoupons?.length > 0 && (
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
        {formData.segments?.length > 0 ? (
          <div className="overflow-x-auto mt-8">
            {errors.segments && (
              <p className="mb-2 text-sm text-red-600">{errors.segments.message}</p>
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
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.segments?.map((segment, index) => (
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
                      {formData.segments?.length > 1 && (
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
              <p className="mb-2 text-sm text-red-600">{errors.segments.message}</p>
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
            <p className="mb-2 text-sm text-red-600">{errors.targetedCoupons.message}</p>
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
                    checked={formData.targetedCoupons?.includes(coupon._id)}
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


      {isQuizePopupOpen && (
        <div onClick={() => setIsQuizePopupOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 flex items-center  justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <Quiz backButton={true} onClose={() => setIsQuizePopupOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheelForm;