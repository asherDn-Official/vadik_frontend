import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FiPlus, FiTrash2, FiSave, FiX, FiType, FiList, FiMove } from "react-icons/fi";
import api from "../../api/apiconfig";
import { X } from "lucide-react";

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
  const [newFieldIconName, setNewFieldIconName] = useState("");
  const [newFieldOptions, setNewFieldOptions] = useState([]);
  const [currentOption, setCurrentOption] = useState("");
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

  const fieldTypes = ["string", "number", "options", "date"];

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
    setNewFieldIconName("");
    setNewFieldOptions([]);
    setCurrentOption("");
    setAddError(null);
  };

  const cancelAddingField = () => {
    setIsAddingField(false);
    setNewFieldName("");
    setNewFieldIcon("");
    setNewFieldIconName("");
    setNewFieldOptions([]);
    setCurrentOption("");
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

    // Validate options for options type
    if (newFieldType === "options" && newFieldOptions.length === 0) {
      setAddError("Please add at least one option for options field type");
      return;
    }

    const newField = {
      key: newFieldName.trim(),
      value: "",
      type: newFieldType,
      iconUrl: newFieldIcon,
      iconName: newFieldIconName,
      options: newFieldType === "options" ? newFieldOptions : undefined
    };

    const updatedFields = {
      ...fields,
      [activeTab]: [...fields[activeTab], newField]
    };

    setFields(updatedFields);
    await updatePreferences(updatedFields);
    cancelAddingField();
  };

  const handleRemoveField = async (tabName, fieldKey) => {
    const updatedFields = {
      ...fields,
      [tabName]: fields[tabName].filter(field => field.key !== fieldKey)
    };

    setFields(updatedFields);
    await updatePreferences(updatedFields);
  };

  const selectIcon = (iconUrl, iconName) => {
    setNewFieldIcon(iconUrl);
    setNewFieldIconName(iconName);
    setShowIconSelector(false);
  };

  const addOption = () => {
    if (!currentOption.trim()) return;

    if (newFieldOptions.includes(currentOption.trim())) {
      setAddError("Option already exists");
      return;
    }

    setNewFieldOptions([...newFieldOptions, currentOption.trim()]);
    setCurrentOption("");
    setAddError(null);
  };

  const removeOption = (optionToRemove) => {
    setNewFieldOptions(newFieldOptions.filter(option => option !== optionToRemove));
  };

  const handleOptionKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  // if (isLoading || isCreatingPreference) {
  //   return (
  //     <div className="p-6 text-center">
  //       <p>Loading preferences...</p>
  //       {isCreatingPreference && <p>Creating new preference set...</p>}
  //     </div>
  //   );
  // }

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
    <div className="p-6 max-w-7xl mx-auto">

      <div className="bg-white   overflow-hidden">
        <div className="border-b  ">
          <div className="flex">
            {Object.keys(fields).map((tab) => (
              <button
                key={tab}
                className={`px-6 py-4 text-sm font-semibold transition-all duration-200 ${activeTab === tab
                    ? "text-primary bg-white border-b-2 border-gray-900 relative"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                onClick={() => {
                  setActiveTab(tab);
                  setIsAddingField(false);
                  setShowIconSelector(false);
                }}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-semibold text-[#313166] mb-1">
                {activeTab} Management
              </h3>
              <p className="text-gray-600 text-sm">
                Manage custom fields for {activeTab.toLowerCase()} section
              </p>
            </div>
            {!isAddingField && (
              <button
                onClick={startAddingField}
                className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <FiPlus className="mr-2" /> Add Field
              </button>
            )}
          </div>

          {/* {isAddingField && ( */}
          <div className="mb-6   rounded-lg border bg-gray-100 p-6">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => {
                      setNewFieldName(e.target.value);
                      setAddError(null);
                    }}
                    placeholder={`Enter ${activeTab.toLowerCase()} field name`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Type
                  </label>
                  <div className="relative">
                    <select
                      value={newFieldType}
                      onChange={(e) => {
                        setNewFieldType(e.target.value);
                        if (e.target.value !== "options") {
                          setNewFieldOptions([]);
                          setCurrentOption("");
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
                    >
                      {fieldTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <FiType className="absolute right-3 top-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowIconSelector(!showIconSelector)}
                    className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Select Icon"
                  >
                    {newFieldIcon ? (
                      <>
                        <img
                          src={newFieldIcon}
                          alt="Selected icon"
                          className="w-5 h-5 object-contain"
                        />
                        <span className="text-sm text-gray-600">{newFieldIconName}</span>
                      </>
                    ) : (
                      <>
                        <FiPlus className="w-5 h-5" />
                        <span className="text-sm text-gray-600">Select Icon</span>
                      </>
                    )}
                  </button>
                  {newFieldIcon && (
                    <button
                      onClick={() => {
                        setNewFieldIcon("");
                        setNewFieldIconName("");
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Remove Icon"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              </div>

              {showIconSelector && (
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Select an Icon</h4>
                  <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                    {icons.map(icon => (
                      <button
                        key={icon.name}
                        onClick={() => selectIcon(icon.dataUrl, icon.name)}
                        className={`p-2 border rounded-lg hover:border-primary transition-colors ${newFieldIcon === icon.dataUrl ? "border-2 border-primary bg-primary/10" : "border-gray-200"
                          }`}
                        title={icon.name}
                      >
                        <img
                          src={icon.dataUrl}
                          alt={icon.name}
                          className="w-10 h-10 mx-auto object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newFieldType === "options" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Options
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentOption}
                        onChange={(e) => {
                          setCurrentOption(e.target.value);
                          setAddError(null);
                        }}
                        onKeyPress={handleOptionKeyPress}
                        placeholder="Enter option name"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <button
                        onClick={addOption}
                        disabled={!currentOption.trim()}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {newFieldOptions.length > 0 && (
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <FiList className="text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Options ({newFieldOptions.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {newFieldOptions.map((option, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                              <span className="text-sm">{option}</span>
                              <button
                                onClick={() => removeOption(option)}
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                                title="Remove option"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={cancelAddingField}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FiX className="mr-2" /> Cancel
                </button>
                <button
                  onClick={handleAddField}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FiSave className="mr-2" /> Save Field
                </button>
              </div>
            </div>

            {addError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700 text-sm">{addError}</div>
              </div>
            )}
          </div>
          {/* )} */}

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={activeTab}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
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
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-4">

                                {field.iconUrl && (
                                  <div className="flex-shrink-0">
                                    <img
                                      src={field.iconUrl}
                                      alt={field.key}
                                      className="w-12 h-12 object-contain p-1 "
                                    />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{field.key}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${field.type === 'string' ? 'bg-blue-100 text-blue-800' :
                                        field.type === 'number' ? 'bg-green-100 text-green-800' :
                                          field.type === 'options' ? 'bg-purple-100 text-purple-800' :
                                            field.type === 'date' ? 'bg-orange-100 text-orange-800' :
                                              'bg-gray-100 text-gray-800'
                                      }`}>
                                      {field.type}
                                    </span>
                                  </div>

                                  {field.options && field.options.length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs text-gray-500 mb-1">
                                        Options ({field.options.length}):
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                        {field.options.slice(0, 3).map((option, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border"
                                          >
                                            {option}
                                          </span>
                                        ))}
                                        {field.options.length > 3 && (
                                          <span className="px-2 py-1 text-xs text-gray-500">
                                            +{field.options.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleRemoveField(activeTab, field.key)}
                                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove field"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <FiType className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No fields added yet</h3>
                      <p className="text-gray-500 mb-4">
                        Start by adding custom fields for {activeTab.toLowerCase()}
                      </p>
                      <button
                        onClick={startAddingField}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        <FiPlus className="mr-2" /> Add Your First Field
                      </button>
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