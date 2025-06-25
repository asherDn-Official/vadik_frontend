import { useState, useEffect } from "react";
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
  const [isAddingPreference, setIsAddingPreference] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newPreferenceName, setNewPreferenceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retailerId, setRetailerId] = useState("6856350030bcee9b82be4c17");
  const [preferenceId, setPreferenceId] = useState("6856350030bcee9b82be4c17");

  // Map UI tabs to API field names
  const tabToApiFieldMap = {
    "Basic Details": "additionalData",
    "Advance Details": "advancedDetails",
    "Advance Privacy": "advancedPrivacyDetails",
  };

  const createInitialPreference = async () => {
    try {
      const payload = {
        retailerId,
        additionalData: [],
        advancedDetails: [],
        advancedPrivacyDetails: []
      };

      const response = await axios.post(
        `http://13.60.19.134:5000/api/customer-preferences`,
        payload
      );

      setPreferenceId(response.data._id);
      return response.data._id;
    } catch (err) {
      console.error("Error creating initial preference:", err);
      setError("Failed to create initial preference");
      return null;
    }
  };

  const fetchPreferences = async () => {
    try {
      // First try to get the preference
      const response = await axios.get(
        `http://13.60.19.134:5000/api/customer-preferences/${retailerId}`
      );

      if (response.data) {
        setPreferenceId(response.data._id);
        // Transform API data to UI format
        const transformedFields = {
          "Basic Details":
            response.data.additionalData?.map((item) => ({
              id: `basic-${item.toLowerCase().replace(/\s+/g, "-")}`,
              label: item,
            })) || [],
          "Advance Details":
            response.data.advancedDetails?.map((item) => ({
              id: `advance-${item.toLowerCase().replace(/\s+/g, "-")}`,
              label: item,
            })) || [],
          "Advance Privacy":
            response.data.advancedPrivacyDetails?.map((item) => ({
              id: `privacy-${item.toLowerCase().replace(/\s+/g, "-")}`,
              label: item,
            })) || [],
        };

        setFields(transformedFields);
      }
      setIsLoading(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Preference not found, create a new one
        const newPreferenceId = await createInitialPreference();
        if (newPreferenceId) {
          // Retry fetching with the new preference ID
          await fetchPreferences();
        }
      } else {
        setError(err.message);
        setIsLoading(false);
        console.error("Error fetching preferences:", err);
      }
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceTab = result.source.droppableId;
    const destTab = result.destination.droppableId;
    const sourceFields = [...fields[sourceTab]];
    const destFields =
      sourceTab === destTab ? sourceFields : [...fields[destTab]];

    const [removed] = sourceFields.splice(result.source.index, 1);
    destFields.splice(result.destination.index, 0, removed);

    const updatedFields = {
      ...fields,
      [sourceTab]: sourceFields,
      [destTab]: destFields,
    };

    setFields(updatedFields);
    updatePreferences(updatedFields);
  };

  const startAddingField = () => {
    setIsAddingField(true);
    setNewFieldName("");
  };

  const cancelAddingField = () => {
    setIsAddingField(false);
    setNewFieldName("");
  };

  const startAddingPreference = () => {
    setIsAddingPreference(true);
    setNewPreferenceName("");
  };

  const cancelAddingPreference = () => {
    setIsAddingPreference(false);
    setNewPreferenceName("");
  };

  const updatePreferences = async (updatedFields) => {
    if (!preferenceId) return;

    try {
      const payload = {
        retailerId,
        additionalData: updatedFields["Basic Details"].map((f) => f.label),
        advancedDetails: updatedFields["Advance Details"].map((f) => f.label),
        advancedPrivacyDetails: updatedFields["Advance Privacy"].map((f) => f.label),
      };

      await axios.put(
        `http://13.60.19.134:5000/api/customer-preferences/${retailerId}`,
        payload
      );
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) return;

    const newField = {
      id: `field-${Date.now()}`,
      label: newFieldName.trim(),
    };

    const updatedFields = {
      ...fields,
      [activeTab]: [...fields[activeTab], newField],
    };

    setFields(updatedFields);
    await updatePreferences(updatedFields);
    setIsAddingField(false);
    setNewFieldName("");
  };

  const handleAddPreference = async () => {
    if (!newPreferenceName.trim()) return;

    try {
      const updatedFields = {
        ...fields,
        [activeTab]: [...fields[activeTab], {
          id: `pref-${Date.now()}`,
          label: newPreferenceName.trim()
        }],
      };

      setFields(updatedFields);
      await updatePreferences(updatedFields);
      setIsAddingPreference(false);
      setNewPreferenceName("");
    } catch (err) {
      console.error("Error adding preference:", err);
    }
  };

  const handleRemoveField = async (tabName, fieldId) => {
    const fieldToRemove = fields[tabName].find((f) => f.id === fieldId);
    if (!fieldToRemove) return;

    const updatedFields = {
      ...fields,
      [tabName]: fields[tabName].filter((field) => field.id !== fieldId),
    };

    setFields(updatedFields);
    await updatePreferences(updatedFields);
  };

  const handleUpdatePreferences = async () => {
    try {
      const payload = {
        retailerId,
        additionalData: fields["Basic Details"].map((f) => f.label),
        advancedDetails: fields["Advance Details"].map((f) => f.label),
        advancedPrivacyDetails: fields["Advance Privacy"].map((f) => f.label),
      };

      if (preferenceId) {
        await axios.put(
          `http://13.60.19.134:5000/api/customer-preferences/${preferenceId}`,
          payload
        );
      } else {
        const response = await axios.post(
          `http://13.60.19.134:5000/api/customer-preferences`,
          payload
        );
        setPreferenceId(response.data._id);
      }

      console.log("Preferences updated successfully");
    } catch (err) {
      console.error("Error updating preferences:", err);
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

          <div className="mt-6 space-y-4">
            {!isAddingPreference && (
              <button
                onClick={startAddingPreference}
                className="flex items-center px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <FiPlus className="mr-2" /> Add New Preference
              </button>
            )}

            {isAddingPreference && (
              <div className="flex items-center p-3 bg-gray-50 rounded border">
                <input
                  type="text"
                  value={newPreferenceName}
                  onChange={(e) => setNewPreferenceName(e.target.value)}
                  placeholder={`Enter new ${activeTab.toLowerCase()} preference`}
                  className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={handleAddPreference}
                  className="p-2 bg-green-500 text-white hover:bg-green-600"
                  title="Save"
                >
                  <FiSave />
                </button>
                <button
                  onClick={cancelAddingPreference}
                  className="p-2 bg-red-500 text-white hover:bg-red-600 ml-1"
                  title="Cancel"
                >
                  <FiX />
                </button>
              </div>
            )}

            <button
              onClick={handleUpdatePreferences}
              className="flex items-center px-6 py-2 bg-primary bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-md hover:bg-pink-700 text-white w-full justify-center"
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