import React from "react";

const CouponSearchResults = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No coupon records found</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      <h2 className="text-[#313166] font-[500] text-[18px] mb-4">
        Purchase History
      </h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#ECEDF3]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                VID.No
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Phone Number
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Join Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Coupon Code
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-[16px] text-gray-800">
                  {item.vidNo}
                </td>
                <td className="px-6 py-4 text-[16px] text-gray-800">
                  {item.name}
                </td>
                <td className="px-6 py-4 text-[16px] text-gray-800">
                  {item.phoneNumber}
                </td>
                <td className="px-6 py-4 text-[16px] text-gray-800">
                  {item.joinDate}
                </td>
                <td className="px-6 py-4 text-[16px] text-[#00914D] font-medium">
                  {item.couponCode}
                </td>
                <td className="px-6 py-4">
                  <button className="px-4 py-1 bg-white border border-[#EC396F] text-pink-500 rounded-[10px] hover:bg-pink-50 transition-colors">
                    Verify
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponSearchResults;
