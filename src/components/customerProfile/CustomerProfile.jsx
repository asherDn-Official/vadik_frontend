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
  const [editedData, setEditedData] = useState({
    basic: {},
    additionalData: {},
    advancedDetails: {},
    advancedPrivacyDetails: {}
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/customers/${customerId}`);
        const data = response.data;
        setSelectedCustomer(data);
        setEditedData({
          basic: {
            firstname: data.firstname,
            lastname: data.lastname,
            mobileNumber: data.mobileNumber,
            source: data.source,
            customerId: data.customerId,
            firstVisit: data.firstVisit
          },
          additionalData: { ...data.additionalData },
          advancedDetails: { ...data.advancedDetails },
          advancedPrivacyDetails: { ...data.advancedPrivacyDetails }
        });
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
    if (selectedCustomer) {
      setEditedData({
        basic: {
          firstname: selectedCustomer.firstname,
          lastname: selectedCustomer.lastname,
          mobileNumber: selectedCustomer.mobileNumber,
          source: selectedCustomer.source,
          customerId: selectedCustomer.customerId,
          firstVisit: selectedCustomer.firstVisit
        },
        additionalData: { ...selectedCustomer.additionalData },
        advancedDetails: { ...selectedCustomer.advancedDetails },
        advancedPrivacyDetails: { ...selectedCustomer.advancedPrivacyDetails }
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Prepare the payload based on the active tab
      let payload = {
        ...editedData.basic,
        additionalData: editedData.additionalData,
        advancedDetails: editedData.advancedDetails,
        advancedPrivacyDetails: editedData.advancedPrivacyDetails
      };

      const response = await api.patch(
        `/api/customers/${selectedCustomer._id}`,
        payload
      );

      const updatedCustomer = response.data;
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

  const handleInputChange = (field, value, section = 'basic') => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
        <CustomerSidebar/>
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