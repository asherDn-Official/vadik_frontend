import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerDetails from "./CustomerDetails";

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
        const response = await fetch(`http://13.60.19.134:5000/api/customers/${customerId}`);
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

  const handleSave = () => {
    // In a real application, you would save to a backend here
    console.log("Saving customer data:", editedData);

    // Update the selected customer with new data
    const updatedCustomer = {
      ...selectedCustomer,
      name: editedData.name,
      mobileNumber: editedData.mobileNumber,
      gender: editedData.gender,
      source: editedData.source,
      vadikId: editedData.vadikId,
      firstVisit: editedData.firstVisit,
      advancedDetails: {
        profession: editedData.profession,
        incomeLevel: editedData.incomeLevel,
        location: editedData.location,
        favouriteProduct: editedData.favouriteProduct,
        favouriteColour: editedData.favouriteColour,
        favouriteBrand: editedData.favouriteBrand,
        birthday: editedData.birthday,
        lifeStyle: editedData.lifeStyle,
        anniversary: editedData.anniversary,
        interest: editedData.interest,
        shirtMeasurement: editedData.shirtMeasurement,
        pantMeasurement: editedData.pantMeasurement,
        customerLabel: editedData.customerLabel,
      },
      advancedPrivacy: {
        communicationChannel: editedData.communicationChannel,
        communicationTypes: editedData.communicationTypes,
        privacyNote: editedData.privacyNote,
        satisfactionScore: editedData.satisfactionScore,
        engagementScore: editedData.engagementScore,
        optInOut: editedData.optInOut,
        loyaltyPoints: editedData.loyaltyPoints,
      },
    };

    setSelectedCustomer(updatedCustomer);
    setIsEditing(false);

    // Show success message
    alert("Customer data updated successfully!");
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
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
        {/* <CustomerSidebar
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
        /> */}

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