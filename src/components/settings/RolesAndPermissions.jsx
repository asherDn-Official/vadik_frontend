import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, MoreHorizontal, ArrowLeft, Info } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const RolesAndPermissions = () => {
  const [currentView, setCurrentView] = useState("userManagement");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const END_POINT = "api/staff";

  // Fetch all staff members
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await api.get(END_POINT);
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
  const AddEmployeeForm = ({ setCurrentView, fetchStaff }) => {
    const [permissions, setPermissions] = useState([
      {
        "module": "dashboard",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "customers",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "personalisation",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "customerOpportunities",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "performance",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "integration",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "kyc",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "settings",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      }
    ]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


    const {
      register,
      handleSubmit,
      reset,
      control,
      watch,
      formState: { errors },
      setError
    } = useForm({
      defaultValues: {
        fullName: "",
        email: "",
        phone: "",
        designation: "",
        password: "",
        confirmPassword: "",
      },
      mode: "onChange"
    });

    const password = watch("password");

    const handlePermissionChange = (moduleIndex, permissionType, value) => {
      setPermissions(prev =>
        prev.map((perm, idx) =>
          idx === moduleIndex
            ? { ...perm, [permissionType]: value }
            : perm
        )
      );
    };

    const onSubmit = async (data) => {
      try {
        const payload = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          designation: data.designation,
          password: data.password,
          permissions: permissions.filter(perm =>
            perm.canCreate || perm.canRead || perm.canUpdate || perm.canDelete
          ),
        };

        await api.post(END_POINT, payload);
        showToast("Successfully added employee", "success ");
        reset();
        setCurrentView("userManagement");
      } catch (err) {
        showToast(err.response.data.message, "error");
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

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl">
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 2,
                    message: "Full name must be at least 2 characters"
                  },
                  maxLength: {
                    value: 30,
                    message: "Full name cannot exceed 30 characters"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                placeholder="Enter designation"
                {...register("designation", {
                  required: "Designation is required",
                  minLength: {
                    value: 2,
                    message: "Designation must be at least 2 characters"
                  },
                  maxLength: {
                    value: 30,
                    message: "Full name cannot exceed 30 characters"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-600">{errors.designation.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone number is required",
                  validate: (value) => {
                    // Remove any non-digit characters for validation
                    const digitsOnly = value.replace(/\D/g, '');
                    return digitsOnly.length >= 10 || "Please enter a valid phone number";
                  }
                }}
                render={({ field }) => (
                  <PhoneInput
                    country={"in"}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    inputStyle={{
                      width: "100%",
                      paddingLeft: "48px",
                      height: "42px"
                    }}
                    dropdownClass="text-gray-700"
                    enableSearch={true}
                    countryCodeEditable={false}
                  />
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <input
                type="password"
                placeholder="Enter Password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                    message: "Password must contain at least one uppercase letter and one special character"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: value => value === password || "Passwords do not match",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                    message: "Password must contain at least one uppercase letter and one special character"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Create Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                      message:
                        "Password must contain at least one uppercase letter and one special character",
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/,
                      message:
                        "Password must contain at least one uppercase letter and one special character",
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
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
        "module": "dashboard",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "customers",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "personalisation",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "customerOpportunities",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "performance",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "integration",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "kyc",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "settings",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      }
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
            "module": "dashboard",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "customers",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "personalisation",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "customerOpportunities",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "performance",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "integration",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "kyc",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          },
          {
            "module": "settings",
            "canCreate": false,
            "canRead": false,
            "canUpdate": false,
            "canDelete": false
          }
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

        await api.put(`${END_POINT}/${selectedUser._id}`, payload);
        await fetchStaff(); // Refresh the list
        showToast("Staff member updated successfully!", "success");
        setCurrentView("userManagement");
        setSelectedUser(null);
      } catch (err) {
        showToast("Failed to update staff member", "error");
        // console.error(err);
      }
    };

    const handleDelete = async () => {
      if (window.confirm("Are you sure you want to delete this staff member?")) {
        try {
          await api.delete(`${END_POINT}/${selectedUser._id}`);
          await fetchStaff(); // Refresh the list
          setCurrentView("userManagement");
          setSelectedUser(null);
        } catch (err) {
          showToast("Failed to delete staff member", "error");
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
  const UserManagementList = React.memo(() => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter((user) => {
      if (!searchTerm.trim()) return true;

      const searchLower = searchTerm.toLowerCase();
      const fieldsToSearch = [
        user.fullName,
        user.designation,
        user.email,
        user.phone,
      ];

      return fieldsToSearch.some(
        field => field?.toLowerCase().includes(searchLower)
      );
    });

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

    const handleSearchChange = useCallback((e) => {
      setSearchTerm(e.target.value);
    }, []);

    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-center py-8 text-red-600">{error}</div>;

    return (
      <div>
        <div className="flex justify-between items-center mb-9">
          <h2 className="text-xl text-[#313166] font-[400]">User Management</h2>
          <div className="flex space-x-4">
            <div className="relative" key="search-input">
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pr-10 pl-4 py-2 border border-gray-300 rounded-[10px] w-80 focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu click here
                  }}
                >
                  <MoreHorizontal />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  });

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