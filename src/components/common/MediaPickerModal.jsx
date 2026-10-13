import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSearch, FiUpload, FiImage, FiVideo, FiFileText, FiCheck } from "react-icons/fi";
import api from "../../api/apiconfig";

export default function MediaPickerModal({
  onClose,
  onSelect,
  mediaType,
  type,
  filterType,
  defaultTab,
  initialTab,
}) {
  const resolveTabType = () => {
    const raw = (mediaType || type || filterType || defaultTab || initialTab || "image").toLowerCase();
    if (raw === "video") return "video";
    if (raw === "file" || raw === "document") return "file";
    if (raw === "audio") return "audio";
    return "image";
  };

  const [activeTab, setActiveTab] = useState(resolveTabType);

  useEffect(() => {
    setActiveTab(resolveTabType());
  }, [mediaType, type, filterType, defaultTab, initialTab]);


  const [searchTerm, setSearchTerm] = useState("");
  const [mediaList, setMediaList] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/media-library?type=${activeTab}&search=${searchTerm}`);
      if (res.data?.success) {
        setMediaList(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [activeTab, searchTerm]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post("/api/media-library/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        fetchMedia();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      <div className="bg-white rounded-2xl w-full max-w-3xl border border-[#E7EAF7] shadow-2xl p-6 relative flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#E7EAF7]">
          <h3 className="text-lg font-bold text-[#1F1C5C]">Choose from Media Library</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={22} />
          </button>
        </div>

        {/* Top Actions: Search & Upload */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F8FE] border border-[#E7EAF7] rounded-xl text-sm focus:outline-none focus:border-[#CB376D]"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-95 transition-all disabled:opacity-50"
          >
            <FiUpload size={16} /> {uploading ? "Uploading..." : "Upload New"}
          </button>
        </div>

        {/* Media Grid
        <div className="mt-4 flex-1 overflow-y-auto min-h-[280px] max-h-[400px] pr-1">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading library...</div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No media assets found. Upload one to get started!</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mediaList.map((item) => {
                const isSelected = selectedAsset?.s3Url === item.s3Url;
                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedAsset(item)}
                    className={`relative border rounded-xl overflow-hidden cursor-pointer bg-[#F7F8FE] transition-all ${
                      isSelected ? "border-[#CB376D] ring-2 ring-[#CB376D]/20 shadow-md" : "border-[#E7EAF7] hover:border-[#CB376D]/50"
                    }`}
                  >
                    <div className="aspect-[4/3] flex items-center justify-center overflow-hidden relative">
                      {item.mimeType?.startsWith("image/") ? (
                        <img src={item.s3Url} alt={item.fileName} className="w-full h-full object-cover" />
                      ) : (
                        <FiImage size={28} className="text-gray-400" />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#CB376D] text-white rounded-full p-1">
                          <FiCheck size={12} />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs font-semibold text-[#1F1C5C] truncate">{item.fileName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div> */}



        {/* Type Switcher Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-[#E7EAF7] pb-2">
          {[
            { id: "image", label: "Images", icon: FiImage },
            { id: "video", label: "Videos", icon: FiVideo },
            { id: "file", label: "Files / Documents", icon: FiFileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedAsset(null);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#1F1C5C] text-white shadow-sm"
                    : "text-gray-600 hover:bg-[#F7F8FE] hover:text-[#1F1C5C]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Media Grid */}
        <div className="mt-4 flex-1 overflow-y-auto min-h-[280px] max-h-[400px] pr-1">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading library...</div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No {activeTab} assets found. Upload one to get started!</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {mediaList.map((item) => {
                const isSelected = selectedAsset?.s3Url === item.s3Url;
                const isVideo = item.mimeType?.startsWith("video/") || item.s3Url?.match(/\.(mp4|3gp|webm|mov)$/i);
                const isImage = item.mimeType?.startsWith("image/") || item.s3Url?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

                return (
                  <div
                    key={item._id}
                    onClick={() => setSelectedAsset(item)}
                    className={`relative border rounded-xl overflow-hidden cursor-pointer bg-[#F7F8FE] transition-all ${
                      isSelected ? "border-[#CB376D] ring-2 ring-[#CB376D]/20 shadow-md" : "border-[#E7EAF7] hover:border-[#CB376D]/50"
                    }`}
                  >
                    <div className="aspect-[4/3] flex items-center justify-center overflow-hidden relative bg-gray-100">
                      {isImage ? (
                        <img src={item.s3Url} alt={item.fileName} className="w-full h-full object-cover" />
                      ) : isVideo ? (
                        <video src={item.s3Url} className="w-full h-full object-cover pointer-events-none" muted />
                      ) : (
                        <div className="flex flex-col items-center gap-1 p-2 text-center text-[#1F1C5C]">
                          <FiFileText size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Document</span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#CB376D] text-white rounded-full p-1 shadow">
                          <FiCheck size={12} />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs font-semibold text-[#1F1C5C] truncate">{item.fileName}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E7EAF7] mt-4">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => selectedAsset && onSelect(selectedAsset.s3Url)}
            disabled={!selectedAsset}
            className="px-5 py-2 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-xl text-sm font-medium hover:opacity-95 disabled:opacity-50"
          >
            Use Selected {activeTab === "video" ? "Video" : activeTab === "file" ? "Document" : "Image"}
          </button>
        </div>
      </div>
    </div>
  );
}