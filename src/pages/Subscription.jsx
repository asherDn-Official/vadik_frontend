import SubscriptionPage from "../components/settings/subscription/SubscriptionPage";

const Subscription = () => {
  return (
    <div className="app-page">
      <div className="app-page-shell">
        <div className="app-panel min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6">
          <SubscriptionPage />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
