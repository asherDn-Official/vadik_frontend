import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { extractFieldValue, transformCustomerData, transformFormDataToAPI, formatFieldForDisplay, getInputType, getFieldType } from "../../utils/customerDataUtils";
import EditIcon from '../../../public/assets/edit-icon.png';
import profileImg from '../../../public/assets/profile.png';



// Memoized FieldItem component to prevent unnecessary re-renders
const FieldItem = React.memo(({
  label,
  name,
  defaultValue,
  section = 'basic',
  isEditable = false,
  value,
  onChange,
  customer,
  isEditing
}) => {
  const fieldType = getFieldType(customer, section, name);
  const inputType = getInputType(fieldType);

  const handleInputChange = useCallback((e) => {
    onChange(section, name, e.target.value);
  }, [onChange, section, name]);

  return (
    <div className="mb-4">
      <p className="font-normal text-[14px] leading-[30px] tracking-normal text-[#31316699]">{label}</p>
      {isEditing && isEditable ? (
        <input
          type={inputType}
          value={value || ''}
          onChange={handleInputChange}
          className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete="off"
        />
      ) : (
        <p className="font-medium text-[16px] leading-[30px] tracking-normal text-[#313166]">
          {formatFieldForDisplay(defaultValue, fieldType)}
        </p>
      )}
    </div>
  );
});

