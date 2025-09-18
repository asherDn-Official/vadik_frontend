// src/components/Inventory.js
import React, { useState, useEffect } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddProduct from "./AddProduct";
import api from "../../api/apiconfig";
// import {
//   getProducts,
//   deleteProduct as deleteProductApi,
// } from "../services/inventoryService";
// import { useAuth } from "../context/AuthContext";

// Get all products
export const getProducts = async (retailerId, params = {}) => {
  try {
    const response = await api.get("/api/inventory", {
      params: {
        retailerId,
        ...params,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Get single product
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};

// Create product
export const createProduct = async (retailerId, productData) => {
  try {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "colors" && Array.isArray(productData[key])) {
        productData[key].forEach((color) => formData.append("colors", color));
      } else if (key === "image" && productData[key]) {
        formData.append("image", productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });
    formData.append("retailerId", retailerId);

    const response = await api.post("", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      if (key === "colors" && Array.isArray(productData[key])) {
        productData[key].forEach((color) => formData.append("colors", color));
      } else if (key === "image" && productData[key]) {
        formData.append("image", productData[key]);
      } else if (productData[key] !== undefined) {
        formData.append(key, productData[key]);
      }
    });

    const response = await api.patch(`/${productId}`, formData, {
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

// Delete product
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/api/inventory/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

const Inventory = () => {
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("productName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: 10,
    totalPages: 1,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "#03BD00"; // Green
      case "Out of Stock":
        return "#FD2C2F"; // Red
      case "Low Stock":
        return "#E6B100"; // Yellow
      default:
        return "#6B7280"; // Gray
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        search: searchTerm,
        ...(categoryFilter !== "All Category" && { category: categoryFilter }),
        ...(statusFilter !== "All Status" && { status: statusFilter }),
        sortBy,
        sortOrder,
      };

      const response = await getProducts(retailerId, params);
      setProducts(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (retailerId) {
      fetchProducts();
    }
  }, [
    retailerId,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortBy,
    sortOrder,
    pagination.page,
  ]);

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowAddProduct(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        fetchProducts(); // Refresh the list
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product");
      }
    }
  };

  const handleBack = () => {
    setShowAddProduct(false);
    setEditProduct(null);
    fetchProducts(); // Refresh the list after adding/editing
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  if (showAddProduct) {
    return <AddProduct onBack={handleBack} product={editProduct} />;
  }

  // if (loading && !products.length) {
  //   return <div className="text-center py-8">Loading products...</div>;
  // }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-[#313166] font-medium">
          Product Inventory
        </h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center px-4 py-2 bg-[#EC396F] text-white rounded-md hover:bg-pink-700 transition"
        >
          <FiPlus className="mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-md shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search product"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-pink-700 transition md:hidden"
            onClick={() => setShowAddProduct(true)}
          >
            <FiPlus className="mr-2 inline" /> Add Product
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option>All Category</option>
              <option>Clothing</option>
              <option>Footwear</option>
              <option>Electronics</option>
              <option>Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option>All Status</option>
              <option>In Stock</option>
              <option>Out of Stock</option>
              {/* <option>Low Stock</option> */}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort By</label>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split(":");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="productName:asc">Name (A-Z)</option>
              <option value="productName:desc">Name (Z-A)</option>
              <option value="price:asc">Price (Low to High)</option>
              <option value="price:desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left">Product Name</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {product.images && (
                          <img
                            src={product.images[0]}
                            alt={product.productname}
                            className="w-10 h-10 mr-3 object-cover rounded-md"
                          />
                        )}
                        <span>{product.productname.length > 32 ? `${product.productname.slice(0, 32)}...` : product.productname}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">₹{product.price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: getStatusColor(product.status) }}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{product.stock} units</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="text-blue-500 hover:text-blue-700 mr-3"
                        onClick={() => handleEdit(product)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(product._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No products found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </div>

          <div className="flex space-x-1">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              &lt;
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`px-3 py-1 border rounded-md ${
                      pagination.page === pageNum
                        ? "bg-sidebar "
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}

            {pagination.totalPages > 5 &&
              pagination.page < pagination.totalPages - 2 && (
                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                  ...
                </button>
              )}

            <button
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
