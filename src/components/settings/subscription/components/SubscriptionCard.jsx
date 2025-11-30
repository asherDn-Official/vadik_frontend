export default function SubscriptionCard({
  title,
  price,
  period,
  features,
  recommended = false,
  variant = 'primary',
  isCurrentPlan = false,
  hasActiveSubscription = false,
  isAddon = false,
  isSelected = false,
  onSelect,
  onTrial,
  plan,
  loading = false
}) {
  const cardStyles = variant === 'primary'
    ? 'bg-gradient-to-b from-pink-700 to-purple-800'
    : 'bg-white border border-gray-200 overflow-hidden';

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

  const handleCardClick = (e) => {
    if (!isAddon && (isCurrentPlan || (hasActiveSubscription && !isCurrentPlan))) {
      return;
    }
    e?.preventDefault?.();
    onSelect(plan);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(plan);
  };

  const handleTrialClick = (e) => {
    e.stopPropagation();
    if (plan.isFreeTrial) {
      onTrial(plan);
    }
  };

  if (variant === 'secondary') {
    return (
      <div 
        className={`rounded-2xl shadow-lg flex flex-col border-2 cursor-pointer transition-all ${
          isSelected ? 'border-pink-700 border-2' : 'border-gray-200'
        } ${cardStyles}`}
        onClick={(e) => {
          if (e.target.type === 'radio' || e.target.type === 'checkbox') {
            return;
          }
          handleCardClick(e);
        }}
      >
        <div className="bg-gradient-to-r from-pink-700 to-purple-800 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-center capitalize">
              {title}
            </h3>
            {!isAddon && (
              <input
                type="radio"
                name="subscription-plan"
                checked={isSelected}
                onChange={handleCardClick}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 text-pink-700 bg-white border-gray-300 focus:ring-pink-700 focus:ring-2 cursor-pointer"
              />
            )}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-gray-800">Rs. {price.toLocaleString()}</span>
            <span className="text-sm text-gray-500">/{period}</span>
          </div>

          <div className="flex-grow space-y-3 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-pink-700">✦</span>
                <span className="text-sm text-gray-700">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {plan?.isFreeTrial && !isCurrentPlan && !hasActiveSubscription && (
              <button 
                onClick={handleTrialClick}
                disabled={loading}
                className="w-full py-2 border border-pink-700 text-pink-700 rounded-lg font-medium hover:bg-pink-50 transition-colors"
              >
                {loading ? 'Processing...' : 'Start Free Trial'}
              </button>
            )}
            
            <button 
              disabled={(isCurrentPlan && !isAddon) || (hasActiveSubscription && !isAddon && !isCurrentPlan) || loading}
              onClick={handleCardClick}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${getButtonStyles()}`}
            >
              {loading ? 'Processing...' : getButtonText()}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-2xl p-6 shadow-lg flex flex-col cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-white ring-opacity-50' : ''
      } ${cardStyles}`}
      onClick={(e) => {
        if (e.target.type === 'checkbox' || e.target.type === 'radio') {
          return;
        }
        handleCardClick(e);
      }}
    >
      {recommended && variant === 'primary' && (
        <div className="text-center mb-4">
          <span className="text-sm text-white">
            Most Recommended
          </span>
        </div>
      )}

      <div className={`flex items-center justify-between mb-4 pb-3 border-b ${variant === 'primary' ? 'border-white/30' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-semibold capitalize ${textColor}`}>
          {title}
        </h3>
        {isAddon ? (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 text-pink-700 bg-white border-gray-300 rounded focus:ring-pink-700 focus:ring-2 cursor-pointer"
          />
        ) : (
          <input
            type="radio"
            name="subscription-plan"
            checked={isSelected}
            onChange={handleCardClick}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 text-pink-700 bg-white border-gray-300 focus:ring-pink-700 focus:ring-2 cursor-pointer"
          />
        )}
      </div>

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

      <div className="space-y-2">
        {!isAddon && plan?.isFreeTrial && !isCurrentPlan && !hasActiveSubscription && (
          <button 
            onClick={handleTrialClick}
            disabled={loading}
            className={`w-full py-2 border rounded-lg font-medium transition-colors ${
              variant === 'primary' 
                ? 'border-white text-white hover:bg-white/10' 
                : 'border-pink-700 text-pink-700 hover:bg-pink-50'
            }`}
          >
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        )}
        
        <button 
          disabled={(isCurrentPlan && !isAddon) || (hasActiveSubscription && !isAddon && !isCurrentPlan) || loading}
          onClick={handleCardClick}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${getButtonStyles()}`}
        >
          {loading ? 'Processing...' : getButtonText()}
        </button>
      </div>
    </div>
  );
}