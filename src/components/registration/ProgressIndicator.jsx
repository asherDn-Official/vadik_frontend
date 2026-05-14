import React from "react";
import PropTypes from "prop-types";

const ProgressIndicator = ({ currentStep, completedSteps = [], onStepChange = null, isCurrentStepValid = false }) => {
  const steps = [
    {
      number: 1,
      title: "Basic Information",
      subtitle: "Tell us about yourself.",
    },
    {
      number: 2,
      title: "Business  Basic Info",
      subtitle: "Share your Business's core details.",
    },
    {
      number: 3,
      title: "Additional Details",
      subtitle: "Complete your Business  profile.",
    },
    {
      number: 4,
      title: "WhatsApp Setup",
      subtitle: "Use Vadik or connect your own Meta account.",
    },
    {
      number: 5,
      title: "Template Review",
      subtitle: "Review the templates used in your automations.",
    },
    { number: 6, title: "You're All Set!", subtitle: "" },
  ];

  const getProgressClass = (step) => {
    return step < currentStep - 1 ? "progress-connector-100" : "progress-connector-0";
  };

  const handleStepClick = (stepNumber) => {
    if (!onStepChange) return;
    
    if (stepNumber > currentStep && !isCurrentStepValid) {
      return;
    }
    
    if (stepNumber < currentStep || completedSteps.includes(stepNumber)) {
      onStepChange(stepNumber);
    } else if (stepNumber === currentStep) {
      onStepChange(stepNumber);
    }
  };

  const isStepClickable = (stepNumber) => {
    if (stepNumber === currentStep) return true;
    if (stepNumber < currentStep) return true;
    if (completedSteps.includes(stepNumber)) return true;
    return false;
  };

  const getIndicatorStyle = (stepNumber) => {
    const isCompleted = completedSteps.includes(stepNumber);
    const isActive = stepNumber === currentStep;
    const isClickable = isStepClickable(stepNumber);

    if (isCompleted) {
      return `bg-gradient-to-r from-[#FADA07] to-[#FFD700] text-[#EC396F] shadow-lg shadow-[#FADA07]/50 cursor-pointer`;
    }

    if (isActive) {
      return `bg-gradient-to-r from-[#FADA07] to-[#FFD700] text-[#EC396F] shadow-lg shadow-[#FADA07]/50 ${
        isCurrentStepValid ? "shadow-lg shadow-[#4ADE80]/50" : ""
      } cursor-pointer`;
    }

    if (isClickable) {
      return `bg-[#FADA07] text-[#EC396F] cursor-pointer hover:shadow-md hover:shadow-[#FADA07]/30`;
    }

    return `bg-gray-400 text-gray-600 cursor-not-allowed opacity-60`;
  };

  const getTextStyle = (stepNumber) => {
    const isCompleted = completedSteps.includes(stepNumber);
    const isActive = stepNumber === currentStep;
    const isClickable = isStepClickable(stepNumber);

    if (isActive || isCompleted) {
      return `text-white font-semibold`;
    }

    if (isClickable) {
      return `text-gray-100`;
    }

    return `text-gray-300 opacity-60`;
  };

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <button
              onClick={() => handleStepClick(step.number)}
              disabled={!isStepClickable(step.number)}
              className={`rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300 ${getIndicatorStyle(
                step.number
              )}`}
              title={
                step.number > currentStep && !isCurrentStepValid
                  ? "Complete current step first"
                  : step.title
              }
            >
              {completedSteps.includes(step.number) ? (
                <span className="text-lg">✓</span>
              ) : (
                step.number
              )}
            </button>
            <div className="text-center">
              <h4
                className={`text-sm font-medium transition-colors duration-300 ${getTextStyle(
                  step.number
                )}`}
              >
                {step.title}
              </h4>
              {step.subtitle && (
                <p className="text-xs text-white/70 hidden sm:block">
                  {step.subtitle}
                </p>
              )}
            </div>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`progress-connector flex-1 mx-2 ${getProgressClass(
                index
              )}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProgressIndicator;

ProgressIndicator.propTypes = {
  currentStep: PropTypes.number.isRequired,
  completedSteps: PropTypes.arrayOf(PropTypes.number),
  onStepChange: PropTypes.func,
  isCurrentStepValid: PropTypes.bool,
};
