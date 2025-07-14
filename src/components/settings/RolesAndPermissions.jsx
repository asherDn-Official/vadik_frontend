import React, { useState, useEffect } from "react";
import { Search, Plus, MoreHorizontal, ArrowLeft, Info } from "lucide-react";
import axios from "axios";
import api from "../../api/apiconfig";

const RolesAndPermissions = () => {
  const [currentView, setCurrentView] = useState("userManagement");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = "https://app.vadik.ai/api/staff";

  // Fetch all staff members
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get(API_URL);
      setUsers(response.data.staffs);
      setError(null);
    } catch (err) {
      setError("Failed to fetch staff members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add Employee Form Component
  const AddEmployeeForm = () => {
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      designation: "",
      password: "",
      confirmPassword: "",
    });

    const [permissions, setPermissions] = useState([
      {
        module: "orders",
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      },
      {
        module: "products",
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      },
      {
        module: "dashboard",
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      },
    ]);

    const handlePermissionChange = (moduleIndex, permissionType, value) => {
      setPermissions(prev =>
        prev.map((perm, idx) =>
          idx === moduleIndex
            ? { ...perm, [permissionType]: value }
            : perm
        )
      );
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      try {
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          password: formData.password,
          permissions: permissions.filter(perm =>
            perm.canCreate || perm.canRead || perm.canUpdate || perm.canDelete
          ),
        };

        await axios.post(API_URL, payload);
        await fetchStaff(); // Refresh the list
        setCurrentView("userManagement");
      } catch (err) {
        alert("Failed to create staff member");
        console.error(err);
      }
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
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
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
                placeholder="Enter designation"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
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

          {/* Permissions Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
            <div className="space-y-4">
              {permissions.map((perm, index) => (
                <div key={perm.module} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800 capitalize">
                      {perm.module}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['canCreate', 'canRead', 'canUpdate', 'canDelete'].map((permType) => (
                      <div key={permType} className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={perm[permType]}
                            onChange={(e) =>
                              handlePermissionChange(index, permType, e.target.checked)
                            }
                          />
                          <div
                            className={`w-11 h-6 rounded-full transition-colors ${perm[permType]
                              ? "bg-gradient-to-r from-[#CB376D] to-[#A72962]"
                              : "bg-gray-300"
                              }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform m-0.5 ${perm[permType] ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                            {permType.replace('can', '')}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      designation: "",
      password: "",
    });

    const [permissions, setPermissions] = useState([
      {
        module: "orders",
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      },
      {
        module: "products",
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      },
      {
        module: "dashboard",
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
      },
    ]);

    useEffect(() => {
      if (selectedUser) {
        setFormData({
          fullName: selectedUser.fullName,
          email: selectedUser.email,
          phone: selectedUser.phone,
          designation: selectedUser.designation,
          password: "",
        });

        // Initialize permissions based on selected user
        const defaultPerms = [
          {
            module: "orders",
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
          },
          {
            module: "products",
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
          },
          {
            module: "dashboard",
            canCreate: false,
            canRead: false,
            canUpdate: false,
            canDelete: false,
          },
        ];

        if (selectedUser.permissions) {
          selectedUser.permissions.forEach(userPerm => {
            const permIndex = defaultPerms.findIndex(p => p.module === userPerm.module);
            if (permIndex !== -1) {
              defaultPerms[permIndex] = {
                module: userPerm.module,
                canCreate: userPerm.canCreate,
                canRead: userPerm.canRead,
                canUpdate: userPerm.canUpdate,
                canDelete: userPerm.canDelete,
              };
            }
          });
        }

        setPermissions(defaultPerms);
      }
    }, [selectedUser]);

    const handlePermissionChange = (moduleIndex, permissionType, value) => {
      setPermissions(prev =>
        prev.map((perm, idx) =>
          idx === moduleIndex
            ? { ...perm, [permissionType]: value }
            : perm
        )
      );
    };

    const handleSave = async () => {
      try {
        const payload = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          password: formData.password || undefined, // Only send password if it's changed
          permissions: permissions.filter(perm =>
            perm.canCreate || perm.canRead || perm.canUpdate || perm.canDelete
          ),
        };

        await axios.put(`${API_URL}/${selectedUser._id}`, payload);
        await fetchStaff(); // Refresh the list
        setCurrentView("userManagement");
        setSelectedUser(null);
      } catch (err) {
        alert("Failed to update staff member");
        console.error(err);
      }
    };

    const handleDelete = async () => {
      if (window.confirm("Are you sure you want to delete this staff member?")) {
        try {
          await axios.delete(`${API_URL}/${selectedUser._id}`);
          await fetchStaff(); // Refresh the list
          setCurrentView("userManagement");
          setSelectedUser(null);
        } catch (err) {
          alert("Failed to delete staff member");
          console.error(err);
        }
      }
    };

    const getInitials = (name) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                <span className="text-gray-600 font-medium text-lg">
                  {getInitials(selectedUser.fullName)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser.fullName}
                </h3>
                <p className="text-gray-600">{selectedUser.designation}</p>
                <p className="text-gray-500 text-sm">{selectedUser.email}</p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-[10px] hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Designation
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
            />
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
            {permissions.map((perm, index) => (
              <div key={perm.module} className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Info className="w-4 h-4 text-gray-400 mr-2" />
                      <h4 className="text-base font-medium text-gray-900 capitalize">
                        {perm.module}
                      </h4>
                    </div>

                    <div className="ml-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['canCreate', 'canRead', 'canUpdate', 'canDelete'].map((permType) => (
                        <div key={permType} className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={perm[permType]}
                              onChange={(e) =>
                                handlePermissionChange(index, permType, e.target.checked)
                              }
                            />
                            <div
                              className={`w-11 h-6 rounded-full transition-colors ${perm[permType]
                                ? "bg-gradient-to-r from-[#CB376D] to-[#A72962]"
                                : "bg-gray-300"
                                }`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform m-0.5 ${perm[permType]
                                  ? "translate-x-5"
                                  : "translate-x-0"
                                  }`}
                              />
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                              {permType.replace('can', '')}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
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
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.designation.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

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
              key={user._id}
              className="bg-white p-4 rounded-[10px] border border-[#31316680] border-opacity-50 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleEditUser(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">{user.designation}</p>
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