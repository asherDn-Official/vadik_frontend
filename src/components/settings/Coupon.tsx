import React, { useState, useEffect } from "react";
import { 
  FiPlus, 
  FiSave, 
  FiX, 
  FiTag, 
  FiDollarSign, 
  FiPercent, 
  FiGift,
  FiEdit,
  FiTrash2
} from "react-icons/fi";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const initialCouponData = {
    code: "",
    discount: 0,
    expiryDate: "",
    couponType: "amount",
    description: "",
    isActive: true,
    condition: false,
    conditionType: "greater",
    conditionValue: 0,
    productId: ""
  };
  
  const [couponData, setCouponData] = useState(initialCouponData);
  const [formError, setFormError] = useState(null);

  const fetchCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/coupons/all");
      setCoupons(response.data.data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to fetch coupons. Please try again.");
      showToast("Failed to fetch coupons", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const startAddingCoupon = () => {
    setIsAddingCoupon(true);
    setEditingCouponId(null);
    setCouponData(initialCouponData);
    setFormError(null);
  };

  const startEditingCoupon = (coupon) => {
    setIsAddingCoupon(true);
    setEditingCouponId(coupon._id);
    setCouponData({
      code: coupon.code,
      discount: coupon.discount,
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      couponType: coupon.couponType,
      description: coupon.description,
      isActive: coupon.isActive,
      condition: coupon.condition || false,
      conditionType: coupon.conditionType || "greater",
      conditionValue: coupon.conditionValue || 0,
      productId: coupon.productId || ""
    });
    setFormError(null);
  };

  const cancelForm = () => {
    setIsAddingCoupon(false);
    setEditingCouponId(null);
    setCouponData(initialCouponData);
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCouponData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateCoupon = () => {
    if (!couponData.code.trim()) {
      return "Coupon code is required";
    }
    
    if (!couponData.expiryDate) {
      return "Expiry date is required";
    }
    
    if (couponData.discount <= 0) {
      return "Discount must be greater than 0";
    }
    
    if (couponData.couponType === "percentage" && couponData.discount > 100) {
      return "Percentage discount cannot exceed 100%";
    }
    
    if (couponData.couponType === "product" && !couponData.productId) {
      return "Product ID is required for product coupons";
    }
    
    if (couponData.condition && couponData.conditionValue <= 0) {
      return "Condition value must be greater than 0";
    }
    
    return null;
  };

  const handleSaveCoupon = async () => {
    const validationError = validateCoupon();
    if (validationError) {
      setFormError(validationError);
      showToast(validationError, "error");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    
    try {
      if (editingCouponId) {
        // Update existing coupon
        await api.put(`/api/coupons/coupon/${editingCouponId}`, couponData);
        showToast("Coupon updated successfully", "success");
      } else {
        // Create new coupon
        await api.post("/api/coupons/", couponData);
        showToast("Coupon created successfully", "success");
      }
      
      fetchCoupons();
      cancelForm();
    } catch (err) {
      console.error("Error saving coupon:", err);
      const errorMsg = err.response?.data?.message || "Failed to save coupon. Please try again.";
      setFormError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    setIsDeleting(couponId);
    try {
      await api.delete(`/api/coupons/coupon/${couponId}`);
      showToast("Coupon deleted successfully", "success");
      fetchCoupons();
    } catch (err) {
      console.error("Error removing coupon:", err);
      showToast("Failed to delete coupon", "error");
      setError("Failed to delete coupon.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case "amount":
        return <FiDollarSign />;
      case "percentage":
        return <FiPercent />;
      case "product":
        return <FiGift />;
      default:
        return <FiTag />;
    }
  };

  const getCouponTypeClasses = (type) => {
    switch (type) {
      case "amount":
        return "bg-blue-100 text-blue-800";
      case "percentage":
        return "bg-green-100 text-green-800";
      case "product":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchCoupons}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-semibold text-[#313166] mb-1">
                Coupon Management
              </h3>
              <p className="text-gray-600 text-sm">
                Create, view, and manage your promotional coupons.
              </p>
            </div>
            {!isAddingCoupon && (
              <button
                onClick={startAddingCoupon}
                className="flex items-center px-6 py-3 bg-[#313166] text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiPlus className="mr-2" /> Add Coupon
              </button>
            )}
          </div>
          
          {isAddingCoupon && (
            <div className="mb-6 rounded-lg border bg-gray-50 p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCouponId ? "Edit Coupon" : "Add New Coupon"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={couponData.code}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., FLAT50"
                  />
                </div>
                
                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount *
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={couponData.discount}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 50 or 10"
                    min="0"
                    step={couponData.couponType === "percentage" ? "0.1" : "1"}
                  />
                </div>
                
                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={couponData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Coupon Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Type
                  </label>
                  <select
                    name="couponType"
                    value={couponData.couponType}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                  >
                    <option value="amount">Amount (e.g., ₹50 off)</option>
                    <option value="percentage">Percentage (e.g., 10% off)</option>
                    <option value="product">Product (e.g., Free Gift)</option>
                  </select>
                </div>
                
                {/* Product ID (only for product coupons) */}
                {couponData.couponType === "product" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product ID *
                    </label>
                    <input
                      type="text"
                      name="productId"
                      value={couponData.productId}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter product ID"
                    />
                  </div>
                )}
                
                {/* Active Status */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={couponData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                    id="isActiveCheckbox"
                  />
                  <label 
                    htmlFor="isActiveCheckbox"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active Coupon
                  </label>
                </div>
                
                {/* Condition */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    name="condition"
                    checked={couponData.condition}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded text-primary focus:ring-primary"
                    id="conditionCheckbox"
                  />
                  <label 
                    htmlFor="conditionCheckbox"
                    className="text-sm font-medium text-gray-700"
                  >
                    Apply Condition
                  </label>
                </div>
                
                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={couponData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Brief description of the coupon"
                  />
                </div>
              </div>
              
              {couponData.condition && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition Type
                    </label>
                    <select
                      name="conditionType"
                      value={couponData.conditionType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                    >
                      <option value="greater">Greater than</option>
                      <option value="lesser">Lesser than</option>
                      <option value="equal">Equal to</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition Value *
                    </label>
                    <input
                      type="number"
                      name="conditionValue"
                      value={couponData.conditionValue}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 299"
                      min="0"
                    />
                  </div>
                </div>
              )}
              
              {formError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div className="text-red-700 text-sm">{formError}</div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={cancelForm}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button
                  onClick={handleSaveCoupon}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingCouponId ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FiSave className="mr-2" />
                      {editingCouponId ? "Update Coupon" : "Save Coupon"}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 p-3 rounded-full ${getCouponTypeClasses(coupon.couponType)}`}
                      >
                        {getCouponIcon(coupon.couponType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{coupon.code}</h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getCouponTypeClasses(coupon.couponType)}`}
                          >
                            {coupon.couponType}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {coupon.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
                          <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                          {coupon.condition && (
                            <span>
                              | Condition: Order {coupon.conditionType} ₹{coupon.conditionValue}
                            </span>
                          )}
                          {coupon.couponType === "product" && coupon.productId && (
                            <span>| Product: {coupon.productId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditingCoupon(coupon)}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit coupon"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleRemoveCoupon(coupon._id)}
                        disabled={isDeleting === coupon._id}
                        className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove coupon"
                      >
                        {isDeleting === coupon._id ? (
                          <svg className="animate-spin h-4 w-4 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiTag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons added yet</h3>
                <p className="text-gray-500 mb-4">
                  Start by adding your first coupon to offer discounts.
                </p>
                <button
                  onClick={startAddingCoupon}
                  className="inline-flex items-center px-4 py-2 bg-[#313166] text-white rounded-lg hover:bg-[#252451] transition-colors"
                >
                  <FiPlus className="mr-2" /> Add Your First Coupon
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="bg-white overflow-hidden rounded-lg shadow-sm">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-36 animate-pulse"></div>
        </div>
        
        {/* Form Skeleton */}
        <div className="mb-6 rounded-lg border bg-gray-50 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-4">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        {/* Coupon List Skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default CouponManagement;