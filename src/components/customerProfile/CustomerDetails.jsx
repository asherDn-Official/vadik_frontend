import React, { useState } from "react";
import { XCircle, CheckCircle, List, BarChart } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomerDetails = ({
  customer,
  activeTab,
  setActiveTab,
  isEditing,
  editedData,
  onEdit,
  onCancel,
  onSave,
  onInputChange,
  isLoading,
}) => {
  const tabs = ["Advanced Details", "Advanced Privacy", "Referral"];
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState("");
  const [messageType, setMessageType] = useState("birthday");
  const [showPurchaseList, setShowPurchaseList] = useState(false);
  const [showAllPurchases, setShowAllPurchases] = useState(false);

  const DetailItem = ({ iconSrc, label, value, field, isEditable = true }) => {
    const currentValue = isEditing ? editedData[field] || "" : value;
    return (
      <div className="flex items-center justify-between p-4 rounded-[14px]" style={{ border: "1px solid #3131661A" }}>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <img src={iconSrc} alt={label} className="w-12 h-12" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{label}</p>
            {isEditing && isEditable ? (
              <input
                type="text"
                value={currentValue}
                onChange={(e) => onInputChange(field, e.target.value)}
                className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              />
            ) : (
              <p className="text-sm text-gray-600">{value || "-"}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PrivacyItem = ({ iconSrc, label, value, field, isEditable = true }) => {
    const currentValue = isEditing ? editedData[field] || "" : value;
    return (
      <div className="flex items-center p-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <img src={iconSrc} alt={label} className="w-12 h-12" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          {isEditing && isEditable ? (
            <input
              type="text"
              value={currentValue}
              onChange={(e) => onInputChange(field, e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-sm font-medium text-gray-900">{value || "-"}</p>
          )}
        </div>
      </div>
    );
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      );
    }

    return stars;
  };

  const renderDynamicFields = (fields, section) => {
    if (!fields) return null;
    
    return Object.entries(fields).map(([key, value]) => {
      // Skip these special fields as they're handled separately
      if (key === 'satisfactionScore') return null;
      
      return (
        <DetailItem
          key={key}
          iconSrc="../assets/default-icon.png"
          label={key}
          value={value}
          field={key}
        />
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F5F9]">
      <div className="pr-6 pt-6 pl-6">
        <h1 className="text-xl font-semibold text-gray-900">Customer Profile</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200 mb-5 bg-white rounded-[20px]">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={customer.profileImage || "../assets/default-profile.png"}
                    alt={`${customer.firstname} ${customer.lastname}`}
                    className="w-[152px] h-[182px] rounded-lg object-cover"
                  />
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center ${customer.isActive ? "bg-green-500" : "bg-red-500"} shadow-lg`}>
                    {customer.isActive ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <XCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="ml-14">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Details</h2>
                  <div className="grid grid-cols-3 gap-x-16 gap-y-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">First Name</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.firstname || ""}
                          onChange={(e) => onInputChange("firstname", e.target.value)}
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.firstname}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Last Name</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.lastname || ""}
                          onChange={(e) => onInputChange("lastname", e.target.value)}
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{customer.lastname}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Mobile Number</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.mobileNumber || ""}
                          onChange={(e) => onInputChange("mobileNumber", e.target.value)}
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{customer.mobileNumber}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Source</p>
                      {isEditing ? (
                        <select
                          value={editedData.source || ""}
                          onChange={(e) => onInputChange("source", e.target.value)}
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                        >
                          <option value="Walk In">Walk In</option>
                          <option value="Online">Online</option>
                          <option value="Referral">Referral</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">{customer.source}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Customer ID</p>
                      <p className="text-sm font-medium text-gray-900">{customer.customerId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">First Visit</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(customer.firstVisit).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-white p-8 rounded-[20px]">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white pb-5">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-4 border-b-2 font-medium rounded-[10px] text-sm ${
                      activeTab === tab
                        ? "bg-[#EC396F1A] text-[#EC396F]"
                        : "border-transparent text-gray-500 hover:text-[#EC396F] hover:bg-[#EC396F1A]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <div className="flex-1 flex justify-end items-center">
                  {!isEditing ? (
                    <button
                      onClick={onEdit}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                    >
                      <img
                        src="../assets/edit-icon.png"
                        className="w-4 h-4 mr-2"
                        alt="Edit"
                      />
                      Edit
                    </button>
                  ) : null}
                </div>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-2 bg-white pt-5">
              {activeTab === "Advanced Details" && (
                <div className="grid grid-cols-2 gap-4">
                  {customer.advancedDetails && renderDynamicFields(customer.advancedDetails, "advancedDetails")}
                </div>
              )}

              {activeTab === "Advanced Privacy" && (
                <div className="space-y-0">
                  {customer.advancedPrivacyDetails && renderDynamicFields(customer.advancedPrivacyDetails, "advancedPrivacy")}
                  
                  {/* Satisfaction Score (special case) */}
                  {customer.advancedPrivacyDetails?.satisfactionScore && (
                    <div className="flex items-center p-4 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <img src="../assets/score-icon.png" alt="Satisfaction Score" className="w-12 h-12" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500 mb-1">Satisfaction Score</p>
                        <div className="flex items-center">
                          {renderStars(customer.advancedPrivacyDetails.satisfactionScore)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Purchase History Section */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Purchase History</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowPurchaseList(!showPurchaseList)}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {showPurchaseList ? (
                            <BarChart className="w-5 h-5" />
                          ) : (
                            <List className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {!showPurchaseList ? (
                      <div className="mb-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={customer.chartData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#e11d48"
                              strokeWidth={2}
                              dot={{ fill: "#e11d48", strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(customer.purchaseHistory || []).slice(0, showAllPurchases ? undefined : 5).map((purchase, index) => (
                          <div key={index} className="flex justify-between items-center py-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{purchase.item}</p>
                              <p className="text-xs text-gray-500">{purchase.date}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{purchase.amount}</p>
                          </div>
                        ))}
                        {(customer.purchaseHistory || []).length > 5 && (
                          <button
                            onClick={() => setShowAllPurchases(!showAllPurchases)}
                            className="text-pink-600 text-sm font-medium hover:text-pink-700"
                          >
                            {showAllPurchases ? "Show Less" : "See More"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Referral" && (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VID.No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(customer.referralData || []).map((referral, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral.vidNo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral.phoneNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral.joinDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`px-2 py-1 rounded text-xs ${
                                referral.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {referral.couponCode}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                referral.status === "active" ? "bg-green-500" : "bg-red-500"
                              }`}>
                                {referral.status === "active" ? (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(customer.referralData || []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">No referral data available</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Birthday Popup */}
      {showBirthdayPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-[#2e2d5f]">Send WhatsApp Message</h3>
            <input
              type="tel"
              placeholder="Enter mobile number (e.g. 919XXXXXXXXX)"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-[#2e2d5f]"
            />
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-[#2e2d5f]"
            >
              <option value="birthday">🎂 Birthday</option>
              <option value="holiday">🎉 Holiday</option>
            </select>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowBirthdayPopup(false)}
                className="px-4 py-1.5 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  fetch("https://graph.facebook.com/v22.0/685786047947355/messages", {
                    method: "POST",
                    headers: {
                      Authorization: "Bearer EAAJo9kmHxq0BOwLi9ac3pZCDeBNCVzYIUZBYBCGQaK3HG4hX63S2oFxe2oBTBwZB9ZCaRxZAmknYznwRsG9cYc9gdZBldB0MSZBKKxAt3VFVrJqxSWBoSEZAyPJugcHObsw9ULZCmRqndPM13R0TwgVIdZAHoZBmLIbZBoGvsmsGEe7XeR2ZAdkBmWsZCDlgB1VNmXJLbd52YFE0yGxPF2i1G2oDyrJZBzrvUMnCpjhSdweEXZC4ZAJRL5wZDZD",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      messaging_product: "whatsapp",
                      to: recipientNumber,
                      type: "template",
                      template: {
                        name: messageType,
                        language: { code: "en" },
                      },
                    }),
                  })
                    .then((res) => res.json())
                    .then((json) => {
                      console.log("✅ Message sent", json);
                      setShowBirthdayPopup(false);
                      setRecipientNumber("");
                    })
                    .catch((err) => {
                      console.error("❌ Send failed", err);
                    });
                }}
                className={`px-4 py-1.5 text-sm rounded bg-[#2e2d5f] text-white hover:bg-[#24244a] ${
                  !recipientNumber ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!recipientNumber}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode Buttons */}
      {isEditing && (
        <div className="bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              "Update Changes"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;