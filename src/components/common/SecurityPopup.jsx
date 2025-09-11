import { useState } from 'react';

export default function SecurityPopup() {
  const [isVisible, setIsVisible] = useState(true);

  const handleConfirm = () => {
    console.log('User confirmed - redirect to login');
    setIsVisible(false);
  };

  const handleCancel = () => {
    console.log('User cancelled');
    setIsVisible(false);
  };

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <button 
          onClick={() => setIsVisible(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Security Popup
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      
      {/* Popup positioned at top center */}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Security Notice</h3>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-gray-700 leading-relaxed">
              For security reasons, when switching from demo data to live data, you will need to log in again. This ensures your account and data remain protected.
            </p>
          </div>
          
          {/* Footer with buttons */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>

      {/* Demo content behind the popup */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Demo Application</h1>
        <p className="text-gray-600">This is the background content that appears behind the security popup.</p>
      </div>
    </div>
  );
}