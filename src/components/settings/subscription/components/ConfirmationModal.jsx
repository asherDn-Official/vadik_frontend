import { useState } from "react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  selectedPlan,
  selectedAddons,
  addonQuantities,
  onQuantityChange,
  totalPrice,
  onConfirm,
  loading = false
}) {
  if (!isOpen) return null;

  // Quantity handlers for modal
  const handleIncreaseQuantity = (addonId) => {
    if (onQuantityChange) {
      const currentQuantity = addonQuantities[addonId] || 1;
      onQuantityChange(addonId, currentQuantity + 1);
    }
  };

  const handleDecreaseQuantity = (addonId) => {
    if (onQuantityChange) {
      const currentQuantity = addonQuantities[addonId] || 1;
      if (currentQuantity > 1) {
        onQuantityChange(addonId, currentQuantity - 1);
      }
    }
  };

  const handleQuantityInputChange = (addonId, value) => {
    if (onQuantityChange) {
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue >= 1) {
        onQuantityChange(addonId, numValue);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Confirm Your Subscription
          </h2>
          
          {/* Selected Plan */}
          {selectedPlan && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Selected Plan:</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <span className="text-pink-700 font-semibold">
                    Rs. {selectedPlan.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPlan.durationInDays} days validity
                </p>
              </div>
            </div>
          )}

          {/* Selected Addons */}
          {selectedAddons.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Selected Addons:</h3>
              <div className="space-y-2">
                {selectedAddons.map((addon) => {
                  const quantity = addonQuantities[addon._id] || 1;
                  const addonTotal = addon.price * quantity;
                  
                  return (
                    <div key={addon._id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{addon.name}</span>
                        <span className="text-pink-700 font-semibold">
                          Rs. {addonTotal.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border rounded-md overflow-hidden">
                            <button
                              onClick={() => handleDecreaseQuantity(addon._id)}
                              disabled={quantity <= 1}
                              className="px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityInputChange(addon._id, e.target.value)}
                              min="1"
                              className="w-12 text-center py-1 focus:outline-none"
                            />
                            <button
                              onClick={() => handleIncreaseQuantity(addon._id)}
                              className="px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            Rs. {addon.price.toLocaleString()} × {quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Price */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-pink-700">Rs. {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Steps Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 text-sm mb-2">Payment Process:</h4>
            <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
              <li>Create subscription record</li>
              <li>Generate Razorpay order</li>
              <li>Complete payment in popup</li>
              <li>Verify and activate subscription</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-pink-700 text-white rounded-lg font-medium hover:bg-pink-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}