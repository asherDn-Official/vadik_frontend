import React, { useState } from "react";
import { ChevronDown, Upload, X } from "lucide-react";
import CustomerFilterModal from "./CustomerFilterModal";

const PersonalizationCampaign = ({
  quizCampaigns,
  spinWheelCampaigns,
  scratchCardCampaigns,
}) => {
  const [selectedCampaignType, setSelectedCampaignType] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [customers, setCustomers] = useState([
    {
      id: 121,
      name: "Karthik Raja",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "IT",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 114,
      name: "Suresh Babu",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "Business",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 87,
      name: "Chandra",
      mobile: "+91 95554 51518",
      gender: "Female",
      source: "Walk In",
      profession: "Corporate",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 101,
      name: "Sathish Kumar",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "Corporate",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 198,
      name: "Praveen Anand",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "IT",
      location: "Chennai",
      income: "High",
    },
    {
      id: 47,
      name: "Janani",
      mobile: "+91 95554 51518",
      gender: "Female",
      source: "Walk In",
      profession: "Medicine",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 122,
      name: "Kavitha",
      mobile: "+91 95554 51518",
      gender: "Female",
      source: "Walk In",
      profession: "Corporate",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 152,
      name: "Mohanraj Elango",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "Business",
      location: "Chennai",
      income: "Medium",
    },
    {
      id: 103,
      name: "Dinesh Kannan",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "Service",
      location: "Chennai",
      income: "Low",
    },
    {
      id: 106,
      name: "Selvaraj",
      mobile: "+91 95554 51518",
      gender: "Male",
      source: "Walk In",
      profession: "Teacher",
      location: "Chennai",
      income: "High",
    },
  ]);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [sendByWhatsapp, setSendByWhatsapp] = useState(false);
  const [sendByEngageBird, setSendByEngageBird] = useState(false);

  const getCampaignOptions = () => {
    switch (selectedCampaignType) {
      case "quiz":
        return quizCampaigns.map((campaign) => ({
          value: campaign.id,
          label: campaign.title,
        }));
      case "spinwheel":
        return spinWheelCampaigns.map((campaign) => ({
          value: campaign.id,
          label: campaign.title,
        }));
      case "scratchcard":
        return scratchCardCampaigns.map((campaign) => ({
          value: campaign.id,
          label: campaign.title,
        }));
      default:
        return [];
    }
  };

  const handleImportCustomers = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate file processing
      console.log("Importing customers from:", file.name);
      // In a real app, you would parse the Excel file and add customers
    }
  };

  const handleApplyFilters = (filters) => {
    let filtered = customers;

    if (filters.gender && filters.gender !== "all") {
      filtered = filtered.filter(
        (customer) => customer.gender.toLowerCase() === filters.gender
      );
    }

    if (filters.profession && filters.profession !== "all") {
      filtered = filtered.filter(
        (customer) =>
          customer.profession.toLowerCase() === filters.profession.toLowerCase()
      );
    }

    if (filters.income && filters.income !== "all") {
      filtered = filtered.filter(
        (customer) =>
          customer.income.toLowerCase() === filters.income.toLowerCase()
      );
    }

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter((customer) =>
        customer.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
    setShowFilterModal(false);
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id));
    }
  };

  const handleSendCampaign = () => {
    if (selectedCustomers.length === 0) {
      alert("Please select at least one customer");
      return;
    }

    if (!selectedCampaign) {
      alert("Please select a campaign");
      return;
    }

    if (!sendByWhatsapp && !sendByEngageBird) {
      alert("Please select at least one sending method");
      return;
    }

    console.log("Sending campaign to:", selectedCustomers);
    alert("Campaign sent successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Campaign Type */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Campaign Type
          </h3>
          <p className="text-gray-600 mb-4">
            What Kind of Campaign Would You Like to Run?
          </p>
          <select
            value={selectedCampaignType}
            onChange={(e) => {
              setSelectedCampaignType(e.target.value);
              setSelectedCampaign("");
            }}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          >
            <option value="">Select Campaign Type</option>
            <option value="quiz">Quiz</option>
            <option value="spinwheel">Spin Wheel</option>
            <option value="scratchcard">Scratch Card</option>
          </select>
        </div>

        {/* Select Campaign */}
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Select Campaign
          </h3>
          <p className="text-gray-600 mb-4">
            Select a Campaign You've Already Created
          </p>
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            disabled={!selectedCampaignType}
          >
            <option value="">Select the campaign you created</option>
            {getCampaignOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Selection */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setShowFilterModal(true)}
            className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Select Customer
          </button>
          <label className="flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Import Customer
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportCustomers}
              className="hidden"
            />
          </label>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedCustomers.length === filteredCustomers.length &&
                        filteredCustomers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    ID No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Mobile Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Profession
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Income
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleCustomerSelect(customer.id)}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.mobile}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.gender}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.source}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.profession}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.location}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {customer.income}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Send Options */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Select Tool To Send Campaign
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={sendByWhatsapp}
              onChange={(e) => setSendByWhatsapp(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 mr-3"
            />
            <span className="text-gray-700">Send by Whatsapp</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={sendByEngageBird}
              onChange={(e) => setSendByEngageBird(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500 mr-3"
            />
            <span className="text-gray-700">Send by EngageBird</span>
          </label>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-start">
        <button
          onClick={handleSendCampaign}
          className="px-8 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Send Campaign
        </button>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <CustomerFilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
        />
      )}
    </div>
  );
};

export default PersonalizationCampaign;
