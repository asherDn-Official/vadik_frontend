import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  FiArrowLeft,
  FiSearch,
  FiPlusCircle,
  FiX,
  FiUpload,
} from "react-icons/fi";
import api from "../../api/apiconfig";
import { useAuth } from "../../context/AuthContext";
import showToast from "../../utils/ToastNotification";

export const createProduct = async (formData) => {
  try {
    const response = await api.post("/api/inventory", formData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, formData) => {
  try {
    const response = await api.patch(`/api/inventory/${productId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await api.get(`api/inventory/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

const AddProduct = ({ onBack, product: editProduct }) => {
  const { auth } = useAuth();
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    trigger,
    reset
  } = useForm({
    defaultValues: {
      productname: "",
      description: "",
      price: "",
      status: "In Stock",
      category: "",
      stock: "",
      colors: []
    },
    mode: "onChange"
  });

  const watchedValues = watch();
  const isOutOfStock = watch('status') === 'Out of Stock';

  useEffect(() => {
    // When status is Out of Stock, force stock to 0
    if (isOutOfStock) {
      setValue('stock', 0, { shouldValidate: true, shouldDirty: true });
    }
  }, [isOutOfStock, setValue]);

  // Authentication check
  useEffect(() => {
    if (!auth) {
      setError("You must be logged in to access this page");
      return;
    }
  }, [auth]);

  useEffect(() => {
    if (editProduct) {
      const fetchProductDetails = async () => {
        try {
          setLoading(true);
          const product = await getProduct(editProduct._id);
          
          // Set form values
          setValue("productname", product.productname);
          setValue("description", product.description);
          setValue("price", product.price);
          setValue("status", product.status);
          setValue("category", product.category);
          setValue("stock", product.stock);
          
          setColors(product.colors || []);
          setValue('colors', product.colors || [], { shouldValidate: true });
          if (product.images) {
            setImagePreviews(product.images);
          }
        } catch (err) {
          setError(err.message || "Failed to load product details");
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    }
  }, [editProduct, setValue]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 4) {
      setError("You can upload a maximum of 4 images");
      return;
    }

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError("Only image files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      newImageFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newImagePreviews.push(reader.result);
        setImagePreviews([...newImagePreviews]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(newImageFiles);
    setError(null);
  };

  const removeImage = (index) => {
    const newImagePreviews = [...imagePreviews];
    const removedImage = newImagePreviews[index];

    if (typeof removedImage === "string" && removedImage.startsWith("http")) {
      setImagesToRemove([...imagesToRemove, removedImage]);
    } else if (index < imageFiles.length) {
      const newImageFiles = [...imageFiles];
      newImageFiles.splice(index, 1);
      setImageFiles(newImageFiles);
    }

    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);
  };

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      const updatedColors = [...colors, newColor.trim()];
      setColors(updatedColors);
      setValue('colors', updatedColors, { shouldValidate: true, shouldDirty: true });
      setNewColor("");
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    const updatedColors = colors.filter((color) => color !== colorToRemove);
    setColors(updatedColors);
    setValue('colors', updatedColors, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    setError(null);

    // Check authentication
    if (!auth) {
      setError("You must be logged in to perform this action");
      return;
    }

    // Validate images
    if (imagePreviews.length === 0 && imageFiles.length === 0) {
      setError("At least one product image is required");
      return;
    }



    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("retailerId", retailerId);
      formData.append("productname", data.productname.trim());
      formData.append("description", data.description.trim());
      formData.append("price", data.price);
      formData.append("status", data.status);
      formData.append("category", data.category);
      const stockToSend = data.status === 'Out of Stock' ? 0 : data.stock;
      formData.append("stock", stockToSend);
      formData.append("colors", colors.join(","));

      // Add images to remove
      imagesToRemove.forEach((imageUrl) => {
        formData.append("removeImages", imageUrl);
      });

      // Add new images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (editProduct) {
        await updateProduct(editProduct._id, formData);
        showToast("Product saved successfully!", "success");
      } else {
        await createProduct(formData);
        showToast("Product created successfully!", "success");
      }

      onBack();
    } catch (err) {
      setError(err.message || "Failed to save product");
      showToast(err.response?.data?.message, "error");
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-medium">
          {editProduct ? "Edit Product" : "Add New Product"}
        </h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        {editProduct ? (
          <h3 className="text-lg font-medium mb-4">Edit Existing Product</h3>
        ) : (
          <h3 className="text-lg font-medium mb-4">Add New Product</h3>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {imagePreviews.length > 0 ? (
              imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative border border-gray-300 rounded-md h-40"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                  >
                    <FiX size={16} className="text-gray-600" />
                  </button>
                </div>
              ))
            ) : (
              <div className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 h-40">
                <label className="cursor-pointer text-center">
                  <div className="text-gray-400 mb-2">
                    <FiPlusCircle size={24} />
                  </div>
                  <p className="text-center text-sm text-blue-500">
                    Click to Add Product
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Image or Video
                  </p>
                  <p className="text-center text-xs text-gray-400 mt-2">Format</p>
                  <p className="text-center text-xs text-gray-400">
                    (JPG, PNG or MP4, Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            )}

            {Array.from({ length: 4 - imagePreviews.length }).map((_, index) => (
              <div
                key={index}
                className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 h-40"
              >
                <label className="cursor-pointer text-center">
                  <div className="text-gray-400 mb-2">
                    <FiPlusCircle size={24} />
                  </div>
                  <p className="text-center text-sm text-blue-500">
                    Click to Add Product
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-1">
                    Image or Video
                  </p>
                  <p className="text-center text-xs text-gray-400 mt-2">Format</p>
                  <p className="text-center text-xs text-gray-400">
                    (JPG, PNG or MP4, Max 5MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                </label>
              </div>
            ))}
          </div>

          {imagePreviews.length > 0 && (
            <div className="text-right mb-8">
              <label className="px-4 py-2 text-primary hover:text-primary-dark cursor-pointer">
                Add More +
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple
                />
              </label>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-6">General Information</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product name*
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  {...register("productname", {
                    required: "Product name is required",
                    minLength: {
                      value: 2,
                      message: "Product name must be at least 2 characters long"
                    },
                    maxLength: {
                      value: 100,
                      message: "Product name must not exceed 100 characters"
                    }
                  })}
                  className={`w-full p-2 border rounded-md ${errors.productname ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.productname ? (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.productname.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    A product name is required and recommended to be unique
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product description*
                </label>
                <textarea
                  placeholder="Enter product description"
                  {...register("description", {
                    required: "Product description is required",
                    minLength: {
                      value: 10,
                      message: "Product description must be at least 10 characters long"
                    },
                    maxLength: {
                      value: 500,
                      message: "Product description must not exceed 500 characters"
                    }
                  })}
                  rows="4"
                  className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                ></textarea>
                {errors.description ? (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Add detailed information about the product, including usage,
                    benefits, and features. This helps users make informed
                    decisions.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-6">Addition Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colors Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colors*
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add color"
                    className="flex-1 p-2 border border-gray-300 rounded-l-md"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 bg-gray-200 hover:bg-gray-300 rounded-r-md"
                  >
                    Add
                  </button>
                </div>
                <input
                  type="hidden"
                  {...register('colors', {
                    validate: (value) => (Array.isArray(value) && value.length > 0) || 'alteast one colores is required'
                  })}
                />
                {errors.colors && (
                  <p className="text-xs text-red-500 mt-1">{errors.colors.message}</p>
                )}
                {colors.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-md text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price*
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2">₹</span>
                  <input
                    type="number"
                    placeholder="Update price"
                    {...register("price", {
                      required: "Price is required",
                      min: {
                        value: 0.01,
                        message: "Price must be greater than 0"
                      },
                      max:{
                        value: 100000,
                        message: "Price must be less than 1 lakh"
                      },
                      valueAsNumber: true
                    })}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.price ? (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.price.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the product price in INR
                  </p>
                )}
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status*
                </label>
                <div className="relative">
                  <select
                    {...register("status", {
                      required: "Status is required"
                    })}
                    className={`w-full p-2 border rounded-md appearance-none ${errors.status ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value='In Stock'>In Stock</option>
                    <option value='Out of Stock'>Out of Stock</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
                {errors.status && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product categories*
                </label>
                <div className="relative">
                  <select
                    {...register("category", {
                      required: "Product category is required"
                    })}
                    className={`w-full p-2 border rounded-md appearance-none ${errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="" disabled>
                      Choose categories
                    </option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
                {errors.category ? (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.category.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Select the appropriate category
                  </p>
                )}
              </div>

              {/* Stock Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock*
                </label>
                <input
                  type="number"
                  placeholder="Enter stock quantity"
                  {...register("stock", {
                    required: "Stock quantity is required",
                    min: {
                      value: 0,
                      message: "Stock quantity cannot be negative"
                    },
                    max: {
                      value: 1000000000,
                      message: "Stock quantity cannot exceed  more than 1 billion items"
                    },
                    validate: (value) => {
                      // If status is In Stock, enforce stock to be at least 1
                      if (watch('status') === 'In Stock') {
                        return Number(value) >= 1 || "stock must be start with one";
                      }
                      return true;
                    },
                    valueAsNumber: true
                  })}
                  min={isOutOfStock ? 0 : 1}
                  disabled={isOutOfStock}
                  title={isOutOfStock ? 'Stock is set to 0 when status is Out of Stock' : undefined}
                  className={`w-full p-2 border rounded-md ${errors.stock ? 'border-red-500' : 'border-gray-300'} ${isOutOfStock ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {errors.stock ? (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.stock.message}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Enter available quantity in stock
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 mr-4 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-md hover:bg-pink-700 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? editProduct
                  ? "Updating..."
                  : "Saving..."
                : editProduct
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;