import { calculateTotalWithGST } from "../../../../utils/billingUtils";

export default function TopupConfirmationModal({
  isOpen,
  onClose,
  amount,
  onConfirm,
  loading = false,
  orderData
}) {
  if (!isOpen) return null;

  const billing = calculateTotalWithGST(amount);
  const billingAddress = orderData?.billingAddress;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Confirm WhatsApp Credits Top-up
          </h2>
          
          <div className="mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Top-up Amount:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-800">Credits</span>
                <span className="text-2xl font-bold text-pink-600">₹ {amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800 font-medium">₹ {billing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">GST ({billing.gstPercentage}%):</span>
              <span className="text-gray-800 font-medium">₹ {billing.gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold border-t pt-3">
              <span>Total Amount:</span>
              <span className="text-pink-600">₹ {billing.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700 text-sm">Billing Address</h4>
              {orderData?.orderId && (
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  ID: {orderData.orderId}
                </span>
              )}
            </div>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm text-gray-700">
              {billingAddress ? (
                <>
                  <div>
                    <p className="font-semibold">{orderData.userName || 'Customer'}</p>
                    <p className="text-gray-600 text-xs">{billingAddress.address}</p>
                    <p className="text-gray-600 text-xs">
                      {billingAddress.city}, {billingAddress.state} {billingAddress.pincode}
                    </p>
                    <p className="text-gray-600 text-xs">{billingAddress.country}</p>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-gray-200">
                    {billingAddress.gstNumber && (
                      <p><span className="text-gray-600">GSTIN:</span> {billingAddress.gstNumber}</p>
                    )}
                    <p><span className="text-gray-600">Email:</span> {orderData.userEmail}</p>
                    <p><span className="text-gray-600">Phone:</span> {orderData.userPhone}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold">RK Platforms India Private Limited</p>
                  <p><span className="text-gray-600">GSTIN:</span> 33AAJCR5770J1Z1</p>
                  <p><span className="text-gray-600">Email:</span> accounts@rkplatforms.com</p>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center font-medium">
              We will invoice you through mail after successful payment
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </div>
      </div>
    </div>
  );
}
