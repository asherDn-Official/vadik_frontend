import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ProgressIndicator from "../components/registration/ProgressIndicator";
import BasicInformation from "../components/registration/BasicInformation";
import StoreInformation from "../components/registration/StoreInformation";
import AdditionalDetails from "../components/registration/AdditionalDetails";
import Completion from "../components/registration/Completion";

const Register = ({ formData, updateFormData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const goToStep = (step) => {
    setCurrentStep(step);

    switch (step) {
      case 1:
        navigate("/register/basic");
        break;
      case 2:
        navigate("/register/store");
        break;
      case 3:
        navigate("/register/additional");
        break;
      case 4:
        navigate("/register/complete");
        break;
      default:
        navigate("/register/basic");
    }
  };

  return (
    <div className="min-h-screen bg-background-light m-10">
      <div className="flex register-header mb-10 bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-[20px]">
        <div className="image-gift mt-16">
          <img src="/assets/gift-image.png" alt="" />
        </div>
        <div className="container mx-auto px-4">
          <h1 className="text-[26px] font-bold mb-2">
            Quick Setup to Get Started
          </h1>
          <p className="mb-4 text-[18px]">
            An all-in-one platform to manage your Store, connect with customers,
            and grow your business digitally.
          </p>
          <p className="mb-6 text-[18px]">
            Create your account and set up your Store in just 3 simple steps. It
            only takes a minute to complete and start using the platform:
          </p>

          <ProgressIndicator currentStep={currentStep} />
        </div>
      </div>

      <div className="container mx-auto pb-8">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/register/basic\" replace />}
          />
          <Route
            path="/basic"
            element={
              <BasicInformation
                formData={formData}
                updateFormData={updateFormData}
                goToNextStep={() => goToStep(2)}
              />
            }
          />
          <Route
            path="/store"
            element={
              <StoreInformation
                formData={formData}
                updateFormData={updateFormData}
                goToNextStep={() => goToStep(3)}
              />
            }
          />
          <Route
            path="/additional"
            element={
              <AdditionalDetails
                formData={formData}
                updateFormData={updateFormData}
                goToNextStep={() => goToStep(4)}
              />
            }
          />
          <Route
            path="/complete"
            element={<Completion formData={formData} />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default Register;
