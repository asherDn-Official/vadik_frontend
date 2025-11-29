
export default function SubscriptionCard({
  title,
  price,
  period,
  features,
  recommended = false,
  variant = 'primary',
  isCurrentPlan = false,
  hasActiveSubscription = false,
  isAddon = false
}) {
  const cardStyles = variant === 'primary'
    ? 'bg-gradient-to-b from-pink-700 to-purple-800'
    : 'bg-white border border-gray-200';

  const textColor = variant === 'primary' ? 'text-white' : 'text-gray-800';
  
  const getButtonStyles = () => {
    if (isCurrentPlan && !isAddon) {
      return 'bg-gray-400 text-white cursor-not-allowed opacity-60';
    }
    if (hasActiveSubscription && !isAddon && !isCurrentPlan) {
      return 'bg-gray-400 text-white cursor-not-allowed opacity-60';
    }
    return variant === 'primary'
      ? 'bg-white text-pink-700 hover:bg-gray-100'
      : 'bg-pink-700 text-white hover:bg-pink-800';
  };

  const getButtonText = () => {
    if (isCurrentPlan && !isAddon) {
      return 'Subscribed';
    }
    if (hasActiveSubscription && !isAddon && !isCurrentPlan) {
      return 'Change Plan';
    }
    return isAddon ? 'Add Now' : 'Upgrade Plan';
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg flex flex-col ${cardStyles}`}>
      {recommended && (
        <div className="text-center mb-4">
          {/* <span className={`text-sm ${variant === 'primary' ? 'text-white' : 'text-gray-600'}`}>
            Most Recommended
          </span> */}
        </div>
      )}

      <h3 className={`text-xl font-semibold text-center mb-4 capitalize ${textColor}`}>
        {title}
      </h3>

      <div className="text-center mb-6">
        <span className={`text-4xl font-bold ${textColor}`}>Rs. {price.toLocaleString()}</span>
        <span className={`text-sm ${variant === 'primary' ? 'text-white/80' : 'text-gray-500'}`}>/{period}</span>
      </div>

      <div className="flex-grow space-y-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className={variant === 'primary' ? 'text-white' : 'text-pink-700'}>✦</span>
            <span className={`text-sm ${variant === 'primary' ? 'text-white' : 'text-gray-700'}`}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button 
        disabled={(isCurrentPlan && !isAddon) || (hasActiveSubscription && !isAddon && !isCurrentPlan)}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${getButtonStyles()}`}
      >
        {getButtonText()}
      </button>
    </div>
  );
}
