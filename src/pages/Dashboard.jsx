import CustomerProfileCollection from "../components/dashboard/CustomerProfileCollection";
import CustomerProfileOverview from "../components/dashboard/CustomerProfileOverview";
import CustomerRetentionRate from "../components/dashboard/CustomerRetentionRate";
import ChurnRate from "../components/dashboard/ChurnRate";
import CustomerEngagementScore from "../components/dashboard/CustomerEngagementScore";
import OptInOptOut from "../components/dashboard/OptInOptOut";
import CustomerSatisfactionScore from "../components/dashboard/CustomerSatisfactionScore";

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F4F5F9]">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6 xl:px-8">
        <div className="mb-4 flex flex-col gap-2 sm:mb-5">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-tight text-[#1F1C5C] sm:text-[28px]">
              Customer Intelligence
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#7E85A8]">
              Real-time customer analytics and engagement insights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] xl:gap-5 2xl:gap-6">
          <section className="min-w-0 space-y-3">
            <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7E85A8]">
              Customer Analytics
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:gap-5 2xl:gap-6">
              <CustomerProfileCollection />
              <ChurnRate />
            </div>
          </section>

          <section className="min-w-0 space-y-3">
            <h2 className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7E85A8]">
              Engagement Insights
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:gap-5 2xl:gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5 2xl:gap-6">
                <CustomerProfileOverview />
                <CustomerRetentionRate />
              </div>

              <CustomerEngagementScore />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:gap-5 2xl:gap-6">
                <OptInOptOut />
                <CustomerSatisfactionScore />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
