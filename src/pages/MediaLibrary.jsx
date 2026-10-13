// import React, { useState } from "react";
// import { 
//   FiSearch, 
//   FiUpload, 
//   FiTrash2, 
//   FiImage, 
//   FiMusic, 
//   FiVideo, 
//   FiFileText, 
//   FiX 
// } from "react-icons/fi";

// // Mock media assets
// const INITIAL_MEDIA = [
//   { id: 1, name: "Business DNA.png", type: "image", url: "https://via.placeholder.com/300x200/F7F8FE/313166?text=300+x+200", size: "2.1 MB", date: "2026-10-09" },
//   { id: 2, name: "Product Banner.jpg", type: "image", url: "https://via.placeholder.com/300x200/F7F8FE/313166?text=300+x+200", size: "1.4 MB", date: "2026-10-05" },
//   { id: 3, name: "WhatsApp Video.mp4", type: "video", url: "https://via.placeholder.com/300x200/F7F8FE/313166?text=Video", size: "12.4 MB", date: "2026-10-08" },
//   { id: 4, name: "welcome business.mp4", type: "video", url: "https://via.placeholder.com/300x200/F7F8FE/313166?text=Video", size: "18.5 MB", date: "2026-10-07" },
//   { id: 5, name: "QR-EUSI LEAD.mp4", type: "video", url: "https://via.placeholder.com/300x200/F7F8FE/313166?text=Video", size: "8.2 MB", date: "2026-10-10" },
// ];

// export default function MediaLibrary() {
//   const [activeTab, setActiveTab] = useState("image"); // 'image' | 'audio' | 'video' | 'file'
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedMedia, setSelectedMedia] = useState(INITIAL_MEDIA[1]); // Default selected item
//   const [previewMedia, setPreviewMedia] = useState(null);

//   // Storage calculation
//   const usedStorageMB = 235.21;
//   const totalStorageGB = 1;
//   const storagePercentage = (usedStorageMB / (totalStorageGB * 1024)) * 100;

//   // Filter media based on active tab and search input
//   const filteredMedia = INITIAL_MEDIA.filter((item) => {
//     const matchesTab = item.type === activeTab;
//     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesTab && matchesSearch;
//   });

//   const counts = {
//     image: INITIAL_MEDIA.filter((m) => m.type === "image").length,
//     audio: INITIAL_MEDIA.filter((m) => m.type === "audio").length,
//     video: INITIAL_MEDIA.filter((m) => m.type === "video").length,
//     file: INITIAL_MEDIA.filter((m) => m.type === "file").length,
//   };

//   return (
//     <div className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 font-['Poppins',sans-serif]">
//       {/* Vadik App Panel Container */}
//       <div className="app-panel app-panel-padding w-full max-w-[1680px] mx-auto bg-white rounded-[24px] border border-[#E7EAF7] shadow-[0_10px_30px_rgba(49,49,102,0.07)]">
        
//         {/* Top Header: Title & Storage Indicator */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-[#E7EAF7] gap-4">
//           <div>
//             <h1 className="text-2xl font-bold leading-tight text-[#1F1C5C]">
//               Media Library
//             </h1>
//             <p className="mt-1 text-xs text-[#7E85A8]">
//               Manage and reuse your brand assets, media files, and creatives.
//             </p>
//           </div>

//           <div className="flex flex-wrap items-center gap-4 text-xs text-[#7E85A8]">
//             {/* Storage Meter */}
//             <div className="flex items-center gap-2.5 bg-[#F7F8FE] px-3.5 py-2 rounded-xl border border-[#E7EAF7]">
//               <span className="font-medium text-[#1F1C5C]">
//                 {usedStorageMB} MB used of {totalStorageGB} GB
//               </span>
//               <div className="w-24 h-2 bg-[#E7EAF7] rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-full transition-all duration-300" 
//                   style={{ width: `${storagePercentage}%` }}
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <button className="flex items-center gap-2 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm hover:opacity-95 transition-all">
//               <FiUpload size={15} /> Upload
//             </button>
//             <button className="flex items-center gap-2 bg-[#F7F8FE] text-[#1F1C5C] border border-[#E7EAF7] hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all">
//               <FiTrash2 size={15} /> Delete
//             </button>
//           </div>
//         </div>

//         {/* Search Input Bar */}
//         <div className="mt-5 relative">
//           <FiSearch className="absolute left-4 top-3.5 text-[#7E85A8]" size={18} />
//           <input
//             type="text"
//             placeholder="Search media..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full bg-[#F7F8FE] border border-[#E7EAF7] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1F1C5C] placeholder-[#7E85A8] focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D] transition-all"
//           />
//         </div>

