import CustomerProfileCollection from "../components/dashboard/CustomerProfileCollection";
import CustomerProfileOverview from "../components/dashboard/CustomerProfileOverview";
import CustomerRetentionRate from "../components/dashboard/CustomerRetentionRate";
import ChurnRate from "../components/dashboard/ChurnRate";
import CustomerEngagementScore from "../components/dashboard/CustomerEngagementScore";
import OptInOptOut from "../components/dashboard/OptInOptOut";
import CustomerSatisfactionScore from "../components/dashboard/CustomerSatisfactionScore";

function Dashboard() {
  return (
    <div className="app-page">
      <div className="app-page-shell gap-4 lg:gap-5">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:gap-5 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-7">
            <CustomerProfileCollection />
          </div>

          <div className="min-w-0 grid gap-4 sm:grid-cols-2 lg:gap-5 xl:col-span-5">
            <CustomerProfileOverview />
            <CustomerRetentionRate />
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-6 2xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-2 2xl:col-span-3">
            <ChurnRate />
          </div>

          <div className="min-w-0 xl:col-span-2 2xl:col-span-3">
            <CustomerEngagementScore />
          </div>

          <div className="min-w-0 xl:col-span-2 2xl:col-span-3">
            <OptInOptOut />
          </div>

          <div className="min-w-0 xl:col-span-6 2xl:col-span-3">
            <CustomerSatisfactionScore />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
