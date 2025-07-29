import React, { useState, useEffect } from "react";
import { Scan, Plus, Trash2, ArrowLeft } from "lucide-react";
import axios from "axios";
import api from "../../api/apiconfig";

const DailyOrderSheet = ({ customer, onBack, onNewOrder }) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    firstName: "",
    lastName: "",
    gender: "",
    source: "",
  });

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      colors: [],
      isAutoPopulated: false,
    },
  ]);

  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [newColor, setNewColor] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Product search states - now tracking per product
  const [productSearchResults, setProductSearchResults] = useState({});
  const [showProductSuggestions, setShowProductSuggestions] = useState({});
  const [currentProductSearches, setCurrentProductSearches] = useState({});
  const [dropdownPositions, setDropdownPositions] = useState({});
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  // Initialize product search states
  useEffect(() => {
    const initialSearchStates = {};
    products.forEach((product) => {
      initialSearchStates[product.id] = "";
    });
    setCurrentProductSearches(initialSearchStates);
    setShowProductSuggestions({});
    setProductSearchResults({});
  }, [products]);

  const searchProducts = async (query, productId) => {
    try {
      const response = await axios.get(
        `https://app.vadik.ai/api/inventory?retailerId=6856350030bcee9b82be4c17&search=${query}`
      );
      setProductSearchResults((prev) => ({
        ...prev,
        [productId]: response.data.data || [],
      }));
      setShowProductSuggestions((prev) => ({
        ...prev,
        [productId]: true,
      }));
    } catch (error) {
      console.error("Error searching products:", error);
      setProductSearchResults((prev) => ({
        ...prev,
        [productId]: [],
      }));
      setShowProductSuggestions((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  const selectProduct = (productId, selectedProduct) => {
    // Update product with selected data and mark as auto-populated
    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          const updatedProduct = {
            ...product,
            name: selectedProduct.productname,
            unitPrice: selectedProduct.price,
            colors: [...selectedProduct.colors],
            isAutoPopulated: true,
            totalPrice: product.quantity * selectedProduct.price,
          };
          return updatedProduct;
        }
        return product;
      })
    );

    setShowProductSuggestions((prev) => ({
      ...prev,
      [productId]: false,
    }));

    setCurrentProductSearches((prev) => ({
      ...prev,
      [productId]: selectedProduct.productname,
    }));
  };

  const handleProductNameChange = (productId, value) => {
    setCurrentProductSearches((prev) => ({
      ...prev,
      [productId]: value,
    }));

    updateProduct(productId, "name", value);

    if (value.length >= 3) {
      searchProducts(value, productId);
    } else {
      setProductSearchResults((prev) => ({
        ...prev,
        [productId]: [],
      }));
      setShowProductSuggestions((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  useEffect(() => {
    if (customer) {
      setFormData({
        phoneNumber: customer.mobileNumber || customer.mobile || "",
        firstName: customer.firstname || customer.firstName || "",
        lastName: customer.lastname || customer.lastName || "",
        gender: customer.additionalData?.gender || customer.gender || "",
        source: customer.source || "",
      });
    } else {
      setFormData({
        phoneNumber: "",
        firstName: "",
        lastName: "",
        gender: "",
        source: "",
      });
      setProducts([]);
    }
  }, [customer]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "phoneNumber" && value.length >= 3) {
      searchCustomers(value);
    } else if (field === "phoneNumber") {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const searchCustomers = async (query) => {
    try {
      const response = await api.get(
        `/api/customers?retailerId=${retailerId}&search=${query}`
      );
      setSearchResults(response.data.data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error searching customers:", error);
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (customer) => {
    setFormData({
      phoneNumber: customer.mobileNumber || "",
      firstName: customer.firstname || "",
      lastName: customer.lastname || "",
      gender: customer.additionalData?.gender || "",
      source: customer.source || "",
    });
    setShowSuggestions(false);
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      colors: [],
      isAutoPopulated: false,
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id, field, value) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const updated = { ...product, [field]: value };

          // If manually editing unit price, remove auto-populated flag
          if (field === "unitPrice") {
            updated.isAutoPopulated = false;
            updated.totalPrice = updated.quantity * updated.unitPrice;
          }

          if (field === "quantity") {
            updated.totalPrice = updated.quantity * updated.unitPrice;
          }

          if (field === "totalPrice") {
            updated.unitPrice =
              updated.quantity > 0 ? updated.totalPrice / updated.quantity : 0;
            updated.isAutoPopulated = false;
          }

          return updated;
        }
        return product;
      })
    );
  };

  const removeProduct = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const addColor = (productId) => {
    if (!newColor.trim()) return;

    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            colors: [...product.colors, newColor.trim()],
          };
        }
        return product;
      })
    );

    setNewColor("");
  };

  const removeColor = (productId, colorIndex) => {
    setProducts(
      products.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            colors: product.colors.filter((_, index) => index !== colorIndex),
          };
        }
        return product;
      })
    );
  };

  const subtotal = products.reduce(
    (sum, product) => sum + (product.totalPrice || 0),
    0
  );
  const totalQuantity = products.reduce(
    (sum, product) => sum + (product.quantity || 0),
    0
  );
  const grandTotal = subtotal - discount;

  const handleSubmit = async () => {
    const orderData = {
      retailerId,
      mobileNumber: formData.phoneNumber,
      firstname: formData.firstName,
      lastname: formData.lastName,
      gender: formData.gender,
      source: formData.source,
      products: products.map((product) => ({
        productName: product.name,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        totalPrice: product.totalPrice,
        color: product.colors.join(","),
      })),
      orderSummary: {
        totalItems: totalQuantity,
        subTotal: subtotal,
        discount: discount,
        grandTotal: grandTotal,
        paymentStatus: paymentStatus,
      },
    };

    try {
      const response = await api.post("/api/orderHistory/", orderData);
      console.log("Order saved successfully:", response.data);
      alert("Order saved successfully");

      // Clear form data after successful submission
      setFormData({
        phoneNumber: "",
        firstName: "",
        lastName: "",
        gender: "",
        source: "",
      });

      // Reset products to initial state
      setProducts([
        {
          id: 1,
          name: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          colors: [],
          isAutoPopulated: false,
        },
      ]);

      // Reset other form states
      setDiscount(0);
      setPaymentStatus("Unpaid");
      setNewColor("");
      setSearchResults([]);
      setShowSuggestions(false);
      setProductSearchResults({});
      setShowProductSuggestions({});
      setCurrentProductSearches({});
    } catch (error) {
      console.error("Error saving order:", error);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm"
      style={{ overflow: "visible" }}
    >
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            Daily Order sheet
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Scan size={16} />
            Scanner
          </button>
          <button
            onClick={onNewOrder}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
          >
            <Plus size={16} />
            New Order
          </button>
        </div>
      </div>

      <div className="p-6" style={{ overflow: "visible" }}>
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Customer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter first name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="Enter Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((customer) => (
                    <div
                      key={customer._id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectCustomer(customer)}
                    >
                      <div className="font-medium">
                        {customer.firstname} {customer.lastname}
                      </div>
                      <div className="text-sm text-gray-600">
                        {customer.mobileNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => handleInputChange("source", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Source</option>
                <option value="walk-in">Walk-in</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Product Entry</h3>
            <button
              onClick={addProduct}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>

          <div className="overflow-y-visible">
            <table className="w-full relative">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Unit Price (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total Price (₹)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Colors
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200">
                    <td
                      className="px-4 py-3 relative"
                      style={{ overflow: "visible" }}
                    >
                      <input
                        type="text"
                        value={
                          currentProductSearches[product.id] || product.name
                        }
                        onChange={(e) =>
                          handleProductNameChange(product.id, e.target.value)
                        }
                        placeholder="Search product"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                        onFocus={() => {
                          if (
                            currentProductSearches[product.id]?.length >= 3 &&
                            productSearchResults[product.id]?.length > 0
                          ) {
                            setShowProductSuggestions((prev) => ({
                              ...prev,
                              [product.id]: true,
                            }));
                          }
                        }}
                        onBlur={() =>
                          setTimeout(() => {
                            setShowProductSuggestions((prev) => ({
                              ...prev,
                              [product.id]: false,
                            }));
                          }, 200)
                        }
                      />
                      {showProductSuggestions[product.id] &&
                        productSearchResults[product.id]?.length > 0 && (
                          <div
                            className="absolute z-[9999] mt-1 bg-white border border-gray-300 rounded-md shadow-2xl max-h-60 overflow-auto min-w-[400px] left-0"
                            style={{
                              width: "max-content",
                              maxWidth: "500px",
                              transform: "translateY(0)",
                            }}
                          >
                            {productSearchResults[product.id].map(
                              (productResult) => (
                                <div
                                  key={productResult._id}
                                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectProduct(product.id, productResult);
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    selectProduct(product.id, productResult);
                                  }}
                                >
                                  <div className="font-medium text-gray-900 mb-1">
                                    {productResult.productname}
                                  </div>
                                  <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                                    <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                      ₹{productResult.price}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                      Stock: {productResult.stock}
                                    </span>
                                    {productResult.colors &&
                                      productResult.colors.length > 0 && (
                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                          Colors:{" "}
                                          {productResult.colors.join(", ")}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={product.unitPrice}
                          onChange={(e) =>
                            updateProduct(
                              product.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 ${
                            product.isAutoPopulated
                              ? "border-green-300 bg-green-50"
                              : "border-gray-300"
                          }`}
                          placeholder="0.00"
                          title={
                            product.isAutoPopulated
                              ? "Unit price auto-populated from inventory"
                              : "Enter unit price"
                          }
                        />
                        {/* {product.isAutoPopulated && (
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" title="Auto-populated from inventory"></div>
                      )} */}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={product.totalPrice}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "totalPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        {product.colors.map((color, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100"
                          >
                            {color}
                            <button
                              onClick={() => removeColor(product.id, index)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        ))}
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            placeholder="Add color"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                          />
                          <button
                            onClick={() => addColor(product.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Order Summary
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Items:</span>
              <span className="font-medium">{totalQuantity}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={subtotal}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="flex justify-between text-lg font-semibold border-t pt-3">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status:</span>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={paymentStatus === "Paid"}
                    onChange={(e) =>
                      setPaymentStatus(e.target.checked ? "Paid" : "Unpaid")
                    }
                    className="form-checkbox h-5 w-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <span className="ml-2 text-gray-700">{paymentStatus}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyOrderSheet;
