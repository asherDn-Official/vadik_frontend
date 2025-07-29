import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FiPlus, FiTrash2, FiSave, FiX, FiType } from "react-icons/fi";
import api from "../../api/apiconfig";

const CustomerFieldPreferences = () => {
  const [activeTab, setActiveTab] = useState("Basic Details");
  const [fields, setFields] = useState({
    "Basic Details": [],
    "Advance Details": [],
    "Advance Privacy": [],
  });
  const [isAddingField, setIsAddingField] = useState(true);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("string");
  const [newFieldIcon, setNewFieldIcon] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retailerId] = useState(localStorage.getItem("retailerId") || "");
  const [preferenceId, setPreferenceId] = useState(null);
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);
  const [addError, setAddError] = useState(null);
  const [icons, setIcons] = useState([]);
  const [showIconSelector, setShowIconSelector] = useState(false);

  // Map UI tab names to API field names
  const tabToApiFieldMap = {
    "Basic Details": "additionalData",
    "Advance Details": "advancedDetails",
    "Advance Privacy": "advancedPrivacyDetails"
  };

  const fieldTypes = ["string", "number", "boolean", "array"];

  // Fetch icons from API
  const fetchIcons = async () => {
    try {
      const response = await api.get("/api/icons/all");
      setIcons(response.data.data || []);
    } catch (err) {
      console.error("Error fetching icons:", err);
    }
  };

  const createInitialPreference = async () => {
    setIsCreatingPreference(true);
    try {
      const payload = {
        retailerId,
        additionalData: [],
        advancedDetails: [],
        advancedPrivacyDetails: [],
      };

      const response = await api.post(`/api/customer-preferences`, payload);
      setPreferenceId(response.data._id);
      return response.data._id;
    } catch (err) {
      console.error("Error creating initial preference:", err);
      setError("Failed to create initial preference. Please try again.");
      return null;
    } finally {
      setIsCreatingPreference(false);
    }
  };

  const fetchPreferences = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/customer-preferences/${retailerId}`);

      if (response.data) {
        setPreferenceId(response.data._id);
        setFields({
          "Basic Details": response.data.additionalData || [],
          "Advance Details": response.data.advancedDetails || [],
          "Advance Privacy": response.data.advancedPrivacyDetails || []
        });
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        await createInitialPreference();
      } else {
        setError(err.message || "Failed to fetch preferences");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (retailerId) {
      fetchPreferences();
      fetchIcons();
    }
  }, [retailerId]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceTab = result.source.droppableId;
    const destTab = result.destination.droppableId;
    const sourceFields = [...fields[sourceTab]];
    const destFields = sourceTab === destTab ? sourceFields : [...fields[destTab]];

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
    setNewFieldType("string");
    setNewFieldIcon("");
    setAddError(null);
  };

  const cancelAddingField = () => {
    setIsAddingField(false);
    setNewFieldName("");
    setNewFieldIcon("");
    setAddError(null);
    setShowIconSelector(false);
  };

  const updatePreferences = async (updatedFields) => {
    if (!preferenceId) return;

    try {
      const payload = {
        // retailerId,
        additionalData: updatedFields["Basic Details"],
        advancedDetails: updatedFields["Advance Details"],
        advancedPrivacyDetails: updatedFields["Advance Privacy"]
      };

      await api.put(`/api/customer-preferences/${retailerId}`, payload);
      fetchPreferences();


    } catch (err) {
      console.error("Error updating preferences:", err);
      setError("Failed to update preferences. Please try again.");
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      setAddError("Field name cannot be empty");
      return;
    }

    // Check for duplicate field names in the current tab
    const duplicateExists = fields[activeTab].some(
      field => field.key.toLowerCase() === newFieldName.trim().toLowerCase()
    );

    if (duplicateExists) {
      setAddError("Field name must be unique");
      return;
    }

    const newField = {
      key: newFieldName.trim(),
      value: "",
      type: newFieldType,
      iconUrl: newFieldIcon,
      options: newFieldType === "array" ? [] : undefined
    };

    const updatedFields = {
      ...fields,
      [activeTab]: [...fields[activeTab], newField]
    };

    setFields(updatedFields);
    await updatePreferences(updatedFields);
    setIsAddingField(false);
    setNewFieldName("");
    setNewFieldIcon("");
    setShowIconSelector(false);
    setAddError(null);
  };

  const handleRemoveField = async (tabName, fieldKey) => {
    const updatedFields = {
      ...fields,
      [tabName]: fields[tabName].filter(field => field.key !== fieldKey)
    };

    setFields(updatedFields);
    await updatePreferences(updatedFields);
  };

  const selectIcon = (iconUrl) => {
    setNewFieldIcon(iconUrl);
    setShowIconSelector(false);
  };

  if (isLoading || isCreatingPreference) {
    return (
      <div className="p-6 text-center">
        <p>Loading preferences...</p>
        {isCreatingPreference && <p>Creating new preference set...</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchPreferences}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
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
                className={`px-6 py-3 text-sm font-medium ${activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => {
                  setActiveTab(tab);
                  setIsAddingField(false);
                  setShowIconSelector(false);
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
            {/* {!isAddingField && ( */}
              <button
                onClick={startAddingField}
                className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                <FiPlus className="mr-2" /> Add Field
              </button>
            {/* )} */}
          </div>

          {/* {isAddingField && ( */}
            <div className="mb-4 bg-gray-50 rounded border p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => {
                      setNewFieldName(e.target.value);
                      setAddError(null);
                    }}
                    placeholder={`Enter ${activeTab.toLowerCase()} field name`}
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />

                  <div className="relative">
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {fieldTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <FiType className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                  </div>

                  <button
                    onClick={() => setShowIconSelector(!showIconSelector)}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                    title="Select Icon"
                  >
                    {newFieldIcon ? (
                      <img
                        src={newFieldIcon}
                        alt="Selected icon"
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <FiPlus />
                    )}
                  </button>
                </div>

                {showIconSelector && (
                  <div className="border rounded p-3 bg-white">
                    <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                      {icons.map(icon => (
                        <button
                          key={icon.name}
                          onClick={() => selectIcon(icon.dataUrl)}
                          className={`p-1 border rounded hover:border-primary ${newFieldIcon === icon.dataUrl ? "border-2 border-primary" : ""
                            }`}
                          title={icon.name}
                        >
                          <img
                            src={icon.dataUrl}
                            alt={icon.name}
                            className="w-6 h-6 mx-auto object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleAddField}
                    className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <FiSave className="mr-1" /> Save
                  </button>
                  <button
                    onClick={cancelAddingField}
                    className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <FiX className="mr-1" /> Cancel
                  </button>
                </div>
              </div>

              {addError && (
                <div className="text-red-500 text-sm mt-2">{addError}</div>
              )}
            </div>
          {/* )} */}

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
                        key={field.key}
                        draggableId={field.key}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              {field.iconUrl && (
                                <img
                                  src={field.iconUrl}
                                  alt={field.key}
                                  className="w-5 h-5 object-contain"
                                />
                              )}
                              <div>
                                <div className="font-medium">{field.key}</div>
                                <div className="text-xs text-gray-500">
                                  Type: {field.type}
                                  {field.options && ` (${field.options.length} options)`}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveField(activeTab, field.key)}
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
        </div>
      </div>
    </div>
  );
};

export default CustomerFieldPreferences;