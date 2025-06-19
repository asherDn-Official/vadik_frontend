import React from "react";

const CampaignTable = ({ campaigns }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Campaigns
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                No. of Customers
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Open Rate
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Click Rate
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Responded
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((campaign, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {campaign.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.customers}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.openRate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {campaign.clickRate}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
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
