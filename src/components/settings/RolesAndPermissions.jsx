import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, MoreHorizontal, ArrowLeft, Info } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Eye, EyeOff } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import deleteConfirmTostNotification from "../../utils/deleteConfirmTostNotification";
import VideoPopupWithShare from "../common/VideoPopupWithShare";



const RolesAndPermissions = () => {
  const [currentView, setCurrentView] = useState("userManagement");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [subscriptionData, setSubscriptionData] = useState(null);



       useEffect(() => {
      const subscription = async () => {
        try {
          const res = await api.get("/api/subscriptions/credit/usage");
          const data = res.data;
          setSubscriptionData(data.subscription.plan.toLowerCase());
          console.log("subscription data plan:", subscriptionData);
        }catch (error) {
        console.log("error", error);
      } 
      }
      subscription();      
    },[])

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
        "module": "Dashboard",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Profile",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Insight",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Activity",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Performance Tracking",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Integration Management",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Quick Search",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Settings",
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

    // Toggle all permissions for a single module
    const handleToggleModuleAll = (moduleIndex, value) => {
      setPermissions(prev =>
        prev.map((perm, idx) =>
          idx === moduleIndex
            ? { ...perm, canCreate: value, canRead: value, canUpdate: value, canDelete: value }
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
        await fetchStaff();
        showToast("Successfully added employee","success");
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
                    value: 100,
                    message: "Full name cannot exceed 100 characters"
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
                    return digitsOnly.length >= 12 || "Please enter a valid phone number";
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
                    enableSearch={false}
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

                    {/* Per-module Select All */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={perm.canCreate && perm.canRead && perm.canUpdate && perm.canDelete}
                        onChange={(e) => handleToggleModuleAll(index, e.target.checked)}
                      />
                      <div
                        className={`w-11 h-6 rounded-full transition-colors ${(perm.canCreate && perm.canRead && perm.canUpdate && perm.canDelete)
                          ? "bg-gradient-to-r from-[#CB376D] to-[#A72962]"
                          : "bg-gray-300"
                          }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform m-0.5 ${(perm.canCreate && perm.canRead && perm.canUpdate && perm.canDelete) ? "translate-x-5" : "translate-x-0"}`}
                        />
                      </div>
                      {/* <span className="ml-2 text-sm font-medium text-gray-700">Select all</span> */}
                    </label>
                  </div>
                  {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  </div> */}
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


  const UserPermissionsForm = () => {
    const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm({
      defaultValues: {
        fullName: "",
        email: "",
        phone: "",
        designation: "",
        password: "",
      },
      mode: "onChange"
    });
    const [showPassword, setShowPassword] = useState(false);
    const [permissions, setPermissions] = useState([
      {
        "module": "Dashboard",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Profile",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Insight",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Activity",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Performance Tracking",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Integration Management",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Quick Search",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Settings",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      }
    ]);

    useEffect(() => {
      if (selectedUser) {
        // Set form values
        setValue("fullName", selectedUser.fullName);
        setValue("email", selectedUser.email);
        setValue("phone", selectedUser.phone);
        setValue("designation", selectedUser.designation);
        setValue("password", "");

        // Initialize permissions based on selected user
        const defaultPerms = [
      {
        "module": "Dashboard",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Profile",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Insight",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Customer Activity",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Performance Tracking",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Integration Management",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Quick Search",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      },
      {
        "module": "Settings",
        "canCreate": false,
        "canRead": false,
        "canUpdate": false,
        "canDelete": false
      }
    ]

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
    }, [selectedUser, setValue]);

    const handlePermissionChange = (moduleIndex, permissionType, value) => {
      setPermissions(prev =>
        prev.map((perm, idx) =>
          idx === moduleIndex
            ? { ...perm, [permissionType]: value }
            : perm
        )
      );
    };

    // Toggle all permissions for a single module
    const handleToggleModuleAll = (moduleIndex, value) => {
      setPermissions(prev =>
        prev.map((perm, idx) =>
          idx === moduleIndex
            ? { ...perm, canCreate: value, canRead: value, canUpdate: value, canDelete: value }
            : perm
        )
      );
    };

    const onSubmit = async (data) => {

      // Extract phone code and number from the formatted phone value
      let phoneCode = "91"; // default
      let phoneNumber = "";

      if (data.phone) {
        const phoneParts = data.phone.replace('+', '').split(' ');
        if (phoneParts.length > 1) {
          phoneCode = phoneParts[0];
          phoneNumber = phoneParts.slice(1).join('');
        } else {
          // If no country code detected, assume it's the local number
          phoneNumber = data.phone.replace(/\D/g, '');
          // Ensure it's exactly 10 digits
          if (phoneNumber.length === 10) {
            phoneCode = "91"; // default to India
          }
        }
      }

      try {
        const payload = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone.slice(-10),
          phoneCode: phoneCode,
          designation: data.designation,
          ...(data.password && { password: data.password }),
          permissions: permissions.filter(perm =>
            perm.canCreate || perm.canRead || perm.canUpdate || perm.canDelete
          ),
        };

        await api.put(`${END_POINT}/${selectedUser._id}`, payload);
        await fetchStaff();
        showToast("Staff member updated successfully!", "success");
        setCurrentView("userManagement");
        setSelectedUser(null);
      } catch (err) {
        showToast("Failed to update staff member", "error");
      }
    };

    const handleDelete = async () => {
      const onConfirm = async () => {
        try {
          await api.delete(`${END_POINT}/${selectedUser._id}`);
          await fetchStaff();
          setCurrentView("userManagement");
          setSelectedUser(null);
          showToast("Staff member deleted successfully!", "success");
        } catch (err) {
          showToast("Failed to delete staff member", "error");
          console.error(err);
        }
      }

      deleteConfirmTostNotification('', onConfirm);
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                {...register("fullName", {
                  required: "Full name is required",
                  minLength: {
                    value: 3,
                    message: "Full name must be at least 3 characters"
                  },
                  maxLength: {
                    value: 20,
                    message: "Full name cannot exceed 20 characters"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <input
                type="text"
                {...register("designation", {
                  required: "Designation is required",
                  minLength: {
                    value: 3,
                    message: "Designation must be at least 3 characters"
                  },
                  maxLength: {
                    value: 50,
                    message: "Designation cannot exceed 50 characters"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
              />
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-[10px]"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/*   Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Phone number is required",
                  validate: (value) => {
                    // if (!value) return "Phone number is required";

                    // // Remove all non-digit characters except plus
                    // const cleanedValue = value.replace(/[^\d+]/g, '');

                    // // Check if it has country code
                    // if (cleanedValue.startsWith('+')) {
                    //   const withoutPlus = cleanedValue.slice(1);
                    //   // Should have country code + phone number (at least 8 digits total)
                    //   return withoutPlus.length >= 11 || "Invalid phone number format";
                    // } else {
                    //   // Local number without country code - should be exactly 10 digits
                    //   return cleanedValue.length === 10 || "Phone must be exactly 10 digits";
                    // }
                  }
                }}
                render={({ field }) => (
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry="IN"
                    value={`91${field.value}`}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="w-full"
                    inputClassName="w-full px-4 py-2 border border-gray-300 rounded-[10px] focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    dropdownClassName="z-50"
                  />
                )}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password (leave blank to keep current) *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    // required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-[10px] pr-10"
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
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
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
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Info className="w-4 h-4 text-gray-400 mr-2" />
                          <h4 className="text-base font-medium text-gray-900 capitalize">
                            {perm.module}
                          </h4>
                        </div>

                        {/* Per-module Select All toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={perm.canCreate && perm.canRead && perm.canUpdate && perm.canDelete}
                            onChange={(e) => handleToggleModuleAll(index, e.target.checked)}
                          />
                          <div
                            className={`w-11 h-6 rounded-full transition-colors ${(perm.canCreate && perm.canRead && perm.canUpdate && perm.canDelete)
                              ? "bg-gradient-to-r from-[#CB376D] to-[#A72962]"
                              : "bg-gray-300"
                              }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform m-0.5 ${(perm.canCreate && perm.canRead && perm.canUpdate && perm.canDelete) ? "translate-x-5" : "translate-x-0"}`}
                            />
                          </div>
                          {/* <span className="ml-2 text-sm font-medium text-gray-700">Select all</span> */}
                        </label>
                      </div>

                      {/* <div className="ml-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white py-3 px-4 rounded-[10px] hover:opacity-90 transition-opacity font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </form>
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

    

     const handleClick =  () => {

      if(subscriptionData === "free trial" ){
        showToast("Cannot add users,Subscribe for create user","error")
        return
      }
     
      if(subscriptionData === "seed start" && filteredUsers.length >= 3){
        showToast("Your user limit reached.cannot add more users,Change plan to add more","error")
        return
      }
      if(subscriptionData === "growth" && filteredUsers.length >= 5){
        showToast("Your user limit reached.cannot add more users,Change plan to add more","error")
        return
      }
      if(subscriptionData === "growth plus" && filteredUsers.length >= 7){
        showToast("Your user limit reached.cannot add more users,Change plan to add more","error")
        return
      }

      
      setCurrentView("addEmployee")
    }

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
            <VideoPopupWithShare
                  // video_url="https://www.youtube.com/embed/MzEFeIRJ0eQ?si=JGtmQtyRIt_K6Dt5"
                  buttonCss="flex items-center text-sm gap-2 px-4 py-2  text-gray-700 bg-white rounded  hover:text-gray-500"
                />
            <button
              onClick={handleClick}
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
                    {user.designation.length > 15
                      ? user.designation.substring(0, 15) + "..."
                      : user.designation}
                  </div>
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle menu click here
                  }}
                >
                  {/* <MoreHorizontal /> */}
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
        return <AddEmployeeForm setCurrentView={setCurrentView} fetchStaff={fetchStaff} />;
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