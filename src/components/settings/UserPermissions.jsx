import React, { useState, useEffect } from "react";
import { ArrowLeft, Info } from "lucide-react";

const UserPermissions = ({ user, onSave, onBack }) => {
  const [permissions, setPermissions] = useState({
    adminDashboard: false,
    customerProfile: false,
    customerOpportunity: false,
    personalisationInsight: false,
    performanceTracking: false,
    integrationManagement: false,
    kyc: false,
    settings: false,
  });

  useEffect(() => {
    if (user) {
      setPermissions(user.permissions);
    }
  }, [user]);

  const handlePermissionChange = (key, value) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (user) {
      onSave(user.id, permissions);
    }
  };

  if (!user) {
    return null;
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const permissionItems = [
    {
      key: "adminDashboard",
      title: "Admin Dashboard",
      description:
        "Full access to platform insights, key metrics, and administrative control panel.",
    },
    {
      key: "customerProfile",
      title: "Customer Profile",
      description:
        "View and manage customer details, preferences, and activity history.",
    },
    {
      key: "customerOpportunity",
      title: "Customer Opportunity",
      description:
        "Access behavioral trends, engagement stats, and customer segmentation data.",
    },
    {
      key: "personalisationInsight",
      title: "Personalisation Insight",
      description:
        "Track personalization effectiveness based on customer interactions and targeting.",
    },
    {
      key: "performanceTracking",
      title: "Performance Tracking",
      description:
        "Monitor campaign success, conversion rates, and operational performance metrics.",
    },
    {
      key: "integrationManagement",
      title: "Integration Management",
      description:
        "Connect and manage third-party services, APIs, and system integrations.",
    },
    {
      key: "kyc",
      title: "KYC",
      description:
        "Verify and validate customer identities through Know Your Customer processes.",
    },
    {
      key: "settings",
      title: "Settings",
      description:
        "Configure system preferences, user roles, and notification settings.",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
        <h2 className="text-lg text-gray-700">User Management</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-lg">
                {getInitials(user.name)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-600">{user.role}</p>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Permission</h3>
            <h3 className="text-lg font-medium text-gray-900">Access</h3>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {permissionItems.map((item) => (
            <div key={item.key} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Info className="w-4 h-4 text-gray-400 mr-2" />
                    <h4 className="text-base font-medium text-gray-900">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">
                    {item.description}
                  </p>
                </div>
                <div className="ml-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={permissions[item.key]}
                      onChange={(e) =>
                        handlePermissionChange(item.key, e.target.checked)
                      }
                    />
                    <div
                      className={`w-14 h-8 rounded-full transition-colors ${
                        permissions[item.key] ? "bg-pink-600" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform m-1 ${
                          permissions[item.key]
                            ? "translate-x-6"
                            : "translate-x-0"
                        }`}
                      />
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        permissions[item.key]
                          ? "text-pink-600"
                          : "text-gray-400"
                      }`}
                    >
                      {permissions[item.key] ? "Yes" : "No"}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissions;
