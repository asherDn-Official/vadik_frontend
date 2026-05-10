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
      if (typeof value === "string" && value.includes("/")) {
        const [day, month, year] = value.split("/");
        const date = new Date(year, month - 1, day);
        result[key] = date.toISOString();
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  const handleSave = async (apiData) => {
    try {
      setIsLoading(true);

      // Convert date strings in the payload
      const payload = convertDateObjectToISO(apiData);

      const response = await api.patch(
        `/api/customers/${selectedCustomer._id}`,
        payload,
      );
      showToast("Customer data updated successfully!", "success");
      const updatedCustomer = response.data;
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
    } catch (error) {
      showToast(
        error.response?.data?.message || "Error updating customer",
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
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div
          className="
          flex min-h-0 flex-1 flex-col overflow-hidden
          rounded-2xl
          border border-[#EEF1FF]
          bg-white/95
          shadow-[0_4px_20px_rgba(49,49,102,0.06)]
          backdrop-blur-sm
        "
        >
          <div
            className="
            flex min-h-0 flex-1 flex-col
            xl:flex-row
          "
          >
            <div
              className="
              shrink-0
              border-[#EEF1FF]
              xl:w-[330px]
              xl:border-r
            "
            >
              <CustomerSidebar />
            </div>

            <div className="min-h-0 min-w-0 flex-1">
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
