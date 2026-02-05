import React from 'react';

const UnsavedChangesModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-orange-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
          
          <h3 className="text-xl font-semibold text-[#313166] mb-2">Unsaved Changes</h3>
          <p className="text-gray-500 mb-8">
            You have made changes that haven't been saved. Are you sure you want to leave? Your changes will be lost.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
            >
              Stay on Page
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-medium hover:opacity-90 transition-opacity order-1 sm:order-2"
            >
              Leave Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
