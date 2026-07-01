import PropTypes from "prop-types";
import GooglePlaceReview from "../integration/GooglePlaceReview";

const GoogleReviewSetup = ({
  isCompleted = false,
  onComplete,
  onSkip,
  goToPreviousStep,
}) => {
  return (
    <div className="space-y-8">
      <div className="step-container">
        <h2 className="step-header">Google Review Setup</h2>
        <p className="step-description">
          Connect your Google business location so Vadik can support your Google Place Review workflow from the start.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#F9E8EF] text-[#CB376D] text-xs font-bold uppercase tracking-wider mb-4">
            Optional step
          </div>
          <h3 className="text-2xl font-bold text-[#313166] mb-3">Skip this for now</h3>
          <p className="text-sm text-gray-600 leading-7 mb-5">
            You can finish onboarding now and connect your Google Place Review integration later from Integrations.
          </p>
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              Your account setup will continue without a Google business location.
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              You can come back later and complete this anytime from the Google Place Review integration page.
            </div>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-semibold hover:opacity-95 transition-opacity"
          >
            Skip for now and finish setup
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#EEF2FF] text-[#313166] text-xs font-bold uppercase tracking-wider mb-4">
            Recommended
          </div>
          <h3 className="text-2xl font-bold text-[#313166] mb-3">Connect your Google business location</h3>
          <p className="text-sm text-gray-600 leading-7 mb-5">
            Search for your business, choose the right Google listing, and confirm it to enable the Google Place Review integration during onboarding.
          </p>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              This helps you start using review-related flows without another setup pass later.
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              Once your place is confirmed, you can continue straight to the final onboarding step.
            </div>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-green-800">Google business location connected</h3>
            <p className="text-sm text-green-700">
              Your Google Place Review integration is ready for this business.
            </p>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="px-5 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            Continue to finish setup
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={goToPreviousStep}
          className="min-w-[150px] text-[#CB376D] py-2 px-4 rounded-[10px] bg-white border-2 border-[#CB376D] hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>

      <GooglePlaceReview
        onPlaceConfirmed={onComplete}
        containerClassName="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
      />
    </div>
  );
};

export default GoogleReviewSetup;

GoogleReviewSetup.propTypes = {
  isCompleted: PropTypes.bool,
  onComplete: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  goToPreviousStep: PropTypes.func.isRequired,
};
