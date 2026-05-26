import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import ProgressIndicator from "../components/registration/ProgressIndicator";
import BasicInformation from "../components/registration/BasicInformation";
import StoreInformation from "../components/registration/StoreInformation";
import AdditionalDetails from "../components/registration/AdditionalDetails";
import WhatsAppSetup from "../components/registration/WhatsAppSetup";
import TemplateSetup from "../components/registration/TemplateSetup";
import GoogleReviewSetup from "../components/registration/GoogleReviewSetup";
import Completion from "../components/registration/Completion";
import api from "../api/apiconfig";

const Register = ({ formData, updateFormData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [setupState, setSetupState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("registerSetupState")) || {};
    } catch {
      return {};
    }
  });
  const navigate = useNavigate();
  const params = useParams();
  const wildcardPath = params["*"];
  const urlId = wildcardPath?.split("/")?.[1];
  const id = urlId || localStorage.getItem("retailerId");

  const getOnBoradingInitialData = async () => {
    try {
      const response = await api.get(`/api/retailer/profile`);
      const data = response.data.data;

      const savedFormData = localStorage.getItem("formData");
      const parsedSavedData = savedFormData ? JSON.parse(savedFormData) : {};

      const nameParts = data.fullName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const sanitizeDigits = (value) => (value || "").replace(/\D/g, "");
      const apiMobile = sanitizeDigits(data.phone);
      const apiCountryCode = sanitizeDigits(data.phoneCode);

      const hasSavedMobile = Object.prototype.hasOwnProperty.call(parsedSavedData, "mobile");
      const hasSavedCountry = Object.prototype.hasOwnProperty.call(parsedSavedData, "countryCode") ||
        Object.prototype.hasOwnProperty.call(parsedSavedData, "phoneCode");

      updateFormData({
        firstName: parsedSavedData.firstName || firstName,
        lastName: parsedSavedData.lastName || lastName,
        email: data.email,
        countryCode: hasSavedCountry
          ? sanitizeDigits(parsedSavedData.countryCode || parsedSavedData.phoneCode)
          : apiCountryCode,
        mobile: hasSavedMobile ? sanitizeDigits(parsedSavedData.mobile) : apiMobile,
        storeName: parsedSavedData.storeName || data.storeName,
      });
      setSetupState((prev) => ({
        ...prev,
        isUsingOwnWhatsapp: data?.isUsingOwnWhatsapp || prev.isUsingOwnWhatsapp || false,
      }));
    } catch (err) {
      console.error("Error fetching onboarding context:", err);
      // Restore from localStorage if API fails
      const savedFormData = localStorage.getItem("formData");
      if (savedFormData) {
        updateFormData(JSON.parse(savedFormData));
      }
    }
  };

  useEffect(() => {
    if (urlId) {
      getOnBoradingInitialData();
      localStorage.setItem("retailerId", urlId);
    }
  }, [urlId]);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("registerSetupState", JSON.stringify(setupState));
  }, [setupState]);

  useEffect(() => {
    const savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        const sanitizeDigits = (value) => (value || "").replace(/\D/g, "");
        updateFormData({
          ...parsedData,
          countryCode: sanitizeDigits(parsedData.countryCode || parsedData.phoneCode),
          mobile: sanitizeDigits(parsedData.mobile),
        });
      } catch (err) {
        console.error("Error parsing saved form data:", err);
      }
    }
  }, []);

  useEffect(() => {
    const routeStep = (() => {
      if (!wildcardPath || wildcardPath === "") return 1;
      if (wildcardPath.startsWith("basic")) return 1;
      if (wildcardPath.startsWith("store")) return 2;
      if (wildcardPath.startsWith("additional")) return 3;
      if (wildcardPath.startsWith("whatsapp")) return 4;
      if (wildcardPath.startsWith("templates")) return 5;
      if (wildcardPath.startsWith("google-review")) return 6;
      if (wildcardPath.startsWith("complete")) return 7;
      return 1;
    })();

    setCurrentStep(routeStep);
  }, [wildcardPath]);

  const validateBasicInfo = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.countryCode &&
      formData.mobile &&
      formData.email
    );
  };

  const validateStoreInfo = () => {
    return (
      formData.storeName &&
      formData.storeType &&
      formData.storeAddress &&
      formData.city &&
      formData.pincode
    );
  };

  const validateAdditionalInfo = () => {
    return (
      formData.staffCount &&
      formData.customerCount &&
      formData.contactNumber &&
      formData.ownerName
    );
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return validateBasicInfo();
      case 2:
        return validateStoreInfo();
      case 3:
        return validateAdditionalInfo();
      case 4:
        return setupState.whatsappChoice === "default" || setupState.isUsingOwnWhatsapp === true;
      case 5:
        return setupState.templateSetupCompleted === true;
      case 6:
        return (
          setupState.googleReviewSetupCompleted === true ||
          setupState.googleReviewSkipped === true
        );
      default:
        return true;
    }
  };

  const goToStep = (step) => {
    switch (step) {
      case 1:
        navigate(`/register/basic/${id}`);
        break;
      case 2:
        navigate("/register/store");
        break;
      case 3:
        navigate("/register/additional");
        break;
      case 4:
        navigate("/register/whatsapp");
        break;
      case 5:
        navigate("/register/templates");
        break;
      case 6:
        navigate("/register/google-review");
        break;
      case 7:
        navigate("/register/complete");
        break;
      default:
        navigate("/register/basic");
    }
  };

  const handleStepChange = (step) => {
    if (step > currentStep && !isStepValid(currentStep)) {
      return;
    }
    goToStep(step);
  };

  const completedSteps = [1, 2, 3, 4, 5, 6].filter((step) => isStepValid(step));

  const updateSetupState = (newData) => {
    setSetupState((prev) => ({ ...prev, ...newData }));
  };

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-background-light flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
  //           {/* <span className="visually-hidden">Loading...</span> */}
  //         </div>
  //         <p className="mt-4">Loading your information...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
            An all-in-one platform to manage your Business , connect with customers,
            and grow your business digitally.
          </p>
          <p className="mb-6 text-[18px]">
            Create your account and set up your Business in just 6 simple steps. It
            only takes a minute to complete and start using the platform:
          </p>

          <ProgressIndicator 
            currentStep={currentStep} 
            completedSteps={completedSteps}
            onStepChange={handleStepChange}
            isCurrentStepValid={isStepValid(currentStep)}
          />
        </div>
      </div>

      <div className="container mx-auto pb-8">
        <Routes>
          <Route
            path="/"
            element={<Navigate to={`/register/basic/${id}`} replace />}
          />
          <Route
            path="/basic/:id"
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
                goToPreviousStep={() => goToStep(1)}
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
                goToPreviousStep={() => goToStep(2)}
              />
            }
          />
          <Route
            path="/whatsapp"
            element={
              <WhatsAppSetup
                isUsingOwnWhatsapp={setupState.isUsingOwnWhatsapp === true}
                onConfigChange={(config) => {
                  updateSetupState({
                    isUsingOwnWhatsapp: config?.isUsingOwnWhatsapp === true,
                    whatsappChoice:
                      config?.isUsingOwnWhatsapp === true
                        ? "own"
                        : setupState.whatsappChoice,
                  });
                }}
                onUseDefault={() => {
                  updateSetupState({
                    whatsappChoice: "default",
                    isUsingOwnWhatsapp: false,
                    templateSetupCompleted: false,
                    googleReviewSetupCompleted: false,
                    googleReviewSkipped: false,
                  });
                  goToStep(5);
                }}
                onContinue={() => {
                  updateSetupState({
                    whatsappChoice: "own",
                    isUsingOwnWhatsapp: true,
                    templateSetupCompleted: false,
                    googleReviewSetupCompleted: false,
                    googleReviewSkipped: false,
                  });
                  goToStep(5);
                }}
                goToPreviousStep={() => goToStep(3)}
              />
            }
          />
          <Route
            path="/templates"
            element={
              <TemplateSetup
                isUsingOwnWhatsapp={setupState.isUsingOwnWhatsapp === true}
                markTemplateSetupComplete={() =>
                  updateSetupState({ templateSetupCompleted: true })
                }
                goToNextStep={() => goToStep(6)}
                goToPreviousStep={() => goToStep(4)}
              />
            }
          />
          <Route
            path="/google-review"
            element={
              <GoogleReviewSetup
                isCompleted={setupState.googleReviewSetupCompleted === true}
                onComplete={() => {
                  updateSetupState({
                    googleReviewSetupCompleted: true,
                    googleReviewSkipped: false,
                  });
                  goToStep(7);
                }}
                onSkip={() => {
                  updateSetupState({
                    googleReviewSetupCompleted: false,
                    googleReviewSkipped: true,
                  });
                  goToStep(7);
                }}
                goToPreviousStep={() => goToStep(5)}
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

Register.propTypes = {
  formData: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    mobile: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    storeName: PropTypes.string,
    storeType: PropTypes.string,
    storeAddress: PropTypes.string,
    city: PropTypes.string,
    pincode: PropTypes.string,
    logo: PropTypes.any,
    staffCount: PropTypes.string,
    customerCount: PropTypes.string,
    contactNumber: PropTypes.string,
    ownerName: PropTypes.string,
    gstNumber: PropTypes.string,
    countryCode: PropTypes.string,
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
};
