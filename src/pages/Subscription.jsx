import SubscriptionPage from "../components/settings/subscription/SubscriptionPage";

const Subscription = () => {
  return (
    <div className="h-full p-2 md:p-4 bg-[#F4F5F9]">
      <div className="h-full p-4 md:p-8 bg-white rounded-[20px] shadow-sm overflow-auto">
        <SubscriptionPage />
      </div>
    </div>
  );
};

export default Subscription;
