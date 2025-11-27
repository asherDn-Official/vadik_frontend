import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle,
  Play,
} from "lucide-react";

export default function TourModal({ tour, isOpen, onClose, onConfirmation }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = tour.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === tour.steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleClose = () => {
    setCurrentStepIndex(0);
    onClose();
  };

  const handleGetGuidance = () => {
    console.log("Get guidance for step:", currentStepIndex);
  };

  const handleConfirm = () => {
    if (currentStep.showConfirmation) {
      // Determine next tour based on current tour
      const nextTourMap = {
        "quick-start": "customer-profile",
        "customer-profile": "integration-management",
        "integration-management": "personalization-insight",
        "personalization-insight": "customer-opportunities",
        "customer-opportunities": "performance-tracking",
        "performance-tracking": "dashboard",
        dashboard: "quick-search",
        "quick-search": "settings",
      };

      const nextTourId = nextTourMap[tour.id];
      if (nextTourId) {
        onConfirmation(nextTourId);
        setCurrentStepIndex(0);
      }
    }
  };

  const handleCancel = () => {
    // Just close the modal if user cancels
    handleClose();
  };

  const getNextModuleName = (currentTourId) => {
    const moduleNames = {
      "quick-start": "Customer Profile",
      "customer-profile": "Integration Management",
      "integration-management": "Personalization Insight",
      "personalization-insight": "Customer Opportunities",
      "customer-opportunities": "Performance Tracking",
      "performance-tracking": "Dashboard",
      dashboard: "Quick Search",
      "quick-search": "Settings",
    };
    return moduleNames[currentTourId] || "Next Module";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{tour.name}</h2>
              <p className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {tour.steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close tour"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep.showConfirmation ? (
            <div className="flex flex-col items-center text-center py-10">
              <CheckCircle className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-3">
                {currentStep.confirmationText || "Ready to continue?"}
              </h3>
              <p className="text-blue-700 text-base max-w-lg mb-8">
                You're about to proceed to{" "}
                <strong>{getNextModuleName(tour.id)}</strong>.
                {currentStep.showGoBackOption && " You can go back to review if needed."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-2 flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors justify-center text-sm"
                >
                  <Play className="w-4 h-4" />
                  {currentStep.confirmButtonText || "Confirm & Continue"}
                </button>
                {currentStep.showGoBackOption && (
                  <button
                    onClick={handlePrevious}
                    className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm"
                  >
                    Go Back
                  </button>
                )}
              </div>
              {currentStep.showGoBackOption && (
                <p className="text-xs text-blue-600 mt-4">
                  You can always revisit this tour from the help menu
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Step Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {currentStep.title}
              </h3>
              {/* Image Section */}
              {currentStep.imageUrl && (
                <div className="mb-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={currentStep.imageUrl}
                    alt={currentStep.title}
                    className="w-full max-h-64 object-contain bg-white"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              {/* Description */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  isFirstStep
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleGetGuidance}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors border border-gray-300 text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                Guidance
              </button>
            </div>

            {/* Progress Dots */}
            <div className="flex gap-1.5 flex-1 max-w-[200px] min-w-[120px] overflow-hidden justify-center">
              {tour.steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStepIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStepIndex
                      ? "bg-blue-600 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Next/Finish Button */}
            {isLastStep ? (
              <button
                onClick={handleClose}
                className="px-5 py-2 border text-black rounded-lg font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm"
              >
                Finish
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentStep.showConfirmation}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  currentStep.showConfirmation
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}