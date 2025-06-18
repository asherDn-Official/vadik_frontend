import React from "react";

const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    {
      number: 1,
      title: "Basic Information",
      subtitle: "Tell us about yourself.",
    },
    {
      number: 2,
      title: "Store Basic Info",
      subtitle: "Share your Store's core details.",
    },
    {
      number: 3,
      title: "Additional Details",
      subtitle: "Complete your Store profile.",
    },
    { number: 4, title: "You're All Set!", subtitle: "" },
  ];

  // Determine progress percentage
  const getProgressClass = (step) => {
    if (step < currentStep) return "progress-connector-100";
    if (step === currentStep - 1) {
      if (currentStep === 2) return "progress-connector-33";
      if (currentStep === 3) return "progress-connector-66";
      if (currentStep === 4) return "progress-connector-100";
    }
    return "progress-connector-0";
  };

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center">
            <div
              className={`rounded-full h-10 w-10 flex items-center justify-center font-bold text-sm mb-2
                ${
                  currentStep >= step.number
                    ? "bg-[#FADA07] text-[#EC396F]"
                    : "bg-[#FADA07] text-[#EC396F]"
                }`}
            >
              {step.number}
            </div>
            <div className="text-center">
              <h4
                className={`text-sm font-medium ${
                  currentStep >= step.number ? "text-white" : "text-gray-100"
                }`}
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