// Memoized DetailItem component to prevent unnecessary re-renders
const DetailItem = React.memo(({
  label,
  name,
  defaultValue,
  section = 'basic',
  isEditable = false,
  value,
  onChange,
  customer,
  isEditing
}) => {
  const fieldType = getFieldType(customer, section, name);
  const inputType = getInputType(fieldType);

  const handleInputChange = useCallback((e) => {
    onChange(section, name, e.target.value);
  }, [onChange, section, name]);

  return (
    <div className="flex items-center justify-between p-4 rounded-[14px]" style={{ border: "1px solid #3131661A" }}>
      <div className="flex items-center  gap-x-3">
        {/* <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDkiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OSA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC42MjEwOTQiIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgcng9IjI0IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMjEwMl80NjQ2KSIgZmlsbC1vcGFjaXR5PSIwLjE1Ii8+CjxyZWN0IHg9IjcuNDY0ODQiIHk9IjYuODU5MzgiIHdpZHRoPSIzNC4yODU3IiBoZWlnaHQ9IjM0LjI4NTciIHJ4PSIxNy4xNDI5IiBmaWxsPSIjRUMzOTZGIi8+CjxyZWN0IHg9IjcuNDY0ODQiIHk9IjYuODU5MzgiIHdpZHRoPSIzNC4yODU3IiBoZWlnaHQ9IjM0LjI4NTciIHJ4PSIxNy4xNDI5IiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXJfMjEwMl80NjQ2KSIvPgo8cmVjdCB4PSI3LjQ2NDg0IiB5PSI2Ljg1OTM4IiB3aWR0aD0iMzQuMjg1NyIgaGVpZ2h0PSIzNC4yODU3IiByeD0iMTcuMTQyOSIgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzIxMDJfNDY0NikiLz4KPHJlY3QgeD0iNy40NjQ4NCIgeT0iNi44NTkzOCIgd2lkdGg9IjM0LjI4NTciIGhlaWdodD0iMzQuMjg1NyIgcng9IjE3LjE0MjkiIGZpbGw9IiNFQzM5NkYiIGZpbGwtb3BhY2l0eT0iMC41Ii8+CjxwYXRoIGQ9Ik0yNy40IDE2QzI3LjU5NTkgMTYgMjcuNzg1MSAxNi4wNzIgMjcuOTMxNSAxNi4yMDIyQzI4LjA3NzkgMTYuMzMyNCAyOC4xNzE1IDE2LjUxMTggMjguMTk0NCAxNi43MDY0TDI4LjIgMTYuOFYxNy42SDI5QzI5LjYxMjIgMTcuNiAzMC4yMDEyIDE3LjgzMzkgMzAuNjQ2NiAxOC4yNTM4QzMxLjA5MiAxOC42NzM4IDMxLjM2MDEgMTkuMjQ4MSAzMS4zOTYgMTkuODU5MkwzMS40IDIwVjI5LjZDMzEuNCAzMC4yMTIyIDMxLjE2NjEgMzAuODAxMiAzMC43NDYyIDMxLjI0NjZDMzAuMzI2MiAzMS42OTIgMjkuNzUxOSAzMS45NjAxIDI5LjE0MDggMzEuOTk2TDI5IDMySDE5LjRDMTguNzg3OCAzMiAxOC4xOTg4IDMxLjc2NjEgMTcuNzUzNCAzMS4zNDYyQzE3LjMwOCAzMC45MjYyIDE3LjAzOTkgMzAuMzUxOSAxNy4wMDQgMjkuNzQwOEwxNyAyOS42VjIwQzE3IDE5LjM4NzggMTcuMjMzOSAxOC43OTg4IDE3LjY1MzggMTguMzUzNEMxOC4wNzM4IDE3LjkwOCAxOC42NDgxIDE3LjYzOTkgMTkuMjU5MiAxNy42MDRMMTkuNCAxNy42SDIwLjJWMTYuOEMyMC4yMDAyIDE2LjU5NjEgMjAuMjc4MyAxNi40IDIwLjQxODMgMTYuMjUxN0MyMC41NTgzIDE2LjEwMzQgMjAuNzQ5NiAxNi4wMTQyIDIwLjk1MzEgMTYuMDAyM0MyMS4xNTY3IDE1Ljk5MDMgMjEuMzU3MSAxNi4wNTY1IDIxLjUxMzUgMTYuMTg3NEMyMS42Njk4IDE2LjMxODMgMjEuNzcwMyAxNi41MDM5IDIxLjc5NDQgMTYuNzA2NEwyMS44IDE2LjhWMTcuNkgyNi42VjE2LjhDMjYuNiAxNi41ODc4IDI2LjY4NDMgMTYuMzg0MyAyNi44MzQzIDE2LjIzNDNDMjYuOTg0MyAxNi4wODQzIDI3LjE4NzggMTYgMjcuNCAxNlpNMjkuOCAyMS42SDE4LjZWMjkuM0MxOC42IDI5Ljg2NCAxOC45MDg4IDMwLjMyODggMTkuMzA2NCAzMC4zOTI4TDE5LjQgMzAuNEgyOUMyOS40MTA0IDMwLjQgMjkuNzQ4OCAyOS45NzYgMjkuNzk0NCAyOS40MjhMMjkuOCAyOS4zVjIxLjZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuMjAwNyAyNEMyNC4zOTY2IDI0IDI0LjU4NTcgMjQuMDcyIDI0LjczMjIgMjQuMjAyMkMyNC44Nzg2IDI0LjMzMjQgMjQuOTcyMiAyNC41MTE4IDI0Ljk5NTEgMjQuNzA2NEwyNS4wMDA3IDI0LjhWMjcuMkMyNS4wMDA1IDI3LjQwMzkgMjQuOTIyNCAyNy42IDI0Ljc4MjQgMjcuNzQ4M0MyNC42NDI0IDI3Ljg5NjYgMjQuNDUxMSAyNy45ODU4IDI0LjI0NzYgMjcuOTk3N0MyNC4wNDQgMjguMDA5NyAyMy44NDM2IDI3Ljk0MzUgMjMuNjg3MiAyNy44MTI2QzIzLjUzMDggMjcuNjgxNyAyMy40MzA0IDI3LjQ5NjEgMjMuNDA2MyAyNy4yOTM2TDIzLjQwMDcgMjcuMlYyNS42QzIzLjE5NjggMjUuNTk5OCAyMy4wMDA3IDI1LjUyMTcgMjIuODUyNCAyNS4zODE3QzIyLjcwNDEgMjUuMjQxNyAyMi42MTQ5IDI1LjA1MDQgMjIuNjAyOSAyNC44NDY5QzIyLjU5MSAyNC42NDMzIDIyLjY1NzIgMjQuNDQyOSAyMi43ODgxIDI0LjI4NjVDMjIuOTE5IDI0LjEzMDIgMjMuMTA0NiAyNC4wMjk3IDIzLjMwNzEgMjQuMDA1NkwyMy40MDA3IDI0SDI0LjIwMDdaIiBmaWxsPSJ3aGl0ZSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzIxMDJfNDY0NiIgeDE9Ii0zMS4zNzg5IiB5MT0iMjMuNDY2NyIgeDI9IjExNC4wOSIgeTI9IjIzLjQ2NjciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzMxMzE2NiIvPgo8c3RvcCBvZmZzZXQ9IjAuOTYzNTAyIiBzdG9wLWNvbG9yPSIjRUMzOTZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQxX2xpbmVhcl8yMTAyXzQ2NDYiIHgxPSItMTUuMzkyMyIgeTE9IjIzLjYyMTMiIHgyPSI4OC41MTQ0IiB5Mj0iMjMuNjIxMyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjMzEzMTY2Ii8+CjxzdG9wIG9mZnNldD0iMC45NjM1MDIiIHN0b3AtY29sb3I9IiNFQzM5NkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDJfbGluZWFyXzIxMDJfNDY0NiIgeDE9Ii0zOC43MTU5IiB5MT0iLTM0LjI4MzUiIHgyPSI3My45Nzk2IiB5Mj0iLTI4Ljc5ODkiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzMxMzE2NiIvPgo8c3RvcCBvZmZzZXQ9IjAuOTYzNTAyIiBzdG9wLWNvbG9yPSIjRUMzOTZGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==" alt="" /> */}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {isEditing && isEditable ? (
            <input
              type={inputType}
              value={value || ''}
              onChange={handleInputChange}
              className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              placeholder={`Enter ${label.toLowerCase()}`}
              autoComplete="off"
            />
          ) : (
            <p className="text-sm text-gray-600">
              {formatFieldForDisplay(defaultValue, fieldType)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

// Set display names for debugging
FieldItem.displayName = 'FieldItem';
DetailItem.displayName = 'DetailItem';

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
  // Transform customer data to handle new nested structure
  const transformedCustomer = useMemo(() => transformCustomerData(customer), [customer]);

  // Initialize form data with proper default values
  const [formData, setFormData] = useState(() => {
    if (transformedCustomer) {
      return {
        basic: {
          firstname: transformedCustomer?.firstname || '',
          lastname: transformedCustomer?.lastname || '',
          mobileNumber: transformedCustomer?.mobileNumber || '',
          source: transformedCustomer?.source || '',
          customerId: transformedCustomer?.customerId || '',
          firstVisit: transformedCustomer?.firstVisit ? new Date(transformedCustomer.firstVisit).toLocaleDateString() : '',
        },
        additionalData: transformedCustomer?.additionalData || {},
        advancedDetails: transformedCustomer?.advancedDetails || {},
        advancedPrivacyDetails: transformedCustomer?.advancedPrivacyDetails || {},
      };
    }
    return {
      basic: {
        firstname: '',
        lastname: '',
        mobileNumber: '',
        source: '',
        customerId: '',
        firstVisit: ''
      },
      additionalData: {},
      advancedDetails: {},
      advancedPrivacyDetails: {},
    };
  });

  // Update form data when customer data changes
  useEffect(() => {
    if (transformedCustomer) {
      const newFormData = {
        basic: {
          firstname: transformedCustomer?.firstname || '',
          lastname: transformedCustomer?.lastname || '',
          mobileNumber: transformedCustomer?.mobileNumber || '',
          source: transformedCustomer?.source || '',
          customerId: transformedCustomer?.customerId || '',
          firstVisit: transformedCustomer?.firstVisit ? new Date(transformedCustomer.firstVisit).toLocaleDateString() : '',
        },
        additionalData: transformedCustomer?.additionalData || {},
        advancedDetails: transformedCustomer?.advancedDetails || {},
        advancedPrivacyDetails: transformedCustomer?.advancedPrivacyDetails || {},
      };
      setFormData(newFormData);
    }
  }, [transformedCustomer]);

  // Memoized callback for handling input changes
  const handleInputChange = useCallback((section, name, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: value
      }
    }));
  }, []);

  const tabs = ["Advanced Details", "Advanced Privacy", "Referral"];
  const [showBirthdayPopup, setShowBirthdayPopup] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState("");
  const [messageType, setMessageType] = useState("birthday");
  const [showPurchaseList, setShowPurchaseList] = useState(false);
  const [showAllPurchases, setShowAllPurchases] = useState(false);





  const renderStars = (rating) => {
    if (!rating) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  // Memoized function to render dynamic fields
  const renderDynamicFields = useCallback((fields, section) => {
    if (!fields) return null;

    return Object.entries(fields).map(([key, value]) => {
      const isEditable = isEditing;

      if (section === 'additionalData') {
        return (
          <FieldItem
            key={key}
            label={key}
            name={key}
            defaultValue={value}
            section={section}
            isEditable={isEditable}
            value={formData?.[section]?.[key]}
            onChange={handleInputChange}
            customer={customer}
            isEditing={isEditing}
          />
        );
      } else if (section === 'advancedPrivacy' && key.toLowerCase().includes('satisfaction')) {
        return (
          <div key={key} className="flex items-center p-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4">
              <img src="../assets/score-icon.png" alt={key} className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">{key}</p>
              <div className="flex items-center">
                {renderStars(value)}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <DetailItem
            key={key}
            label={key}
            name={key}
            defaultValue={value}
            section={section}
            isEditable={isEditable}
            value={formData?.[section]?.[key]}
            onChange={handleInputChange}
            customer={customer}
            isEditing={isEditing}
          />
        );
      }
    });
  }, [formData, isEditing, handleInputChange, customer]);

  const onSubmit = (e) => {
    e.preventDefault();

    // Transform the form data back to API format
    const formattedData = transformFormDataToAPI(formData, customer);

    // Call the parent save handler with formatted data
    onSave(formattedData);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F5F9]">
      <div className="pr-6 pt-6 pl-6">
        <h1 className="text-xl font-semibold text-gray-900">Customer Profile</h1>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={onSubmit}>
          <div className="rounded-lg shadow-sm">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200 mb-5 bg-white rounded-[20px]">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={transformedCustomer?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"}
                      // src={profileImg}
                      alt={`${transformedCustomer?.firstname} ${transformedCustomer?.lastname}`}
                      className="w-[148px] h-[212px] rounded-lg  object-contain"
                    />
                  </div>
                  <div className="ml-14 w-full">
                    <h2 className=" font-bold text-[18px] leading-[30px] tracking-normal mb-6 text-[#313166] underline font-poppins">Basic Details</h2>

                    <div className="flex flex-wrap  gap-x-10 gap-y-6  mb-6">
                      <FieldItem
                        label="First Name"
                        name="firstname"
                        defaultValue={transformedCustomer?.firstname}
                        isEditable={isEditing}
                        value={formData?.basic?.firstname}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="Last Name"
                        name="lastname"
                        defaultValue={transformedCustomer?.lastname}
                        isEditable={isEditing}
                        value={formData?.basic?.lastname}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="Mobile Number"
                        name="mobileNumber"
                        defaultValue={transformedCustomer?.mobileNumber}
                        isEditable={isEditing}
                        value={formData?.basic?.mobileNumber}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="Source"
                        name="source"
                        defaultValue={transformedCustomer?.source}
                        isEditable={isEditing}
                        value={formData?.basic?.source}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="Customer ID"
                        name="customerId"
                        defaultValue={transformedCustomer?.customerId}
                        value={formData?.basic?.customerId}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />
                      <FieldItem
                        label="First Visit"
                        name="firstVisit"
                        defaultValue={transformedCustomer?.firstVisit ? new Date(transformedCustomer.firstVisit).toLocaleDateString() : ''}
                        value={formData?.basic?.firstVisit}
                        onChange={handleInputChange}
                        customer={customer}
                        isEditing={isEditing}
                      />

                      {renderDynamicFields(transformedCustomer?.additionalData, "additionalData")}
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
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-4 border-b-2 font-medium rounded-[10px] text-sm ${activeTab === tab
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
                        type="button"
                        onClick={onEdit}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                      >
                        <img src={EditIcon} className="w-4 h-4 mr-2" alt="Edit" />
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
                    {transformedCustomer?.advancedDetails && renderDynamicFields(transformedCustomer?.advancedDetails, "advancedDetails")}
                  </div>
                )}

                {activeTab === "Advanced Privacy" && (
                  <div className="space-y-0">
                    {transformedCustomer?.advancedPrivacyDetails && renderDynamicFields(transformedCustomer?.advancedPrivacyDetails, "advancedPrivacy")}

                    {/* Purchase History Section */}
                    <div className="p-6 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Purchase History</h3>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowPurchaseList(!showPurchaseList)}
                            className="p-2 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            {showPurchaseList ? <BarChart className="w-5 h-5" /> : <List className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {!showPurchaseList ? (
                        <div className="mb-6 h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={transformedCustomer?.chartData || []}>
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
                          {(transformedCustomer?.purchaseHistory || []).slice(0, showAllPurchases ? undefined : 5).map((purchase, index) => (
                            <div key={index} className="flex justify-between items-center py-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{purchase.item}</p>
                                <p className="text-xs text-gray-500">{purchase.date}</p>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{purchase.amount}</p>
                            </div>
                          ))}
                          {(transformedCustomer?.purchaseHistory || []).length > 5 && (
                            <button
                              type="button"
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
                          {(transformedCustomer?.referralData || []).map((referral, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral?.vidNo}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral?.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral?.phoneNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{referral?.joinDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <span className={`px-2 py-1 rounded text-xs ${referral?.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                  {referral?.couponCode}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${referral?.status === "active" ? "bg-green-500" : "bg-red-500"
                                  }`}>
                                  {referral?.status === "active" ? (
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
                      {(transformedCustomer?.referralData || []).length === 0 && (
                        <div className="text-center py-8 text-gray-500">No referral data available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Mode Buttons */}
            {isEditing && (
              <div className="bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
        </form>
      </div>
    </div>
  );
};

export default CustomerDetails;