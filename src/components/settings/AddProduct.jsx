import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiSearch, FiPlusCircle, FiX, FiUpload } from "react-icons/fi";
// import { createProduct, updateProduct, getProduct } from "../services/inventoryService";

export const createProduct = async (retailerId, productData) => {
  try {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'colors' && Array.isArray(productData[key])) {
        productData[key].forEach(color => formData.append('colors', color));
      } else if (key === 'image' && productData[key]) {
        formData.append('image', productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });
    formData.append('retailerId', retailerId);

    const response = await api.post('', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'colors' && Array.isArray(productData[key])) {
        productData[key].forEach(color => formData.append('colors', color));
      } else if (key === 'image' && productData[key]) {
        formData.append('image', productData[key]);
      } else if (productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.patch(`/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// import { useAuth } from "../context/AuthContext";

const AddProduct = ({ onBack, product: editProduct }) => {
  // const { user } = useAuth();
  const user = {
    retailerId: "6856350030bcee9b82be4c17"
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [productData, setProductData] = useState({
    productname: "",
    description: "",
    price: "",
    status: "In Stock",
    category: "",
    stock: "",
  });

  useEffect(() => {
    if (editProduct) {
      const fetchProductDetails = async () => {
        try {
          setLoading(true);
          const product = await getProduct(editProduct._id);
          setProductData({
            productname: product.productname,
            description: product.description,
            price: product.price,
            status: product.status,
            category: product.category,
            stock: product.stock,
          });
          setColors(product.colors || []);
          if (product.image) {
            setImagePreviews([product.image]);
          }
        } catch (err) {
          setError(err.message || "Failed to load product details");
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    }
  }, [editProduct]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 4) {
      setError("You can upload a maximum of 4 images");
      return;
    }

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
  };

  const removeImage = (index) => {
    const newImagePreviews = [...imagePreviews];
    const newImageFiles = [...imageFiles];

    newImagePreviews.splice(index, 1);
    // Only remove from files if it's a newly added file (not the existing one)
    if (index < newImageFiles.length) {
      newImageFiles.splice(index, 1);
    }

    setImagePreviews(newImagePreviews);
    setImageFiles(newImageFiles);
  };

  const handleAddColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      setColors([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const handleRemoveColor = (colorToRemove) => {
    setColors(colors.filter(color => color !== colorToRemove));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('retailerId', user.retailerId);
      formData.append('productname', productData.productname);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('status', productData.status);
      formData.append('category', productData.category);
      formData.append('stock', productData.stock);

      colors.forEach(color => formData.append('colors', color));

      // Only append new images if they exist
      imageFiles.forEach(file => formData.append('image', file));

      if (editProduct) {
        await updateProduct(editProduct._id, formData);
      } else {
        await createProduct(formData);
      }

      onBack();
    } catch (err) {
      setError(err.message || "Failed to save product");
      console.error("Error saving product:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setShowSearchResults(true);
    // In a real implementation, you would call an API here
  };

  const handleSelectSearchResult = (result) => {
    setSearchTerm(result);
    setShowSearchResults(false);
  };

  // Mock search results - replace with API call in real implementation
  const searchResults = [
    "Shirt for men",
    "Shirt for women",
    "Black Shirt",
    "Shirt combo",
  ];

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

        {editProduct && (
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search product"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 0) {
                  setShowSearchResults(true);
                } else {
                  setShowSearchResults(false);
                }
              }}
              className="w-full md:w-3/4 pl-4 pr-10 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 text-primary"
            >
              <FiSearch size={20} />
            </button>

            {showSearchResults && (
              <div className="absolute z-10 w-full md:w-3/4 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                    onClick={() => handleSelectSearchResult(result)}
                  >
                    <FiSearch className="mr-3 text-gray-500" />
                    <span>{result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {imagePreviews.length > 0 ? (
            imagePreviews.map((preview, index) => (
              <div key={index} className="relative border border-gray-300 rounded-md h-40">
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
            <div key={index} className="border border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-6 h-40">
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
                name="productname"
                placeholder="Enter product name"
                value={productData.productname}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                A product name is required and recommended to be unique
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product description*
              </label>
              <textarea
                name="description"
                placeholder="Enter product description"
                value={productData.description}
                onChange={handleInputChange}
                rows="4"
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                Add detailed information about the product, including usage,
                benefits, and features. This helps users make informed
                decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-6">Addition Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colors
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price*
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2">€</span>
                <input
                  type="number"
                  name="price"
                  placeholder="Update price"
                  value={productData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={productData.status}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Low Stock">Low Stock</option>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product categories*
              </label>
              <div className="relative">
                <select
                  name="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md appearance-none"
                >
                  <option value="" disabled>Choose categories</option>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock*
              </label>
              <input
                type="number"
                name="stock"
                placeholder="Enter stock quantity"
                value={productData.stock}
                onChange={handleInputChange}
                min="0"
                required
                className="w-full p-2 border border-gray-300 rounded-md"
              />
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
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-md hover:bg-pink-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (editProduct ? "Updating..." : "Saving...") : (editProduct ? "Update" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;