import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FiPlus, FiTrash2, FiSave, FiX } from "react-icons/fi";
import axios from "axios";

const CustomerFieldPreferences = () => {
  const [activeTab, setActiveTab] = useState("Basic Details");
  const [fields, setFields] = useState({
    "Basic Details": [],
    "Advance Details": [],
    "Advance Privacy": [],
  });
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retailerId, setRetailerId] = useState("12345");
  const [preferenceId, setPreferenceId] = useState("");

  // Map UI tabs to API field names
  const tabToApiFieldMap = {
    "Basic Details": "additionalData",
    "Advance Details": "advancedDetails",
    "Advance Privacy": "advancedPrivacyDetails",
  };

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.get(
          "http://13.60.19.134:5000/api/customer-preferences"
        );
        
        if (response.data && response.data.length > 0) {
          // Find preferences for our retailer
          const retailerPrefs = response.data.find(
            pref => pref.retailerId === retailerId
          );

          if (retailerPrefs) {
            setPreferenceId(retailerPrefs._id);
            
            // Transform API data to UI format
            const transformedFields = {
              "Basic Details": retailerPrefs.additionalData.map(item => ({
                id: `basic-${item.toLowerCase().replace(/\s+/g, '-')}`,
                label: item,
              })),
              "Advance Details": retailerPrefs.advancedDetails.map(item => ({
                id: `advance-${item.toLowerCase().replace(/\s+/g, '-')}`,
                label: item,
              })),
              "Advance Privacy": retailerPrefs.advancedPrivacyDetails.map(item => ({
                id: `privacy-${item.toLowerCase().replace(/\s+/g, '-')}`,
                label: item,
              })),
            };

            setFields(transformedFields);
          }
        }
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        console.error("Error fetching preferences:", err);
      }
    };

    fetchPreferences();
  }, [retailerId]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceTab = result.source.droppableId;
    const destTab = result.destination.droppableId;
    const sourceFields = [...fields[sourceTab]];
    const destFields =
      sourceTab === destTab ? sourceFields : [...fields[destTab]];

    const [removed] = sourceFields.splice(result.source.index, 1);
    destFields.splice(result.destination.index, 0, removed);

    setFields({
      ...fields,
      [sourceTab]: sourceFields,
      [destTab]: destFields,
    });
  };

  const startAddingField = () => {
    setIsAddingField(true);
    setNewFieldName("");
  };

  const cancelAddingField = () => {
    setIsAddingField(false);
    setNewFieldName("");
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return;

    const newField = {
      id: `field-${Date.now()}`,
      label: newFieldName.trim(),
    };

    // Update local state immediately for better UX
    setFields(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newField],
    }));

    try {
      // Prepare the updated preferences
      const apiFieldName = tabToApiFieldMap[activeTab];
      const updatedFields = {
        retailerId,
        [apiFieldName]: [...fields[activeTab].map(f => f.label), newField.label],
      };

      // Use PUT if we have a preferenceId, otherwise POST
      if (preferenceId) {
        await axios.put(
          `http://13.60.19.134:5000/api/customer-preferences/${preferenceId}`,
          updatedFields
        );
      } else {
        const response = await axios.post(
          "http://13.60.19.134:5000/api/customer-preferences",
          updatedFields
        );
        if (response.data._id) {
          setPreferenceId(response.data._id);
        }
      }
    } catch (err) {
      console.error("Error adding field:", err);
      // Revert local state if API call fails
      setFields(fields);
    }

    setIsAddingField(false);
    setNewFieldName("");
  };

  const handleRemoveField = async (tabName, fieldId) => {
    // Find the field to remove
    const fieldToRemove = fields[tabName].find(f => f.id === fieldId);
    if (!fieldToRemove) return;

    // Update local state immediately
    const updatedFields = {
      ...fields,
      [tabName]: fields[tabName].filter((field) => field.id !== fieldId),
    };
    setFields(updatedFields);

    try {
      // Prepare the updated preferences
      const apiFieldName = tabToApiFieldMap[tabName];
      const updatedPreferences = {
        retailerId,
        [apiFieldName]: updatedFields[tabName].map(f => f.label),
      };

      // Use PUT to update
      await axios.put(
        `http://13.60.19.134:5000/api/customer-preferences/${preferenceId}`,
        updatedPreferences
      );
    } catch (err) {
      console.error("Error removing field:", err);
      // Revert local state if API call fails
      setFields(fields);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      const updatedPreferences = {
        retailerId,
        additionalData: fields["Basic Details"].map(f => f.label),
        advancedDetails: fields["Advance Details"].map(f => f.label),
        advancedPrivacyDetails: fields["Advance Privacy"].map(f => f.label),
      };

      if (preferenceId) {
        await axios.put(
          `http://13.60.19.134:5000/api/customer-preferences/${preferenceId}`,
          updatedPreferences
        );
      } else {
        const response = await axios.post(
          "http://13.60.19.134:5000/api/customer-preferences",
          updatedPreferences
        );
        if (response.data._id) {
          setPreferenceId(response.data._id);
        }
      }
      
      console.log("Preferences updated successfully");
      // You might want to show a success message to the user
    } catch (err) {
      console.error("Error updating preferences:", err);
      // You might want to show an error message to the user
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading preferences...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-medium mb-6 text-[#313166]">
        Customer Field Preferences
      </h2>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {Object.keys(fields).map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab(tab);
                  setIsAddingField(false);
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] text-[#313166] font-medium">
              {activeTab} Management
            </h3>
            {!isAddingField && (
              <button
                onClick={startAddingField}
                className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                <FiPlus className="mr-2" /> Add Field
              </button>
            )}
          </div>

          {isAddingField && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded border">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder={`Enter ${activeTab.toLowerCase()} field name`}
                className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={handleAddField}
                className="p-2 bg-green-500 text-white hover:bg-green-600"
                title="Save"
              >
                <FiSave />
              </button>
              <button
                onClick={cancelAddingField}
                className="p-2 bg-red-500 text-white hover:bg-red-600 ml-1"
                title="Cancel"
              >
                <FiX />
              </button>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={activeTab}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {fields[activeTab].length > 0 ? (
                    fields[activeTab].map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100"
                          >
                            <div className="flex items-center">
                              <span className="mr-2 text-gray-400">::</span>
                              <span>{field.label}</span>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveField(activeTab, field.id)
                              }
                              className="text-gray-400 hover:text-red-500 p-1"
                              title="Remove field"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No fields added yet
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-6">
            <button
              onClick={handleUpdatePreferences}
              className="flex items-center px-6 py-2 bg-primary bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-md hover:bg-pink-700 text-white"
            >
              <FiSave className="mr-2" /> Update Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFieldPreferences;