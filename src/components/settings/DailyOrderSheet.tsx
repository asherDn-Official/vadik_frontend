import React, { useState, useEffect } from "react";
import { Scan, Plus, Trash2 } from "lucide-react";

const DailyOrderSheet = ({ customer, onBack, onNewOrder }) => {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    customerName: "",
    orderId: "",
    gender: "",
    customerType: "",
    firstVisitDate: "",
  });

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Premium Wireless Headphones",
      quantity: 1,
      unitPrice: 249.99,
      totalPrice: 249.99,
    },
  ]);

  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (customer) {
      setFormData({
        phoneNumber: customer.mobile,
        customerName: customer.name,
        orderId: customer.orderId,
        gender: customer.gender,
        customerType: "Regular",
        firstVisitDate: customer.date,
      });
    } else {
      // Reset form for new order
      setFormData({
        phoneNumber: "",
        customerName: "",
        orderId: `ORD-${Date.now()}`,
        gender: "",
        customerType: "",
        firstVisitDate: new Date().toISOString().split("T")[0],
      });
      setProducts([]);
    }
  }, [customer]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id, field, value) => {
    setProducts(
      products.map((product) => {
        if (product.id === id) {
          const updated = { ...product, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.totalPrice = updated.quantity * updated.unitPrice;
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

  const subtotal = products.reduce(
    (sum, product) => sum + product.totalPrice,
    0
  );
  const grandTotal = subtotal - discount;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          Daily Order sheet
        </h2>

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

      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Customer Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => handleInputChange("orderId", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
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
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Visit Date
              </label>
              <input
                type="text"
                value={formData.firstVisitDate}
                onChange={(e) =>
                  handleInputChange("firstVisitDate", e.target.value)
                }
                placeholder="Enter Profession"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Type
              </label>
              <select
                value={formData.customerType}
                onChange={(e) =>
                  handleInputChange("customerType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select Customer Type</option>
                <option value="Regular">Regular</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Product Entry</h3>
            <button
              onClick={addProduct}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Add Product +
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Total Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) =>
                          updateProduct(product.id, "name", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
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
                      <input
                        type="number"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      €{product.totalPrice.toFixed(2)}
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
              <span className="font-medium">{products.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">€{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">€</span>
                <input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="flex justify-between text-lg font-semibold border-t pt-3">
              <span>Grand Total:</span>
              <span>€{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-400 rounded-full"></div>
                <span className="text-gray-600">Unpaid</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button className="px-8 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors font-medium">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyOrderSheet;
