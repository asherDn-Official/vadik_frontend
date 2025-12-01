import { useState } from "react";

const SubscriptionPopup = ({ onClose }) => {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      
      <div className="bg-white rounded-xl p-6 shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-3">Subscribe Now</h2>
        {/* <p className="text-gray-600 mb-5">
          Unlock premium features and enjoy all benefits!
        </p> */}

        <button
          onClick={handleClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>

    </div>
  );
};

export default SubscriptionPopup;
