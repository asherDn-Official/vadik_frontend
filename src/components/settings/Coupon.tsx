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
  FiTrash2,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import deleteConfirmTostNotification from "../../utils/deleteConfirmTostNotification";
import VideoPopupWithShare from "../common/VideoPopupWithShare";
import CouponPopup from "./couponPopup";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // New states for pagination, sorting, filtering, and search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false)
  const [soon, setSoon] = useState()

  const [filters, setFilters] = useState({
    isActive: "",
    couponType: "",
    expiryDate: "",
    productId: "",
    discount: "",
    conditionType: "",
  });


   useEffect(() => {
        fetch("/assets/Comingsoon.json")
            .then((res) => res.json())
            .then(setSoon)
            .catch(console.error)

    }, []);

  const handleDateChange = (date) => {
    setExpiryDate(date);
    setValue("expiryDate", date, { shouldValidate: true });
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("productImage", reader.result?.toString() || "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const initialCouponData = {
    name: "",
    code: "",
    discount: 0,
    expiryDate: "",
    couponType: "amount",
    description: "",
    isActive: true,
    condition: false,
    conditionType: "greater",
    conditionValue: 0,
    productImage: "",
    productNames: "",
  };

  // react-hook-form schema and setup
  const couponSchema = yup
    .object({
      name: yup
        .string()
        .trim()
        .required("Name is required")
        .min(3, "Name should have at least 3 characters")
        .max(50, "Name can't exceed 50 characters"),
      code: yup
        .string()
        .trim()
        .required("Code is required")
        .matches(
          /^[A-Za-z0-9!@#$%^&*()_\-+=<>?{}[\]~`.,;:'"\\|/ ]+$/,
          "Invalid characters"
        ) // allow specials
        .test(
          "min-letters",
          "Code must contain at least 4 letters",
          (value) => (value.match(/[A-Za-z]/g) || []).length >= 4
        )
        .test(
          "min-numbers",
          "Code must contain at least 2 numbers",
          (value) => (value.match(/[0-9]/g) || []).length >= 2
        ),
      discount: yup
        .number()
        .typeError("Discount must be a number")
        .positive("Discount must be greater than 0")
        .min(0, "Discount must be greater than or equal to 0"),
      // .max(100, "Discount cannot exceed 100"),
      expiryDate: yup
        .string()
        .required("Expiry date is required")
        .test("future", "Expiry date must be today or later", (value) => {
          if (!value) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const d = new Date(value);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        }),
      couponType: yup
        .mixed()
        .oneOf(["amount", "percentage", "product"])
        .required(),
      description: yup
        .string()
        .nullable()
        .max(100, "Description must be at most 100 characters"),
      isActive: yup.boolean().default(true),
      condition: yup.boolean().default(false),
      conditionType: yup
        .mixed()
        .oneOf(["greater", "lesser", "equal"])
        .default("greater"),
      conditionValue: yup
        .number()
        .typeError("Condition value must be a number")
        .when("condition", {
          is: true,
          then: (s) =>
            s
              .positive("Condition value must be greater than 0")
              .required("Condition value is required"),
          otherwise: (s) => s.transform(() => 0).default(0),
        }),
      productNames: yup
        
            .string()
            .max(15, "Product name can not be more than 15 characters")
            .required("Product name is required")
        
        .when("couponType", {
          is: "product",
          then: (s) => s.min(1, "At least one product name is required"),
          otherwise: (s) => s.notRequired(),
        }),
      productImage: yup.string().nullable().notRequired(),
    })
    .required();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(couponSchema),
    defaultValues: initialCouponData,
    mode: "OnChange",

  });

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: "productNames",
  // });
  

  const watchCouponType = watch("couponType");
  const watchCondition = watch("condition");
  const watchProductImage = watch("productImage");
  

  const fetchCoupons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortField,
        sortOrder,
        search: searchQuery,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await api.get("/api/coupons/all", { params });
      setCoupons(response.data.data);
      setTotalCoupons(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
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
  }, [currentPage, itemsPerPage, sortField, sortOrder, filters, searchQuery]);

  const startAddingCoupon = () => {
    setIsAddingCoupon(true);
    setEditingCouponId(null);
    reset(initialCouponData);
  };

  const startEditingCoupon = (coupon) => {
    setIsAddingCoupon(true);
    setEditingCouponId(coupon._id);
    const editData = {
      name: coupon.name,
      code: coupon.code,
      discount: coupon.discount,
      expiryDate: new Date(coupon.expiryDate).toISOString().split("T")[0],
      couponType: coupon.couponType,
      description: coupon.description,
      isActive: coupon.isActive,
      condition: coupon.condition || false,
      conditionType: coupon.conditionType || "greater",
      conditionValue: coupon.conditionValue || 0,
      productImage: coupon.productImage || "",
      productNames: coupon.productNames || [],
    };
    reset(editData);
  };

  const cancelForm = () => {
    setIsAddingCoupon(false);
    setEditingCouponId(null);
    setExpiryDate(null);
  };

  const handleSaveCoupon = async (data) => {
    setIsSaving(true);

    try {
      // Prepare the payload
      const payload = {
        ...data,
        // Ensure conditionValue is 0 if condition is false
        conditionValue: data.condition ? data.conditionValue : 0,
        // Ensure productNames is empty array if not a product coupon
        productNames: data.couponType === "product" ? data.productNames : "",
        productImage: data.couponType === "product" ? data.productImage || "" : "",
      };

      if (editingCouponId) {
        // Update existing coupon
        await api.put(`/api/coupons/coupon/${editingCouponId}`, payload);
        showToast("Coupon updated successfully", "success");
      } else {
        console.log(payload);
        // Create new coupon
        await api.post("/api/coupons/", payload);
        showToast("Coupon created successfully", "success");
      }

      fetchCoupons();
      cancelForm();
    } catch (err) {
      console.error("Error saving coupon:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Failed to save coupon. Please try again.";
      showToast(errorMsg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCoupon = async (couponId) => {
    const onConfirm = async () => {
      setIsDeleting(couponId);
      try {
        await api.delete(`/api/coupons/coupon/${couponId}`);
        showToast("Coupon deleted successfully", "success");
        fetchCoupons();
      } catch (err) {
        console.error("Error removing coupon:", err);
        showToast("Failed to delete coupon", "error");
      } finally {
        setIsDeleting(false);
      }
    };

    deleteConfirmTostNotification("", onConfirm);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      isActive: "",
      couponType: "",
      expiryDate: "",
      productId: "",
      discount: "",
      conditionType: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
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

  // if (isLoading) {
  //   return <SkeletonLoader />;
  // }

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

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white overflow-hidden rounded-lg shadow-sm">
        <div className="p-9">
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
              <div className=" flex items-center gap-2">
                 <button className="flex items-center text-sm text-white px-4 py-3 bg-[#313166] rounded-lg  hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md" 
                onClick={() => setIsOpen(true)}
                >
                  coupon Tutorial
                </button>

                <VideoPopupWithShare
                  // video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ?si=JGtmQtyRIt_K6Dt5"
                  animationData={soon}
                  buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
                />
                <button
                  onClick={startAddingCoupon}
                  className="flex items-center px-6 py-3 bg-[#313166] text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FiPlus className="mr-2" /> Add Coupon
                </button>

                
              </div>
            )}
          </div>
          <CouponPopup isOpen = {isOpen} onClose = {() => setIsOpen(false)} />

          {isAddingCoupon && (
            <form
              onSubmit={handleSubmit(handleSaveCoupon)}
              className="mb-6 rounded-lg border bg-gray-50 p-6"
            >
              <h3 className="text-lg font-semibold mb-4">
                {editingCouponId ? "Edit Coupon" : "Add New Coupon"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Coupon Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., Summer Sale Discount"
                    disabled={editingCouponId}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Coupon Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code *
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    onChange={(e) => {
                      const uppercased = e.target.value.toUpperCase();
                      // update input value
                      e.target.value = uppercased;
                      // update react-hook-form state
                      setValue("code", uppercased, { shouldValidate: true });
                    }}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.code ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., FLAT50"
                    disabled={editingCouponId}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                {/* Discount */}
                {watchCouponType !== "product" && (
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount *
                  </label>
                  <input
                    type="number"
                    {...register("discount", { valueAsNumber: true })}
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.discount  ? "border-red-500" : "border-gray-300" }
                    }`}
                    placeholder="e.g., 50 or 10"
                    min={0}
                    step={watchCouponType === "percentage" ? 0.1 : 1}
                    disabled={watchCouponType === "product"}
                  />
                  {errors.discount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.discount.message}
                    </p>
                  )}
                </div>
                  )}
                

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <DatePicker
                    selected={expiryDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.expiryDate ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholderText="Select expiry date"
                  />

                  {/* Hidden input for react-hook-form registration */}
                  <input
                    type="hidden"
                    {...register("expiryDate", {
                      required: "Expiry date is required",
                      validate: (value) =>
                        (value && value >= new Date()) ||
                        "Expiry date must be today or later",
                    })}
                  />

                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.expiryDate.message}
                    </p>
                  )}
                </div>

                {/* Coupon Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Type
                  </label>
                  <select
                    {...register("couponType")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                  >
                    <option value="amount">Amount (e.g., ₹50 off)</option>
                    <option value="percentage">
                      Percentage (e.g., 10% off)
                    </option>
                    <option value="product">Product (e.g., Free Gift)</option>
                  </select>
                </div>

                {/* Product Names (only for product coupons) */}
                {watchCouponType === "product" && (
                  <>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <div className="space-y-2">
                         {/* {fields.map((field, index) => ( */}
                          <div  className="flex gap-2">

                            <input
                              type="text"
                              {...register("productNames")}
                              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.productNames
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter product name"
                            />
                            {/* <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <FiTrash2 />
                            </button> */}

                          </div>
                        {/* ))} */}
                        {/* <button
                          type="button"
                          onClick={() => append("")}
                          className={`flex items-center px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors ${fields.length === 0 ? " " : "cursor-not-allowed hover:bg-gray-200 hover:text-gray-500"}`}
                        >
                          <FiPlus className="mr-2" /> Add Product
                        </button> */}

                      </div>
                      {errors.productNames && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.productNames.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Image
                      </label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          {...register("productImage")}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Image URL or data URL"
                        />
                        <div className="flex items-center gap-3">
                          <label className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProductImageChange}
                            />
                            Upload Image
                          </label>
                          {watchProductImage && (
                            <button
                              type="button"
                              onClick={() =>
                                setValue("productImage", "", {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                              className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {watchProductImage && (
                          <div className="flex items-center gap-3">
                            <img
                              src={watchProductImage}
                              alt="Product"
                              className="h-16 w-16 rounded-lg object-cover border"
                            />
                            <span className="text-xs text-gray-500 break-all">
                              {watchProductImage.length > 60
                                ? `${watchProductImage.slice(0, 60)}...`
                                : watchProductImage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Active Status */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    {...register("isActive")}
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
                    {...register("condition")}
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
                    {...register("description")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Brief description of the coupon"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {watchCondition && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition Type
                    </label>
                    <select
                      {...register("conditionType")}
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
                      {...register("conditionValue", { valueAsNumber: true })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.conditionValue
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 299"
                      min="0"
                    />
                    {errors.conditionValue && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.conditionValue.message}
                      </p>
                    )}
                  </div>
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
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
            </form>
          )}

          {/* Search and Filter Section */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={searchQuery}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow only letters, numbers, and spaces
                    const filteredValue = inputValue.replace(
                      /[^a-zA-Z0-9\s]/g,
                      ""
                    );

                    setSearchQuery(filteredValue);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FiFilter className="mr-2" />
                Filters
                {showFilters ? (
                  <FiChevronUp className="ml-1" />
                ) : (
                  <FiChevronDown className="ml-1" />
                )}
              </button>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="isActive"
                    value={filters.isActive}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {/* Coupon Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Type
                  </label>
                  <select
                    name="couponType"
                    value={filters.couponType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="amount">Amount</option>
                    <option value="percentage">Percentage</option>
                    <option value="product">Product</option>
                  </select>
                </div>

                {/* Condition Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition Type
                  </label>
                  <select
                    name="conditionType"
                    value={filters.conditionType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Conditions</option>
                    <option value="greater">Greater than</option>
                    <option value="lesser">Less than</option>
                    <option value="equal">Equal to</option>
                  </select>
                </div>

                {/* Expiry Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Before
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={filters.expiryDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Product ID Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    name="productId"
                    value={filters.productId}
                    onChange={handleFilterChange}
                    placeholder="Enter product ID"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Discount Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={filters.discount}
                    onChange={handleFilterChange}
                    placeholder="Enter discount amount"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sorting Controls */}
          <div className="flex flex-wrap gap-4 mb-4">
            <span className="text-sm text-gray-700 font-medium">Sort by:</span>

            <button
              onClick={() => handleSort("createdAt")}
              className={`px-3 py-1 rounded-full text-sm ${
                sortField === "createdAt"
                  ? "bg-[#313166] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Created Date{" "}
              {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>

            <button
              onClick={() => handleSort("expiryDate")}
              className={`px-3 py-1 rounded-full text-sm ${
                sortField === "expiryDate"
                  ? "bg-[#313166] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Expiry Date{" "}
              {sortField === "expiryDate" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>

            <button
              onClick={() => handleSort("discount")}
              className={`px-3 py-1 rounded-full text-sm ${
                sortField === "discount"
                  ? "bg-[#313166] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Discount Amount{" "}
              {sortField === "discount" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-700">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>

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
                        className={`flex-shrink-0 p-3 rounded-full ${getCouponTypeClasses(
                          coupon.couponType
                        )}`}
                      >
                        {getCouponIcon(coupon.couponType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {coupon.name}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              coupon.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getCouponTypeClasses(
                              coupon.couponType
                            )}`}
                          >
                            {coupon.couponType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          {coupon.description}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-2">
                          <span>Expires: {formatDate(coupon.expiryDate)}</span>
                          {coupon.condition && (
                            <span>
                              | Condition: Order {coupon.conditionType} ₹
                              {coupon.conditionValue}
                            </span>
                          )}
                          {coupon.couponType === "product" &&
                            coupon.productNames &&
                            coupon.productNames.length > 0 && (
                              <span>
                                | Products: {coupon.productNames}
                              </span>
                            )}
                        </div>
                        {coupon.couponType === "product" && coupon.productImage && (
                          <div className="mt-3">
                            <img
                              src={coupon.productImage}
                              alt="Product"
                              className="h-16 w-16 rounded-lg object-cover border"
                            />
                          </div>
                        )}
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
                          <svg
                            className="animate-spin h-4 w-4 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No coupons added yet
                </h3>
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

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        currentPage === pageNum
                          ? "bg-[#313166] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          )}
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
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
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