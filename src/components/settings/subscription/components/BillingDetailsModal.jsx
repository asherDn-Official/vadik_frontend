import { CheckCircle } from "lucide-react";

export default function BillingDetailsModal({
  isOpen,
  onClose,
  billNumber,
  totalAmount,
  gstAmount,
  subtotal,
  isCredits = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-green-800">
            {isCredits ? "Credits Added Successfully!" : "Payment Successful!"}
          </h2>
          <p className="text-green-700 text-sm mt-1">
            Your {isCredits ? "credits have been added" : "subscription is now active"}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">Invoice Number:</span>
              <span className="text-gray-800 font-semibold text-lg">#{billNumber}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800 font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">GST (18%):</span>
              <span className="text-gray-800 font-medium">₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center bg-pink-50 -mx-6 px-6 py-3">
              <span className="text-gray-800 font-semibold text-lg">Total Amount:</span>
              <span className="text-pink-700 font-bold text-2xl">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-blue-800 text-sm">
              <strong>✓</strong> An invoice has been sent to your registered email.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-pink-700 text-white rounded-lg font-medium hover:bg-pink-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
