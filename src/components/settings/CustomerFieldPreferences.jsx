import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const CustomerFieldPreferences = () => {
  const [activeTab, setActiveTab] = useState("Basic Details");
  const [fields, setFields] = useState({
    "Basic Details": [
      { id: "first-name", label: "First Name" },
      { id: "last-name", label: "Last Name" },
      { id: "mobile", label: "Mobile Number" },
      { id: "source", label: "Source" },
      { id: "id", label: "Id" },
    ],
    "Advance Details": [
      { id: "profession", label: "Profession" },
      { id: "income", label: "Income Level" },
      { id: "location", label: "Location" },
      { id: "favorite-product", label: "Favourite Product" },
      { id: "favorite-color", label: "Favourite Colour" },
    ],
    "Advance Privacy": [
      { id: "communication", label: "Communication Channel" },
      { id: "communication-type", label: "Type of Communication" },
      { id: "privacy", label: "Privacy Note" },
      { id: "satisfaction", label: "Satisfaction Score" },
      { id: "engagement", label: "Engagement Score" },
    ],
  });

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

  const handleAddField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      label: "New Field",
    };
    setFields({
      ...fields,
      [activeTab]: [...fields[activeTab], newField],
    });
  };

  const handleRemoveField = (tabName, fieldId) => {
    setFields({
      ...fields,
      [tabName]: fields[tabName].filter((field) => field.id !== fieldId),
    });
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-6">Customer Field Preferences</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex">
            {Object.keys(fields).map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[15px] text-[#313166] font-medium">
              Basic Details Management
            </h3>
            <button
              onClick={handleAddField}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-pink-700"
            >
              + Add
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={activeTab}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {fields[activeTab].map((field, index) => (
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
                          className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                        >
                          <span>:: {field.label}</span>
                          <button
                            onClick={() =>
                              handleRemoveField(activeTab, field.id)
                            }
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-6">
            <button className="px-6 py-2 bg-primary bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-md hover:bg-pink-700">
              Update Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFieldPreferences;