//         {/* Category Tabs */}
//         <div className="flex gap-6 border-b border-[#E7EAF7] mt-6 text-sm">
//           {[
//             { id: "image", label: "Image", icon: FiImage },
//             { id: "audio", label: "Audio", icon: FiMusic },
//             { id: "video", label: "Video", icon: FiVideo },
//             { id: "file", label: "File", icon: FiFileText },
//           ].map((tab) => {
//             const Icon = tab.icon;
//             const isActive = activeTab === tab.id;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`flex items-center gap-2 pb-3 relative transition-all ${
//                   isActive 
//                     ? "text-[#CB376D] font-semibold border-b-2 border-[#CB376D]" 
//                     : "text-[#797994] hover:text-[#1F1C5C]"
//                 }`}
//               >
//                 <Icon size={16} />
//                 <span>{tab.label} ({counts[tab.id]})</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* Grid Sections */}
//         <div className="mt-6 space-y-8 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
          
//           {/* Recently Used */}
//           <div>
//             <h2 className="text-sm font-semibold text-[#1F1C5C] mb-3">
//               Recently used ({filteredMedia.length})
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//               {filteredMedia.map((item) => (
//                 <MediaCard
//                   key={`recent-${item.id}`}
//                   item={item}
//                   isSelected={selectedMedia?.id === item.id}
//                   onSelect={() => setSelectedMedia(item)}
//                   onPreview={() => setPreviewMedia(item)}
//                 />
//               ))}
//             </div>
//           </div>

//           {/* All Media */}
//           <div>
//             <h2 className="text-sm font-semibold text-[#1F1C5C] mb-3">
//               All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s ({filteredMedia.length})
//             </h2>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//               {filteredMedia.map((item) => (
//                 <MediaCard
//                   key={`all-${item.id}`}
//                   item={item}
//                   isSelected={selectedMedia?.id === item.id}
//                   onSelect={() => setSelectedMedia(item)}
//                   onPreview={() => setPreviewMedia(item)}
//                 />
//               ))}
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* Preview Modal */}
//       {previewMedia && (
//         <div className="fixed inset-0 bg-[#313166]/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
//           <div className="bg-white border border-[#E7EAF7] rounded-[24px] max-w-xl w-full p-6 relative shadow-[0_20px_50px_rgba(49,49,102,0.14)]">
//             <button
//               onClick={() => setPreviewMedia(null)}
//               className="absolute top-4 right-4 text-[#7E85A8] hover:text-[#1F1C5C] transition-colors"
//             >
//               <FiX size={20} />
//             </button>
            
//             <h3 className="text-lg font-bold text-[#1F1C5C] mb-4">{previewMedia.name}</h3>
            
//             <div className="bg-[#F7F8FE] border border-[#E7EAF7] rounded-2xl p-4 flex items-center justify-center min-h-[220px]">
//               {previewMedia.type === "image" ? (
//                 <img src={previewMedia.url} alt={previewMedia.name} className="max-h-64 object-contain rounded-lg" />
//               ) : (
//                 <div className="text-[#7E85A8] text-center">
//                   <FiVideo size={48} className="mx-auto mb-2 text-[#CB376D]" />
//                   <p className="text-sm font-medium text-[#1F1C5C]">{previewMedia.name}</p>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-between items-center mt-6">
//               <span className="text-xs text-[#7E85A8]">Size: {previewMedia.size}</span>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setPreviewMedia(null)}
//                   className="px-4 py-2 rounded-xl bg-[#F7F8FE] border border-[#E7EAF7] text-[#1F1C5C] text-sm hover:bg-[#EEF1FF] transition-all"
//                 >
//                   Close
//                 </button>
//                 <button 
//                   onClick={() => {
//                     setSelectedMedia(previewMedia);
//                     setPreviewMedia(null);
//                   }}
//                   className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white text-sm font-medium shadow-sm hover:opacity-95 transition-all"
//                 >
//                   Select Asset
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Media Card Component
// function MediaCard({ item, isSelected, onSelect, onPreview }) {
//   return (
//     <div
//       onClick={onPreview}
//       className={`group relative bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ${
//         isSelected 
//           ? "border-[#CB376D] ring-2 ring-[#CB376D]/20 shadow-md" 
//           : "border-[#E7EAF7] hover:border-[#CB376D]/50 hover:shadow-sm"
//       }`}
//     >
//       <div className="aspect-[4/3] bg-[#F7F8FE] flex items-center justify-center relative overflow-hidden border-b border-[#E7EAF7]">
//         {item.type === "image" ? (
//           <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-[#7E85A8]">
//             <FiVideo size={32} />
//           </div>
//         )}

//         {/* Selected / Hover Action Overlay */}
//         <div className={`absolute inset-0 bg-[#1F1C5C]/20 flex items-center justify-center transition-opacity ${
//           isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
//         }`}>
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onSelect();
//             }}
//             className="bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white text-xs px-3.5 py-1.5 rounded-lg font-medium shadow-md transition-all"
//           >
//             {isSelected ? "Selected" : "Select"}
//           </button>
//         </div>
//       </div>

//       <div className="p-3 bg-white">
//         <p className="text-xs font-semibold text-[#1F1C5C] truncate">{item.name}</p>
//         <p className="text-[10px] text-[#7E85A8] mt-0.5">{item.size}</p>
//       </div>
//     </div>
//   );
// }





import React, { useState, useEffect, useRef } from "react";
import { 
  FiSearch, FiUpload, FiTrash2, FiImage, FiMusic, FiVideo, FiFileText, FiX, FiExternalLink 
} from "react-icons/fi";
import api from "../api/apiconfig";

export default function MediaLibrary() {
  const [activeTab, setActiveTab] = useState("image"); // 'image' | 'audio' | 'video' | 'file'
  const [searchTerm, setSearchTerm] = useState("");
  const [mediaList, setMediaList] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [storageData, setStorageData] = useState({
    usedMB: "0.00",
    limitGB: 1,
    percentage: 0
  });

  const fileInputRef = useRef(null);

  // Fetch Storage Usage
  const fetchStorage = async () => {
    try {
      const res = await api.get("/api/media-library/storage");
      if (res.data.success) {
        setStorageData(res.data);
      }
    } catch (err) {
      console.error("Storage fetch error:", err);
    }
  };

  // Fetch Media Assets
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/media-library?type=${activeTab}&search=${searchTerm}`);
      if (res.data.success) {
        setMediaList(res.data.data);
      }
    } catch (err) {
      console.error("Media fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, []);

  useEffect(() => {
    fetchMedia();
    setPreviewMedia(null);
  }, [activeTab, searchTerm]);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enhanced category detection with extension fallback
    const fileName = file.name.toLowerCase();
    const isVideo = file.type.startsWith("video/") || /\.(mp4|3gp|mov|webm|mkv|avi)$/i.test(fileName);
    const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif)$/i.test(fileName);
    const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|aac|m4a)$/i.test(fileName);

    const maxSizes = {
      image: 10 * 1024 * 1024,
      video: 64 * 1024 * 1024, // 64 MB Limit
      audio: 16 * 1024 * 1024, // 16 MB Limit
      file: 25 * 1024 * 1024,  // 25 MB Limit
    };

    const fileCategory = isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : "file";

    if (file.size > maxSizes[fileCategory]) {
      alert(`File size exceeds ${maxSizes[fileCategory] / (1024 * 1024)} MB limit for ${fileCategory}s.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await api.post("/api/media-library/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        fetchMedia();
        fetchStorage();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Asset Delete
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation(); // Prevent opening preview on card click

    if (!window.confirm("Are you sure you want to delete this media asset?")) return;

    try {
      const res = await api.delete(`/api/media-library/${id}`);
      if (res.data.success) {
        if (selectedMedia?._id === id) setSelectedMedia(null);
        if (previewMedia?._id === id) setPreviewMedia(null);
        fetchMedia();
        fetchStorage();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 font-['Poppins',sans-serif]">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <div className="app-panel app-panel-padding w-full max-w-[1680px] mx-auto bg-white rounded-[24px] border border-[#E7EAF7] shadow-[0_10px_30px_rgba(49,49,102,0.07)]">
        
        {/* Header: Title & Dynamic Storage Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-[#E7EAF7] gap-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#1F1C5C]">Media Library</h1>
            <p className="mt-1 text-xs text-[#7E85A8]">Manage and reuse your brand assets, media files, and creatives.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#7E85A8]">
            <div className="flex items-center gap-2.5 bg-[#F7F8FE] px-3.5 py-2 rounded-xl border border-[#E7EAF7]">
              <span className="font-medium text-[#1F1C5C]">
                {storageData.usedMB} MB used of {storageData.limitGB} GB
              </span>
              <div className="w-24 h-2 bg-[#E7EAF7] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded-full transition-all duration-300" 
                  style={{ width: `${storageData.percentage}%` }}
                />
              </div>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white px-4 py-2.5 rounded-xl font-medium text-xs shadow-sm hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <FiUpload size={15} /> {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-5 relative">
          <FiSearch className="absolute left-4 top-3.5 text-[#7E85A8]" size={18} />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F7F8FE] border border-[#E7EAF7] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1F1C5C] placeholder-[#7E85A8] focus:outline-none focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D] transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-6 border-b border-[#E7EAF7] mt-6 text-sm">
          {[
            { id: "image", label: "Image", icon: FiImage },
            { id: "audio", label: "Audio", icon: FiMusic },
            { id: "video", label: "Video", icon: FiVideo },
            { id: "file", label: "File", icon: FiFileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 relative transition-all cursor-pointer ${
                  isActive 
                    ? "text-[#CB376D] font-semibold border-b-2 border-[#CB376D]" 
                    : "text-[#797994] hover:text-[#1F1C5C]"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Media Grid */}
        <div className="mt-6 space-y-8 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center py-10 text-[#7E85A8]">Loading assets...</div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-10 text-[#7E85A8]">No media items found in this category.</div>
          ) : (
            <div>
              <h2 className="text-sm font-semibold text-[#1F1C5C] mb-3">
                All {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s ({mediaList.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {mediaList.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setPreviewMedia(item)}
                    className="group relative bg-white border border-[#E7EAF7] hover:border-[#CB376D]/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-md"
                  >
                    {/* Delete Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item._id, e)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Asset"
                    >
                      <FiTrash2 size={14} />
                    </button>

                    <div className="aspect-[4/3] bg-[#F7F8FE] flex items-center justify-center relative overflow-hidden border-b border-[#E7EAF7]">
                      {activeTab === "image" ? (
                        <img src={item.s3Url} alt={item.fileName} className="w-full h-full object-cover" />
                      ) : activeTab === "video" ? (
                        <FiVideo size={28} className="text-[#7E85A8]" />
                      ) : activeTab === "audio" ? (
                        <FiMusic size={28} className="text-[#7E85A8]" />
                      ) : (
                        <FiFileText size={28} className="text-[#7E85A8]" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-[#1F1C5C] truncate">{item.fileName}</p>
                      <p className="text-[10px] text-[#7E85A8] mt-0.5">
                        {((item.sizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Asset Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative flex flex-col items-center shadow-2xl animate-in fade-in duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-all cursor-pointer"
            >
              <FiX size={18} />
            </button>

            <h3 className="text-base font-semibold text-[#1F1C5C] mb-4 pr-8 truncate max-w-full">
              {previewMedia.fileName}
            </h3>

            {/* Preview Box depending on file category */}
            <div className="w-full bg-[#F7F8FE] rounded-xl border border-[#E7EAF7] p-4 flex items-center justify-center min-h-[220px] max-h-[420px] overflow-hidden mb-5">
              {activeTab === "image" || previewMedia.mimeType?.startsWith("image/") ? (
                <img
                  src={previewMedia.s3Url}
                  alt={previewMedia.fileName}
                  className="max-h-[380px] w-auto object-contain rounded-lg"
                />
              ) : activeTab === "video" || previewMedia.mimeType?.startsWith("video/") ? (
                <video
                  src={previewMedia.s3Url}
                  controls
                  autoPlay
                  className="max-h-[380px] w-full rounded-lg"
                />
              ) : activeTab === "audio" || previewMedia.mimeType?.startsWith("audio/") ? (
                <div className="w-full flex flex-col items-center gap-4 py-8">
                  <FiMusic size={48} className="text-[#CB376D]" />
                  <audio src={previewMedia.s3Url} controls className="w-full max-w-md" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <FiFileText size={48} className="text-[#7E85A8]" />
                  <p className="text-sm text-[#1F1C5C] font-medium">{previewMedia.fileName}</p>
                  <p className="text-xs text-[#7E85A8]">
                    {((previewMedia.sizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between w-full">
              <a
                href={previewMedia.s3Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#F7F8FE] text-[#1F1C5C] border border-[#E7EAF7] hover:bg-gray-100 rounded-xl text-xs font-medium transition-all"
              >
                <FiExternalLink size={14} /> Open Original File
              </a>
              <button
                type="button"
                onClick={(e) => handleDelete(previewMedia._id, e)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                <FiTrash2 size={14} /> Delete Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}