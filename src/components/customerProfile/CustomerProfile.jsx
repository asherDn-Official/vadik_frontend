import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerDetails from "./CustomerDetails";
import api from "../../api/apiconfig";

const CustomerProfile = () => {
  const { customerId } = useParams();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState("Advanced Details");
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://13.60.19.134:5000/api/customers/${customerId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch customer");
        }
        const data = await response.json();
        setSelectedCustomer(data);
        setEditedData({
          ...data,
          ...data.additionalData,
          ...data.advancedDetails,
          ...data.advancedPrivacyDetails,
        });
      } catch (error) {
        console.error("Error fetching customer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setEditedData({
      ...customer,
      ...customer.additionalData,
      ...customer.advancedDetails,
      ...customer.advancedPrivacyDetails,
    });
    setIsEditing(false);
    setActiveTab("Advanced Details");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedCustomer) {
      setEditedData({
        ...selectedCustomer,
        ...selectedCustomer.additionalData,
        ...selectedCustomer.advancedDetails,
        ...selectedCustomer.advancedPrivacyDetails,
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      let payload = {};

      if (activeTab === "Advanced Details") {
        // Extract only advancedDetails fields from editedData
        const { advancedDetails, ...rest } = selectedCustomer;
        payload = {
          ...rest,
          advancedDetails: Object.keys(editedData).reduce((acc, key) => {
            if (key in advancedDetails) {
              acc[key] = editedData[key];
            }
            return acc;
          }, {}),
        };
      } else if (activeTab === "Advanced Privacy") {
        // Extract only advancedPrivacyDetails fields from editedData
        const { advancedPrivacyDetails, ...rest } = selectedCustomer;
        payload = {
          ...rest,
          advancedPrivacyDetails: Object.keys(editedData).reduce((acc, key) => {
            if (key in advancedPrivacyDetails) {
              acc[key] = editedData[key];
            }
            return acc;
          }, {}),
        };
      } else {
        // For Basic Details
        const { additionalData, ...rest } = selectedCustomer;
        payload = {
          ...rest,
          additionalData: Object.keys(editedData).reduce((acc, key) => {
            if (key in additionalData) {
              acc[key] = editedData[key];
            }
            return acc;
          }, {}),
        };
      }

      const response = await api.patch(
        `http://13.60.19.134:5000/api/customers/${selectedCustomer._id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update customer");
      }

      const updatedCustomer = await response.json();
      setSelectedCustomer(updatedCustomer);
      setIsEditing(false);
      alert("Customer data updated successfully!");
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading && !selectedCustomer) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!selectedCustomer) {
    return (
      <div className="flex items-center justify-center h-screen">
        Customer not found
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex">
        <CustomerSidebar
          // selectedCustomer={selectedCustomer}
          // onCustomerSelect={handleCustomerSelect}
          retailerId={"685a49ac0f2998c871215353"}
        />

        <CustomerDetails
          customer={selectedCustomer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isEditing={isEditing}
          editedData={editedData}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSave}
          onInputChange={handleInputChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default CustomerProfile;
