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
      if (typeof value === 'string' && value.includes('/')) {
        const [day, month, year] = value.split('/');
        const date = new Date(year, month - 1, day);
        result[key] = date.toISOString();
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  const handleSave = async (formData) => {

    // console.log(formData);

    try {
      setIsLoading(true);

      // Normalize gender to lowercase if present
      // const payload = {
      //   ...formData.basic,
      //   ...(formData.basic?.gender ? { gender: String(formData.basic.gender).toLowerCase() } : {}),
      //   additionalData: formData.additionalData || {},
      //   advancedDetails: formData.advancedDetails || {},
      //   advancedPrivacyDetails: formData.advancedPrivacyDetails || {}
      // };

      const response = await api.patch(
        `/api/customers/${selectedCustomer._id}`,
        convertDateObjectToISO(formData)
      );
      showToast('Customer data updated successfully!', 'success');
      const updatedCustomer = response.data;
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
    } catch (error) {
      // console.error("Error updating customer:", error);
      showToast('Failed to update customer. Please try again', 'error');
      alert("Failed to update customer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !selectedCustomer) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!selectedCustomer) {
    return <div className="flex items-center justify-center h-screen">Customer not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex">
        <CustomerSidebar />
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
  );
};

export default CustomerProfile;