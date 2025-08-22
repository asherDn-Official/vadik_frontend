import React, { useState, useEffect, useRef } from "react";
import { Scan, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import api from "../../api/apiconfig"
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import showToast from "../../utils/ToastNotification";


const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [callback]);

  return ref;
};

const DailyOrderSheet = ({ customer, onBack, onNewOrder }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      phoneNumber: "",
      firstName: "",
      lastName: "",
      gender: "",
      source: "",
      products: [
        {
          id: 1,
          name: "",
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          colors: [],
          isAutoPopulated: false,
        },
      ],
      discount: 0,
      paymentStatus: "Unpaid",
    },
  });

  const [newColor, setNewColor] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [productSearchResults, setProductSearchResults] = useState({});
  const [showProductSuggestions, setShowProductSuggestions] = useState({});
  const [currentProductSearches, setCurrentProductSearches] = useState({});
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState<number | null>(null);
  const [isAutofilled, setIsAutofilled] = useState<boolean>(false);

  const formData = watch();
  const products = formData.products || [];

  // Create a ref for the suggestions dropdown
  const suggestionsRef = useOutsideClick(() => {
    setShowSuggestions(false);
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

  useEffect(() => {
    if (customer) {
      // Set form values
      setValue("phoneNumber", customer.mobileNumber || customer.mobile || "");
      setValue("firstName", customer.firstname || customer.firstName || "");
      setValue("lastName", customer.lastname || customer.lastName || "");
      setValue("gender", customer.additionalData?.gender || customer.gender || "");
      setValue("source", customer.source || "");

      // Autofill flags and points
      setIsAutofilled(true);
      const lp = typeof customer.loyaltyPoints === 'number' ? customer.loyaltyPoints : null;
      setLoyaltyPoints(lp);

      // Clear validation errors for auto-filled fields
      setTimeout(() => {
        clearErrors(["phoneNumber", "firstName", "lastName", "gender", "source"]);
      }, 100);
    } else {
      setIsAutofilled(false);
      setLoyaltyPoints(null);
    }
  }, [customer, setValue, clearErrors]);

  const searchProducts = async (query, productId) => {
    try {
      const response = await api.get(
        `/api/inventory?retailerId=${retailerId}&search=${query}`
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
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          name: selectedProduct.productname,
          unitPrice: selectedProduct.price,
          colors: [...selectedProduct.colors],
          isAutoPopulated: true,
          totalPrice: product.quantity * selectedProduct.price,
        };
      }
      return product;
    });

    setValue("products", updatedProducts);

    // Clear validation error for this product name
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      clearErrors(`products.${productIndex}.name`);
    }

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

    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return { ...product, name: value };
      }
      return product;
    });
    setValue("products", updatedProducts);

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

  const handleInputChange = async (field, value) => {
    setValue(field, value);

    // Clear error for this field immediately
    clearErrors(field);

    // Revalidate the field after a short delay
    setTimeout(() => {
      trigger(field);
    }, 300);

    if (field === "phoneNumber") {
      // Any manual edit should mark as not autofilled and hide points
      setIsAutofilled(false);
      setLoyaltyPoints(null);

      if (value.length >= 3) {
        searchCustomers(value);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }
  };

   const handlePhoneChange = (value, country) => {
    // Remove the country code prefix to get just the local number
    const localNumber = value.replace(country.dialCode, "");

    // Any change in phone input is considered manual until a suggestion is selected
    setIsAutofilled(false);
    setLoyaltyPoints(null);
    
    setValue("phoneNumber", value);
    clearErrors("phoneNumber");
    
    // Trigger validation after a short delay
    setTimeout(() => {
      trigger("phoneNumber");
    }, 300);

    // Search customers when phone number is valid (at least 10 digits including country code)
    if (value.length >= 3) { // Country code + 10 digits
      searchCustomers(value);
      setShowSuggestions(true);
    } else {
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
    setValue("phoneNumber", customer.mobileNumber || "");
    setValue("firstName", customer.firstname || "");
    setValue("lastName", customer.lastname || "");
    setValue("gender", customer.gender || "");
    setValue("source", customer.source || "");

    // Autofill flags and points
    setIsAutofilled(true);
    const lp = typeof customer.loyaltyPoints === 'number' ? customer.loyaltyPoints : null;
    setLoyaltyPoints(lp);

    // Clear validation errors for all customer fields
    clearErrors(["phoneNumber", "firstName", "lastName", "gender", "source"]);

    // Trigger validation to ensure fields are valid
    setTimeout(() => {
      trigger(["phoneNumber", "firstName", "lastName", "gender", "source"]);
    }, 100);

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
    setValue("products", [...products, newProduct]);
  };

  const updateProduct = (id, field, value) => {
    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        const updated = { ...product, [field]: value };

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
    });

    setValue("products", updatedProducts);

    // Clear validation error for the updated field
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex !== -1) {
      clearErrors(`products.${productIndex}.${field}`);
    }
  };

  const removeProduct = (id) => {
    const filteredProducts = products.filter((product) => product.id !== id);
    setValue("products", filteredProducts);
  };

  const addColor = (productId) => {
    if (!newColor.trim()) return;

    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          colors: [...product.colors, newColor.trim()],
        };
      }
      return product;
    });

    setValue("products", updatedProducts);
    setNewColor("");
  };

  const removeColor = (productId, colorIndex) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        return {
          ...product,
          colors: product.colors.filter((_, index) => index !== colorIndex),
        };
      }
      return product;
    });

    setValue("products", updatedProducts);
  };

  const subtotal = products.reduce(
    (sum, product) => sum + (product.totalPrice || 0),
    0
  );
  const totalQuantity = products.reduce(
    (sum, product) => sum + (product.quantity || 0),
    0
  );
  const grandTotal = subtotal - (formData.discount || 0);

  const onSubmit = async (data) => {
    const orderData = {
      retailerId,
      mobileNumber: data.phoneNumber,
      firstname: data.firstName,
      lastname: data.lastName,
      gender: data.gender,
      source: data.source,
      products: data.products.map((product) => ({
        productName: product.name,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        totalPrice: product.totalPrice,
        color: product.colors.join(","),
      })),
      orderSummary: {
        totalItems: totalQuantity,
        subTotal: subtotal,
        discount: data.discount || 0,
        grandTotal: grandTotal,
        paymentStatus: data.paymentStatus || "Unpaid",
      },
    };

    try {
      const response = await api.post("/api/orderHistory/", orderData);
      console.log("Order saved successfully:", response.data);
      showToast("Order saved successfully", "success");

      // Reset form
      reset({
        phoneNumber: "",
        firstName: "",
        lastName: "",
        gender: "",
        source: "",
        products: [
          {
            id: 1,
            name: "",
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            colors: [],
            isAutoPopulated: false,
          },
        ],
        discount: 0,
        paymentStatus: "Unpaid",
      });

      // Clear search states
      setSearchResults([]);
      setShowSuggestions(false);
      setProductSearchResults({});
      setShowProductSuggestions({});
      setCurrentProductSearches({});
      setNewColor("");
    } catch (error) {
      showToast("Error saving order. Please try again.","error");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm" style={{ overflow: "visible" }}>
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Daily Order sheet</h2>
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

      <form onSubmit={handleSubmit(onSubmit)} className="p-6" style={{ overflow: "visible" }}>
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters"
                  }
                })}
                type="text"
                placeholder="Enter first name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 1,
                    message: "Last name must be at least 2 characters"
                  }
                })}
                type="text"
                placeholder="Enter last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isAutofilled && typeof loyaltyPoints === 'number' && (
                <div className="inline-flex items-center px-2 py-1 ml-2 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 align-middle">
                  Loyalty Points: {loyaltyPoints}
                </div>
              )}
              <Controller
                name="phoneNumber"
                control={control}
                rules={{
                  required: "Phone number is required",
                  validate: (value) => {
                    // Remove any non-digit characters for validation
                    const digitsOnly = value.replace(/\D/g, '');
                    return digitsOnly.length >= 10 || "Please enter a valid phone number";
                  }
                }}
                render={({ field }) => (
                  <PhoneInput
                    country={"in"}
                    value={field.value}
                    onChange={(value, country) => {
                      field.onChange(value);
                      handlePhoneChange(value, country);
                    }}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    inputStyle={{
                      width: "100%",
                      paddingLeft: "48px",
                      height: "42px"
                    }}
                    dropdownClass="text-gray-700"
                    enableSearch={true}
                    countryCodeEditable={false}
                  />
                )}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
              )}
              {showSuggestions && searchResults.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
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
                {...register("gender", { required: "Gender is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                onChange={(e) => handleInputChange("gender", e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                {...register("source", { required: "Source is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                onChange={(e) => handleInputChange("source", e.target.value)}
              >
                <option value="">Select Source</option>
                <option value="walk-in">Walk-in</option>
                <option value="online">Online</option>
              </select>
              {errors.source && (
                <p className="text-red-500 text-sm mt-1">{errors.source.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-800">Product Entry</h3>
            <button
              type="button"
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
                {products.map((product, index) => (
                  <tr key={product.id} className="border-b border-gray-200">
                    <td className="px-4 py-3 relative" style={{ overflow: "visible" }}>
                      <input
                        {...register(`products.${index}.name`, {
                          required: "Product name is required"
                        })}
                        type="text"
                        value={currentProductSearches[product.id] || product.name}
                        onChange={(e) => handleProductNameChange(product.id, e.target.value)}
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
                      {errors.products?.[index]?.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index].name.message}
                        </p>
                      )}
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
                        {...register(`products.${index}.quantity`, {
                          required: "Quantity is required",
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1"
                          }
                        })}
                        type="number"
                        min="1"
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                      {errors.products?.[index]?.quantity && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index].quantity.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <input
                          {...register(`products.${index}.unitPrice`, {
                            required: "Unit price is required",
                            min: {
                              value: 0,
                              message: "Unit price cannot be negative"
                            }
                          })}
                          type="number"
                          step="0.01"
                          min="0"
                          onChange={(e) =>
                            updateProduct(
                              product.id,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 ${product.isAutoPopulated
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
                        {errors.products?.[index]?.unitPrice && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.products[index].unitPrice.message}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        {...register(`products.${index}.totalPrice`, {
                          required: "Total price is required",
                          min: {
                            value: 0,
                            message: "Total price cannot be negative"
                          }
                        })}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) =>
                          updateProduct(
                            product.id,
                            "totalPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                      {errors.products?.[index]?.totalPrice && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.products[index].totalPrice.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        {product.colors.map((color, colorIndex) => (
                          <span
                            key={colorIndex}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100"
                          >
                            {color}
                            <button
                              type="button"
                              onClick={() => removeColor(product.id, colorIndex)}
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
                            type="button"
                            onClick={() => addColor(product.id)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
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
                  {...register("discount", {
                    min: {
                      value: 0,
                      message: "Discount cannot be negative"
                    },
                    max: {
                      value: subtotal,
                      message: "Discount cannot exceed subtotal"
                    }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  max={subtotal}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
                  onChange={(e) => {
                    setValue("discount", parseFloat(e.target.value) || 0);
                    clearErrors("discount");
                  }}
                />
              </div>
            </div>
            {errors.discount && (
              <p className="text-red-500 text-sm text-right">
                {errors.discount.message}
              </p>
            )}

            <div className="flex justify-between text-lg font-semibold border-t pt-3">
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status:</span>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center">
                  <Controller
                    name="paymentStatus"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value === "Paid"}
                        onChange={(e) =>
                          field.onChange(e.target.checked ? "Paid" : "Unpaid")
                        }
                        className="form-checkbox h-5 w-5 text-pink-600 rounded focus:ring-pink-500"
                      />
                    )}
                  />
                  <span className="ml-2 text-gray-700">
                    {formData.paymentStatus}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            className="px-8 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default DailyOrderSheet;