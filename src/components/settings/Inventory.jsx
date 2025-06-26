import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import AddProduct from "./AddProduct";

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Leather Sneakers",
      category: "Footwear",
      price: "€129.99",
      status: "In Stock",
      stock: "42 units",
      image:
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=96&h=96",
    },
    {
      id: 2,
      name: "Premium Denim Jeans",
      category: "Clothing",
      price: "€59.99",
      status: "In Stock",
      stock: "42 units",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=96&h=96",
    },
    {
      id: 3,
      name: "Performance Running Shoes",
      category: "Footwear",
      price: "€45.50",
      status: "Out of Stock",
      stock: "0 units",
      image:
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=96&h=96",
    },
    {
      id: 4,
      name: "Organic Cotton T-Shirt",
      category: "Clothing",
      price: "€24.99",
      status: "In Stock",
      stock: "42 units",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=96&h=96",
    },
    {
      id: 5,
      name: "Classic Formal Shoes",
      category: "Footwear",
      price: "€179.99",
      status: "Low Stock",
      stock: "42 units",
      image:
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=96&h=96",
    },
    {
      id: 6,
      name: "Wool Blend Sweater",
      category: "Clothing",
      price: "€18.50",
      status: "In Stock",
      stock: "42 units",
      image:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=96&h=96",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "text-success";
      case "Out of Stock":
        return "text-error";
      case "Low Stock":
        return "text-warning";
      default:
        return "text-gray-700";
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowAddProduct(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleBack = () => {
    setShowAddProduct(false);
    setEditProduct(null);
  };

  if (showAddProduct) {
    return <AddProduct onBack={handleBack} product={editProduct} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-[#313166] font-medium">
          Product Inventory
        </h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-pink-700 transition"
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
              <option>Low Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option>Name (A-Z)</option>
              <option>Name (Z-A)</option>
              <option>Price (Low to High)</option>
              <option>Price (High to Low)</option>
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
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 mr-3 object-cover rounded-md"
                      />
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">{product.price}</td>
                  <td className={`px-4 py-3 ${getStatusColor(product.status)}`}>
                    {product.status}
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-3"
                      onClick={() => handleEdit(product)}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(product.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing 1 to {products.length} of {products.length} results
          </div>

          <div className="flex space-x-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              &lt;
            </button>
            <button className="px-3 py-1 bg-sidebar text-white rounded-md">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              ...
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              8
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;