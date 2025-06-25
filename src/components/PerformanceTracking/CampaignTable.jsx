import React from "react";

const campaignData = [
  {
    name: "Spin the Wheel",
    customers: 100,
    openRate: 74,
    clickRate: 62,
    responded: 30,
  },
  { name: "Quiz", customers: 120, openRate: 82, clickRate: 68, responded: 24 },
  {
    name: "Scratch Card",
    customers: 50,
    openRate: 38,
    clickRate: 24,
    responded: 12,
  },
];

const CampaignTable = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3> */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Activities
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                No. of Customers
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Open Rate
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Click Rate
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">
                Responded
              </th>
            </tr>
          </thead>
          <tbody>
            {campaignData.map((campaign, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4 px-4 text-gray-900">{campaign.name}</td>
                <td className="py-4 px-4 text-gray-700">
                  {campaign.customers}
                </td>
                <td className="py-4 px-4 text-gray-700">{campaign.openRate}</td>
                <td className="py-4 px-4 text-gray-700">
                  {campaign.clickRate}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {campaign.responded}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
