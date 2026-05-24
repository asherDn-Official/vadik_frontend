import CustomerProfileCollection from "../components/dashboard/CustomerProfileCollection";
import CustomerProfileOverview from "../components/dashboard/CustomerProfileOverview";
import CustomerRetentionRate from "../components/dashboard/CustomerRetentionRate";
import ChurnRate from "../components/dashboard/ChurnRate";
import CustomerEngagementScore from "../components/dashboard/CustomerEngagementScore";
import OptInOptOut from "../components/dashboard/OptInOptOut";
import CustomerSatisfactionScore from "../components/dashboard/CustomerSatisfactionScore";

function Dashboard() {
  return (
    <div className="h-full min-h-0 bg-[#F4F5F9]">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-4 xl:px-6">
        <div className="grid grid-cols-1 items-stretch gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4 xl:gap-4 2xl:gap-5">
          <div className="min-w-0 lg:col-span-2 xl:col-span-2">
            <CustomerProfileCollection />
          </div>

          <div className="min-w-0 h-full">
            <CustomerProfileOverview />
          </div>

          <div className="min-w-0 h-full">
            <CustomerRetentionRate />
          </div>

          <div className="min-w-0 h-full">
            <ChurnRate />
          </div>

          <div className="min-w-0 h-full">
            <CustomerEngagementScore />
          </div>

          <div className="min-w-0 h-full">
            <OptInOptOut />
          </div>

          <div className="min-w-0 h-full">
            <CustomerSatisfactionScore />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
