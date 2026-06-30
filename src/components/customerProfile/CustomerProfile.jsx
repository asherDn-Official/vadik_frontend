import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerDetails from "./CustomerDetails";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const CustomerProfile = () => {
  const { customerId } = useParams();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("Advanced Details");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/customers/${customerId}`);
        const data = response.data;
        setSelectedCustomer(data);
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  function convertDateObjectToISO(dateObject) {
    const result = {};

    for (const [key, value] of Object.entries(dateObject)) {
      // Only attempt conversion for string values that match DD/MM/YYYY format
      if (typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split("/");
        const date = new Date(year, month - 1, day);
        
        // Check if the date is valid
        if (!isNaN(date.getTime())) {
          result[key] = date.toISOString();
        } else {
          console.warn(`Invalid date detected for key ${key}: ${value}`);
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  const handleSave = async (apiData) => {
    console.log("handleSave called with apiData:", apiData);
    try {
      setIsLoading(true);

      const formData = new FormData();
      
      // Separate profilePicture from the rest of apiData
      const { profilePicture, ...otherData } = apiData;
      console.log("profilePicture:", profilePicture);
      console.log("otherData:", otherData);

      // Convert date strings in the payload
      const payload = convertDateObjectToISO(otherData);
      console.log("payload after ISO conversion:", payload);

      // Append data to FormData
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && !(value instanceof Date)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await api.patch(
        `/api/customers/${selectedCustomer._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      showToast("Customer data updated successfully!", "success");
      const updatedCustomer = response.data;
      setSelectedCustomer(updatedCustomer);
      window.dispatchEvent(
        new CustomEvent("customer:updated", {
          detail: {
            customerId: updatedCustomer?._id,
            customer: updatedCustomer,
          },
        }),
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error in handleSave:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      showToast(
        error.response?.data?.error || error.response?.data?.message || "Error updating customer",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !selectedCustomer) {
    return (
      <div className="flex min-h-[calc(100vh-96px)] items-center justify-center p-4">
        <div className="rounded-2xl border border-[#EEF1FF] bg-white px-6 py-4 text-sm font-medium text-[#313166] shadow-[0_4px_20px_rgba(49,49,102,0.06)]">
          Loading customer profile...
        </div>
      </div>
    );
  }

  if (!selectedCustomer) {
    return (
      <div className="flex min-h-[calc(100vh-96px)] items-center justify-center p-4">
        <div className="rounded-2xl border border-[#EEF1FF] bg-white px-6 py-4 text-sm font-medium text-[#313166] shadow-[0_4px_20px_rgba(49,49,102,0.06)]">
          Customer not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent xl:overflow-hidden">
      <div
        className="
        flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4
        xl:mx-auto xl:h-[calc(100dvh-114px)] xl:max-h-[calc(100dvh-114px)] xl:w-full xl:max-w-[1680px] xl:overflow-hidden xl:px-5 xl:pb-5
      "
      >
        <div
          className="
          flex min-h-0 flex-1 flex-col overflow-hidden
          rounded-[28px]
          border border-[#EEF1FF]
          bg-white/95
          shadow-[0_4px_20px_rgba(49,49,102,0.06)]
          backdrop-blur-sm
          xl:h-full xl:min-h-0 xl:max-h-full
        "
        >
          <div
            className="
            flex min-h-0 flex-1 flex-col
            xl:grid xl:grid-cols-[304px_minmax(0,1fr)]
            2xl:grid-cols-[320px_minmax(0,1fr)]
            xl:h-full xl:min-h-0 xl:max-h-full
          "
          >
            <div
              className="
              min-h-0
              shrink-0
              border-[#EEF1FF]
              bg-white
              xl:h-full xl:min-h-0 xl:max-h-full
              xl:overflow-hidden
              xl:border-r
            "
            >
              <CustomerSidebar />
            </div>

            <div className="min-h-0 min-w-0 flex-1 bg-[#FCFCFF] xl:h-full xl:min-h-0 xl:max-h-full xl:overflow-hidden">
              <CustomerDetails
                customer={selectedCustomer}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isEditing={isEditing}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onSave={handleSave}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
