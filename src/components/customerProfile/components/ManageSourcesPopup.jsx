import React from "react";
import { X, Edit, Trash2, Plus, Save } from 'lucide-react';

const ManageSourcesPopup = ({
  show,
  onClose,
  sources,
  onSourcesUpdate,
  updateSources,
  loading,
  setLoading,
  sanitizeSourceName
}) => {
  const [popupSources, setPopupSources] = React.useState([]);
  const [newSource, setNewSource] = React.useState("");
  const [sourceError, setSourceError] = React.useState("");
  const [editingIndex, setEditingIndex] = React.useState(null);

  // Initialize popup sources when show changes
  React.useEffect(() => {
    if (show) {
      setPopupSources(sources);
      setNewSource("");
      setSourceError("");
      setEditingIndex(null);
    }
  }, [show, sources]);

  // Add new source
  const handleAddSource = () => {
    setSourceError("");
    const sanitizedSource = sanitizeSourceName(newSource);

    if (!sanitizedSource) {
      setSourceError("Please enter a source name.");
      return;
    }

    if (popupSources.includes(sanitizedSource)) {
      setSourceError("This source already exists!");
      return;
    }

    setPopupSources((prev) => [...prev, sanitizedSource]);
    setNewSource("");
  };

  const handleUpdateSourceName = (index, value) => {
    setSourceError("");
    const sanitizedSource = sanitizeSourceName(value);
    setPopupSources((prev) => {
      const next = [...prev];
      next[index] = sanitizedSource;
      return next;
    });
  };

  const handleRemoveSource = (index) => {
    setSourceError("");
    setPopupSources((prev) => prev.filter((_, idx) => idx !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleEditSource = (index) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = () => {
    setEditingIndex(null);
  };

  const handleSaveSources = async () => {
    setSourceError("");

    // If currently editing, save the edit first
    if (editingIndex !== null) {
      setEditingIndex(null);
    }

    const sanitizedList = popupSources
      .map((item) => sanitizeSourceName(item))
      .filter((item) => item.length > 0);

    if (sanitizedList.length !== popupSources.length) {
      setSourceError("Source names cannot be empty.");
      return;
    }

    const uniqueList = Array.from(new Set(sanitizedList));

    if (uniqueList.length !== sanitizedList.length) {
      setSourceError("Duplicate source names are not allowed.");
      return;
    }

    if (uniqueList.length === 0) {
      setSourceError("Please keep at least one source.");
      return;
    }

    const { success, sources: refreshedSources } = await updateSources(uniqueList);

    if (success) {
      const nextSources = refreshedSources ?? uniqueList;
      onSourcesUpdate(nextSources);
      onClose();
    } else {
      setSourceError("Unable to update sources. Please try again.");
    }
  };

  // Handle Enter key for adding new source
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSource();
    }
  };

  // Handle Escape key to close popup
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#313166]">Manage Sources</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Add New Source Section */}
          <div>
            <label className="block text-sm text-[#31316680] mb-2">Add New Source</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter source name"
                className="flex-1 p-2 border border-gray-300 rounded text-[#313166]"
              />
              <button
                onClick={handleAddSource}
                disabled={loading || !newSource.trim()}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
            {sourceError && (
              <p className="text-red-500 text-xs mt-1">{sourceError}</p>
            )}
          </div>

          {/* Existing Sources List */}
          <div>
            <label className="block text-sm text-[#31316680] mb-2">Existing Sources</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {popupSources.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No sources available</p>
              ) : (
                popupSources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    {editingIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={source}
                          onChange={(e) => handleUpdateSourceName(index, e.target.value)}
                          className="flex-1 p-1 border border-gray-300 rounded text-[#313166] text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveEdit();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Save"
                        >
                          <Save size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-[#313166] capitalize">
                          {source}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditSource(index)}
                            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleRemoveSource(index)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={handleSaveSources}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSourcesPopup;