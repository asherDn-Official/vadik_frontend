import WhatsAppIntegration from "../integration/WhatsAppIntegration";
import PropTypes from "prop-types";

const WhatsAppSetup = ({
  isUsingOwnWhatsapp = false,
  onConfigChange,
  onUseDefault,
  onContinue,
  goToPreviousStep,
}) => {
  return (
    <div className="space-y-8">
      <div className="step-container">
        <h2 className="step-header">WhatsApp Setup</h2>
        <p className="step-description">
          Choose whether to continue with Vadik&apos;s default WhatsApp account or connect your own Meta WhatsApp account now.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#F9E8EF] text-[#CB376D] text-xs font-bold uppercase tracking-wider mb-4">
            Default option
          </div>
          <h3 className="text-2xl font-bold text-[#313166] mb-3">Use Vadik WhatsApp for now</h3>
          <p className="text-sm text-gray-600 leading-7 mb-5">
            Your business can start immediately with Vadik&apos;s managed WhatsApp account. You can switch to your own Meta account later from Integrations.
          </p>
          <div className="space-y-3 text-sm text-gray-600 mb-6">
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              Messages continue through Vadik&apos;s default account and default templates.
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              You can still connect your own number later from the WhatsApp tab in Integrations.
            </div>
          </div>
          <button
            type="button"
            onClick={onUseDefault}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white font-semibold hover:opacity-95 transition-opacity"
          >
            Skip for now and continue
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#EEF2FF] text-[#313166] text-xs font-bold uppercase tracking-wider mb-4">
            Recommended for your brand
          </div>
          <h3 className="text-2xl font-bold text-[#313166] mb-3">Connect your own Meta WhatsApp</h3>
          <p className="text-sm text-gray-600 leading-7 mb-5">
            Use Meta embedded signup to connect your own business number. After this, we&apos;ll help you review the templates that will be created in your account.
          </p>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              Your customers will see your own WhatsApp business identity.
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-gray-200 p-4">
              After successful connection, you&apos;ll review the default templates before we create them in your account.
            </div>
          </div>
        </div>
      </div>

      {isUsingOwnWhatsapp && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-green-800">Your own WhatsApp account is connected</h3>
            <p className="text-sm text-green-700">
              Continue to review the templates that Vadik will create and map in your Meta account.
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="px-5 py-3 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            Continue to template review
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

      <WhatsAppIntegration onConfigChange={onConfigChange} />
    </div>
  );
};

export default WhatsAppSetup;

WhatsAppSetup.propTypes = {
  isUsingOwnWhatsapp: PropTypes.bool,
  onConfigChange: PropTypes.func.isRequired,
  onUseDefault: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  goToPreviousStep: PropTypes.func.isRequired,
};
