import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

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
}) => {
  const tabs = ["Advanced Details", "Advanced Privacy", "Referral"];

  // 🧠 Birthday popup state
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [birthdayMessage, setBirthdayMessage] = useState("");
  const [recipientNumber, setRecipientNumber] = useState("");
  const [messageType, setMessageType] = useState("birthday");



  const DetailItem = ({ icon, label, value, field, isEditable = true }) => (
    <div
      className="flex items-center justify-between p-4 rounded-[14px]"
      style={{ border: "1px solid #3131661A" }}
    >
      <div className="flex items-center">
        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
          <span className="text-pink-600 text-sm">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {isEditing && isEditable ? (
            <input
              type="text"
              value={editedData[field] || ""}
              onChange={(e) => onInputChange(field, e.target.value)}
              className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-sm text-gray-600">{value}</p>
          )}
        </div>
      </div>
    </div>
  );

  const PrivacyItem = ({ icon, label, value, field, isEditable = true }) => (
    <div className="flex items-center p-4 border-b border-gray-100">
      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
        <span className="text-pink-600 text-sm">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        {isEditing && isEditable ? (
          <input
            type="text"
            value={editedData[field] || ""}
            onChange={(e) => onInputChange(field, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        ) : (
          <p className="text-sm font-medium text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );

  const renderStars = (rating) => {
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

  return (
    <div className="flex-1 flex flex-col bg-[#F4F5F9]">
      <div className="pr-6 pt-6 pl-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Customer Profile
        </h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={customer.profileImage}
                    alt={customer.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Basic Details
                  </h2>
                  <div className="grid grid-cols-3 gap-10">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.name || ""}
                          onChange={(e) =>
                            onInputChange("name", e.target.value)
                          }
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Mobile Number
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.mobileNumber || ""}
                          onChange={(e) =>
                            onInputChange("mobileNumber", e.target.value)
                          }
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.mobileNumber}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Source</p>
                      {isEditing ? (
                        <select
                          value={editedData.source || ""}
                          onChange={(e) =>
                            onInputChange("source", e.target.value)
                          }
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Walk In">Walk In</option>
                          <option value="Online">Online</option>
                          <option value="Referral">Referral</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.source}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vadik Id</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.vadikId || ""}
                          onChange={(e) =>
                            onInputChange("vadikId", e.target.value)
                          }
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.vadikId}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      {isEditing ? (
                        <select
                          value={editedData.gender || ""}
                          onChange={(e) =>
                            onInputChange("gender", e.target.value)
                          }
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.gender}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">First Visit</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedData.firstVisit || ""}
                          onChange={(e) =>
                            onInputChange("firstVisit", e.target.value)
                          }
                          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-sm font-medium text-gray-900">
                          {customer.firstVisit}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "bg-[#EC396F1A] text-[#EC396F]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <div className="flex-1 flex justify-end items-center">
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                >
                  <span className="mr-2">✏️</span>
                  Edit
                </button>
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-2">
            {activeTab === "Advanced Details" && (
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  icon="👔"
                  label="Profession"
                  value={customer.advancedDetails.profession}
                  field="profession"
                />
                <DetailItem
                  icon="₹"
                  label="Income Level"
                  value={customer.advancedDetails.incomeLevel}
                  field="incomeLevel"
                />
                <DetailItem
                  icon="📍"
                  label="Location"
                  value={customer.advancedDetails.location}
                  field="location"
                />
                <DetailItem
                  icon="🛍️"
                  label="Favourite Product"
                  value={customer.advancedDetails.favouriteProduct}
                  field="favouriteProduct"
                />
                <DetailItem
                  icon="🎨"
                  label="Favourite Colour"
                  value={customer.advancedDetails.favouriteColour}
                  field="favouriteColour"
                />
                <DetailItem
                  icon="🏷️"
                  label="Favourite Brand"
                  value={customer.advancedDetails.favouriteBrand}
                  field="favouriteBrand"
                />
                <div onClick={() => setShowBirthdayPopup(true)} className="cursor-pointer">
                  <DetailItem
                    icon="🎂"
                    label="Birthday"
                    value={customer.advancedDetails.birthday}
                    field="birthday"
                  />
                </div>
                <DetailItem
                  icon="💪"
                  label="Life Style"
                  value={customer.advancedDetails.lifeStyle}
                  field="lifeStyle"
                />
                <DetailItem
                  icon="💍"
                  label="Anniversary"
                  value={customer.advancedDetails.anniversary}
                  field="anniversary"
                />
                <DetailItem
                  icon="❤️"
                  label="Interest"
                  value={customer.advancedDetails.interest}
                  field="interest"
                />
                <DetailItem
                  icon="👕"
                  label="Shirt Measurement"
                  value={customer.advancedDetails.shirtMeasurement}
                  field="shirtMeasurement"
                />
                <DetailItem
                  icon="👖"
                  label="Pant Measurement"
                  value={customer.advancedDetails.pantMeasurement}
                  field="pantMeasurement"
                />
                <DetailItem
                  icon="💬"
                  label="Customer Label"
                  value={customer.advancedDetails.customerLabel}
                  field="customerLabel"
                />

                {showBirthdayPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-[#2e2d5f]">
        Send WhatsApp Message
      </h3>

      {/* 👤 Mobile Number input */}
      <input
        type="tel"
        placeholder="Enter mobile number (e.g. 919XXXXXXXXX)"
        value={recipientNumber}
        onChange={(e) => setRecipientNumber(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-[#2e2d5f]"
      />

      {/* ✨ Message Type Selector */}
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
                Authorization:
                  "Bearer EAAJo9kmHxq0BOzG654sbIcUlZApXWbQZBzXMnhQv7bWFcUCNL2HIibsnz23YZA5zJMAgkgaBidPAktFINZAZCyoGZBcyWZAVLY0OduqDiWcuVPOBn5MSP4ghaUHsN4odsx1Pj24VRb70t4Fy0K94Vm7ZBl5jdPVU1JkQd8krzP7M5h87wZBhaOWSdvsZAuptW5hX3Cfx4J9uElnVit04y6P0fG5nrMS4l0S3QGT5wwRwCIRUX78gZDZD",
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
              </div>
            )}

            {activeTab === "Advanced Privacy" && (
              <div className="space-y-0">
                <PrivacyItem
                  icon="💬"
                  label="Communication Channel"
                  value={customer.advancedPrivacy.communicationChannel}
                  field="communicationChannel"
                />
                <PrivacyItem
                  icon="📢"
                  label="Types of Communication Required"
                  value={customer.advancedPrivacy.communicationTypes}
                  field="communicationTypes"
                />
                <PrivacyItem
                  icon="🔒"
                  label="Privacy Note"
                  value={customer.advancedPrivacy.privacyNote}
                  field="privacyNote"
                />
                <div className="flex items-center p-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-pink-600 text-sm">⭐</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Satisfaction Score
                    </p>
                    <div className="flex items-center">
                      {renderStars(customer.advancedPrivacy.satisfactionScore)}
                    </div>
                  </div>
                </div>
                <PrivacyItem
                  icon="📊"
                  label="Engagement Score"
                  value={customer.advancedPrivacy.engagementScore}
                  field="engagementScore"
                />
                <PrivacyItem
                  icon="✅"
                  label="Opt In/Opt out"
                  value={customer.advancedPrivacy.optInOut}
                  field="optInOut"
                />
                <PrivacyItem
                  icon="🎁"
                  label="Loyalty Points"
                  value={customer.advancedPrivacy.loyaltyPoints}
                  field="loyaltyPoints"
                />

                {/* Purchase History Section */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Purchase History
                    </h3>
                    <div className="flex space-x-2">
                      <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                        📊
                      </button>
                      <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                        📋
                      </button>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="mb-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={customer.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
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

                  {/* Purchase List */}
                  <div className="space-y-3">
                    {customer.purchaseHistory.map((purchase, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {purchase.item}
                          </p>
                          <p className="text-xs text-gray-500">
                            {purchase.date}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {purchase.amount}
                        </p>
                      </div>
                    ))}
                    <button className="text-pink-600 text-sm font-medium hover:text-pink-700">
                      See More
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Referral" && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          VID.No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Coupon Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customer.referralData.map((referral, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.vidNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {referral.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                referral.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {referral.couponCode}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                referral.status === "active"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            >
                              <span className="text-white text-xs">
                                {referral.status === "active" ? "✓" : "✗"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {customer.referralData.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No referral data available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons - Only show when editing */}
      {isEditing && (
        <div className="bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            Update Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
