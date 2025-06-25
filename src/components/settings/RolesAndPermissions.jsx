import React, { useState } from "react";
import { Search, Plus, MoreHorizontal, ArrowLeft, Info } from "lucide-react";

const RolesAndPermissions = () => {
  const [currentView, setCurrentView] = useState("userManagement");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([
    {
      id: "1",
      name: "Raj",
      role: "Admin",
      email: "raj@example.com",
      phone: "+1234567890",
      permissions: {
        adminDashboard: true,
        customerProfile: true,
        customerOpportunity: true,
        personalisationInsight: false,
        performanceTracking: false,
        integrationManagement: true,
        kyc: true,
        settings: true,
      },
    },
    {
      id: "2",
      name: "Aravind Kumar",
      role: "Store Manager",
      email: "aravind@example.com",
      phone: "+1234567891",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      permissions: {
        adminDashboard: false,
        customerProfile: true,
        customerOpportunity: true,
        personalisationInsight: true,
        performanceTracking: false,
        integrationManagement: false,
        kyc: false,
        settings: false,
      },
    },
    {
      id: "3",
      name: "Suresh",
      role: "Cashier",
      email: "suresh@example.com",
      phone: "+1234567892",
      permissions: {
        adminDashboard: false,
        customerProfile: false,
        customerOpportunity: false,
        personalisationInsight: false,
        performanceTracking: false,
        integrationManagement: false,
        kyc: false,
        settings: false,
      },
    },
    {
      id: "4",
      name: "Natarajan",
      role: "Sales Executive",
      email: "natarajan@example.com",
      phone: "+1234567893",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      permissions: {
        adminDashboard: false,
        customerProfile: true,
        customerOpportunity: true,
        personalisationInsight: false,
        performanceTracking: false,
        integrationManagement: false,
        kyc: false,
        settings: false,
      },
    },
    {
      id: "5",
      name: "Velu",
      role: "Unit Head",
      email: "velu@example.com",
      phone: "+1234567894",
      permissions: {
        adminDashboard: true,
        customerProfile: true,
        customerOpportunity: true,
        personalisationInsight: true,
        performanceTracking: true,
        integrationManagement: false,
        kyc: false,
        settings: false,
      },
    },
    {
      id: "6",
      name: "Ramesh",
      role: "Supervisor",
      email: "ramesh@example.com",
      phone: "+1234567895",
      permissions: {
        adminDashboard: false,
        customerProfile: true,
        customerOpportunity: false,
        personalisationInsight: false,
        performanceTracking: false,
        integrationManagement: false,
        kyc: false,
        settings: false,
      },
    },
  ]);

  // Add Employee Form Component
  const AddEmployeeForm = () => {
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const newUser = {
        id: (users.length + 1).toString(),
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        role: "Employee",
        email: formData.email,
        phone: formData.phone,
        permissions: {
          adminDashboard: false,
          customerProfile: false,
          customerOpportunity: false,
          personalisationInsight: false,
          performanceTracking: false,
          integrationManagement: false,
          kyc: false,
          settings: false,
        },
      };

      setUsers([...users, newUser]);
      setSelectedUser(newUser);
      setCurrentView("userPermissions");
    };

    return (
      <div>
        <button
          onClick={() => setCurrentView("userManagement")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h2 className="text-xl text-[#313166] font-[400] mb-6">Add Employee</h2>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="Enter Phone Number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentView("userManagement")}
              className="px-6 py-2 border border-pink-600 text-pink-600 rounded-[10px] hover:bg-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-[10px] hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    );
  };

  // User Permissions Component
  const UserPermissionsForm = () => {
    const [permissions, setPermissions] = useState(
      selectedUser?.permissions || {
        adminDashboard: false,
        customerProfile: false,
        customerOpportunity: false,
        personalisationInsight: false,
        performanceTracking: false,
        integrationManagement: false,
        kyc: false,
        settings: false,
      }
    );

    const handlePermissionChange = (key, value) => {
      setPermissions((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

    const handleSave = () => {
      if (selectedUser) {
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? { ...user, permissions } : user
          )
        );
        setCurrentView("userManagement");
        setSelectedUser(null);
      }
    };

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
          "Access behavioral trends, engagement stats, and customer segmentation context.",
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

    if (!selectedUser) return null;

    return (
      <div>
        <button
          onClick={() => setCurrentView("userManagement")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h2 className="text-xl text-[#313166] font-[400] mb-6">
          User Management
        </h2>

        <div className="bg-white rounded-[10px] border border-gray-200 p-6 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-600 font-medium text-lg">
                  {getInitials(selectedUser.name)}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedUser.name}
              </h3>
              <p className="text-gray-600">{selectedUser.role}</p>
              <p className="text-gray-500 text-sm">{selectedUser.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-gray-200">
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
                          permissions[item.key]
                            ? "bg-gradient-to-r from-[#CB376D] to-[#A72962]"
                            : "bg-gray-300"
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
              className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white py-3 px-4 rounded-[10px] hover:opacity-90 transition-opacity font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  // User Management List Component
  const UserManagementList = () => {
    const filteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const handleEditUser = (user) => {
      setSelectedUser(user);
      setCurrentView("userPermissions");
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-9">
          <h2 className="text-xl text-[#313166] font-[400]">User Management</h2>
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-[10px] w-80"
              />
              <Search className="absolute right-3 top-3 text-[#31316699] text-[20px] cursor-pointer" />
            </div>
            <button
              onClick={() => setCurrentView("addEmployee")}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-[10px] hover:opacity-90 transition-opacity"
            >
              <Plus className="mr-2" /> Create User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white p-4 rounded-[10px] border border-[#31316680] border-opacity-50 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEditUser(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="ml-3">
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render based on current view
  const renderContent = () => {
    switch (currentView) {
      case "userManagement":
        return <UserManagementList />;
      case "addEmployee":
        return <AddEmployeeForm />;
      case "userPermissions":
        return <UserPermissionsForm />;
      default:
        return <UserManagementList />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
        <h2 className="text-lg text-gray-700">Roles And Permissions</h2>
      </div>

      {renderContent()}
    </div>
  );
};

export default RolesAndPermissions;
