import React, { useState } from "react";
import { X, Plus } from "lucide-react";

const CustomerFilterModal = ({ onClose, onApply }) => {
  const [filters, setFilters] = useState({
    name: "",
    mobile: "",
    gender: "all",
    firstVisit: "",
    source: "all",
    profession: "all",
    location: "",
    favouriteProduct: "",
    favouriteColour: "",
    favouriteBrand: "",
    specialDays: "",
    lifeStyle: "all",
    interest: "all",
    active: "all",
    eventBase: "all",
    birthdayMonth: "all",
    loyaltyPoints: "",
    currentBillValue: "",
    predictedFutureValue: "",
    engagementScore: "",
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({
      name: "",
      mobile: "",
      gender: "all",
      firstVisit: "",
      source: "all",
      profession: "all",
      location: "",
      favouriteProduct: "",
      favouriteColour: "",
      favouriteBrand: "",
      specialDays: "",
      lifeStyle: "all",
      interest: "all",
      active: "all",
      eventBase: "all",
      birthdayMonth: "all",
      loyaltyPoints: "",
      currentBillValue: "",
      predictedFutureValue: "",
      engagementScore: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Name
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Mobile Number
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.mobile}
                onChange={(e) => handleFilterChange("mobile", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Gender
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* First Visit */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                First Visit
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="date"
                value={filters.firstVisit}
                onChange={(e) =>
                  handleFilterChange("firstVisit", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Source */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Source
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="walk-in">Walk In</option>
                <option value="online">Online</option>
                <option value="referral">Referral</option>
              </select>
            </div>

            {/* Profession */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Profession
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.profession}
                onChange={(e) =>
                  handleFilterChange("profession", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="it">IT</option>
                <option value="business">Business</option>
                <option value="corporate">Corporate</option>
                <option value="medicine">Medicine</option>
                <option value="teacher">Teacher</option>
                <option value="service">Service</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Location
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Favourite Product */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Favourite Product
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.favouriteProduct}
                onChange={(e) =>
                  handleFilterChange("favouriteProduct", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Favourite Colour */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Favourite Colour
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.favouriteColour}
                onChange={(e) =>
                  handleFilterChange("favouriteColour", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Favourite Brand */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Favourite Brand
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.favouriteBrand}
                onChange={(e) =>
                  handleFilterChange("favouriteBrand", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Special Days */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Special Days
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="text"
                value={filters.specialDays}
                onChange={(e) =>
                  handleFilterChange("specialDays", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Life Style */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Life Style
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.lifeStyle}
                onChange={(e) =>
                  handleFilterChange("lifeStyle", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="moderate">Moderate</option>
                <option value="sedentary">Sedentary</option>
              </select>
            </div>

            {/* Interest */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Interest
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.interest}
                onChange={(e) => handleFilterChange("interest", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="fashion">Fashion</option>
                <option value="technology">Technology</option>
                <option value="sports">Sports</option>
                <option value="travel">Travel</option>
              </select>
            </div>

            {/* Active */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Active
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.active}
                onChange={(e) => handleFilterChange("active", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Event Base */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Event Base
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.eventBase}
                onChange={(e) =>
                  handleFilterChange("eventBase", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="festival">Festival</option>
              </select>
            </div>

            {/* Birthday Month */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Birthday Month
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <select
                value={filters.birthdayMonth}
                onChange={(e) =>
                  handleFilterChange("birthdayMonth", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All</option>
                <option value="january">January</option>
                <option value="february">February</option>
                <option value="march">March</option>
                <option value="april">April</option>
                <option value="may">May</option>
                <option value="june">June</option>
                <option value="july">July</option>
                <option value="august">August</option>
                <option value="september">September</option>
                <option value="october">October</option>
                <option value="november">November</option>
                <option value="december">December</option>
              </select>
            </div>

            {/* Loyalty Points */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Loyalty Points
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="number"
                value={filters.loyaltyPoints}
                onChange={(e) =>
                  handleFilterChange("loyaltyPoints", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Current Bill Value */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Current Bill Value
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="number"
                value={filters.currentBillValue}
                onChange={(e) =>
                  handleFilterChange("currentBillValue", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Predicted Future Value */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Predicted Future Value
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="number"
                value={filters.predictedFutureValue}
                onChange={(e) =>
                  handleFilterChange("predictedFutureValue", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Engagement Score */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                Engagement Score
                <Plus className="w-4 h-4 text-blue-600" />
              </label>
              <input
                type="number"
                value={filters.engagementScore}
                onChange={(e) =>
                  handleFilterChange("engagementScore", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilterModal;
