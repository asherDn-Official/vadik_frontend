import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import SpinWheelPreview from "./SpinWheelPreview";
import api from "../../api/apiconfig";

const SpinWheelForm = ({ campaign, onSave, onCancel }) => {
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [formData, setFormData] = useState({
    name: "Our Spin",
    noOfSpins: 3,
    couponOptions: [],
    targetedCoupons: [],
    isActive: true,
    expiryDate: "",
    segments: [
      {
        id: 1,
        productName: "Premium Wireless Headphones",
        offer: "12",
        color: "#E91E63",
        image: null,
        couponId: "",
      },
      { 
        id: 2, 
        productName: "", 
        offer: "0.00", 
        color: "#FF4081", 
        image: null,
        couponId: "" 
      },
      { 
        id: 3, 
        productName: "", 
        offer: "0.00", 
        color: "#E91E63", 
        image: null,
        couponId: "" 
      },
    ],
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/api/coupons/all");
        setCoupons(response.data.data);
        setLoadingCoupons(false);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoadingCoupons(false);
      }
    };

    fetchCoupons();
  }, []);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || "Our Spin",
        noOfSpins: campaign.noOfSpins || 3,
        couponOptions: campaign.couponOptions || [],
        targetedCoupons: campaign.targetedCoupons || [],
        isActive: campaign.isActive !== undefined ? campaign.isActive : true,
        expiryDate: campaign.expiryDate || "",
        segments: campaign.segments || [
          {
            id: 1,
            productName: "Premium Wireless Headphones",
            offer: "12",
            color: "#E91E63",
            image: null,
            couponId: "",
          },
          { id: 2, productName: "", offer: "0.00", color: "#FF4081", image: null, couponId: "" },
          { id: 3, productName: "", offer: "0.00", color: "#E91E63", image: null, couponId: "" },
        ],
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
  };

  const handleSegmentChange = (segmentId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.map((s) =>
        s.id === segmentId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const handleImageUpload = (segmentId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSegmentChange(segmentId, "image", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSegment = () => {
    const newSegment = {
      id: Date.now(),
      productName: "",
      offer: "0.00",
      color: colors[formData.segments.length % colors.length],
      image: null,
      couponId: "",
    };
    setFormData((prev) => ({
      ...prev,
      segments: [...prev.segments, newSegment],
      noOfSpins: prev.segments.length + 1,
    }));
  };

  const removeSegment = (segmentId) => {
    if (formData.segments.length > 1) {
      setFormData((prev) => ({
        ...prev,
        segments: prev.segments.filter((s) => s.id !== segmentId),
        noOfSpins: prev.segments.length - 1,
      }));
    }
  };

  const handleCouponSelect = (segmentId, couponId) => {
    const selectedCoupon = coupons.find(c => c._id === couponId);
    if (selectedCoupon) {
      setFormData((prev) => ({
        ...prev,
        segments: prev.segments.map(s => 
          s.id === segmentId ? { 
            ...s, 
            couponId: couponId,
            productName: selectedCoupon.name,
            offer: selectedCoupon.discount.toString(),
            couponType: selectedCoupon.couponType
          } : s
        )
      }));
    }
  };

  const handleTargetedCouponChange = (couponId, isChecked) => {
    setFormData((prev) => {
      let newTargetedCoupons = [...prev.targetedCoupons];
      if (isChecked) {
        newTargetedCoupons.push(couponId);
      } else {
        newTargetedCoupons = newTargetedCoupons.filter(id => id !== couponId);
      }
      return {
        ...prev,
        targetedCoupons: newTargetedCoupons
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const couponOptions = formData.segments.map(segment => segment.couponId);
    
    const campaignData = {
      name: formData.name,
      noOfSpins: formData.noOfSpins,
      couponOptions: couponOptions,
      targetedCoupons: formData.targetedCoupons,
      isActive: formData.isActive,
      expiryDate: formData.expiryDate,
      segments: formData.segments,
    };

    try {
      // If it's an existing campaign, you might want to use PUT/PATCH instead
      const response = await api.post("/spinWheels", campaignData);
      onSave(response.data);
    } catch (error) {
      console.error("Error saving spin wheel:", error);
      // Handle error (show notification, etc.)
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
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Of Spins
              </label>
              <input
                type="number"
                value={formData.noOfSpins}
                onChange={(e) =>
                  handleInputChange("noOfSpins", parseInt(e.target.value))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            {formData.targetedCoupons.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Targeted Coupons
                </label>
                <div className="space-y-2">
                  {coupons.filter(c => formData.targetedCoupons.includes(c._id)).map(coupon => (
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
        <div className="overflow-x-auto mt-8">
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
              {formData.segments.map((segment, index) => (
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
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                      >
                        <option value="">Select Coupon</option>
                        {coupons.map((coupon) => (
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
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                    />
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    {formData.segments.length > 1 && (
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
          <p className="text-sm text-gray-500 mb-4">
            Select coupons that will be targeted for this spin wheel campaign.
          </p>
          {loadingCoupons ? (
            <div>Loading coupons...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map(coupon => (
                <div key={coupon._id} className="flex items-center p-3 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.targetedCoupons.includes(coupon._id)}
                    onChange={(e) => handleTargetedCouponChange(coupon._id, e.target.checked)}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-700">{coupon.name}</div>
                    <div className="text-xs text-gray-500">
                      {coupon.code} - {coupon.discount}{coupon.couponType === 'percentage' ? '%' : '₹'} off
                    </div>
                  </div>
                </div>
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
            Save Spin Wheel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SpinWheelForm;