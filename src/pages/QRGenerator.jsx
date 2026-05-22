// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { QRCodeSVG } from "qrcode.react";
// import { 
//   QrCode, 
//   UserPlus, 
//   Gamepad2, 
//   Download, 
//   Copy, 
//   ExternalLink,
//   ChevronRight,
//   Info,
//   Loader2,
//   FileSpreadsheet,
//   Plus,
//   X,
//   ChevronDown,
//   Check,
//   ShieldCheck,
//   LayoutDashboard,
//   Database
// } from "lucide-react";
// import api from "../api/apiconfig";
// import showToast from "../utils/ToastNotification";

// const QRGenerator = () => {
//   const { auth } = useAuth();
//   const [qrType, setQrType] = useState("registration"); // registration | activity
//   const [activityType, setActivityType] = useState("quiz"); // quiz | spinwheel | scratchcard
//   const [activities, setActivities] = useState({
//     quiz: [],
//     spinwheel: [],
//     scratchcard: []
//   });
//   const [selectedActivityId, setSelectedActivityId] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [retailerId, setRetailerId] = useState(localStorage.getItem("retailerId") || "");
//   const [includePreferences, setIncludePreferences] = useState(false);
//   const [selectedPreferences, setSelectedPreferences] = useState([]); // [{key, question, section}]
//   const [categorizedPreferences, setCategorizedPreferences] = useState({
//     additionalData: [],
//     advancedDetails: [],
//     advancedPrivacyDetails: []
//   });
//   const [isPreferenceDropdownOpen, setIsPreferenceDropdownOpen] = useState([]);
//   const [qrStatement, setQrStatement] = useState("");
//   const [isDynamic, setIsDynamic] = useState(false);
//   const [qrName, setQrName] = useState("");
//   const [savedQRs, setSavedQRs] = useState([]);
//   const [selectedDynamicQR, setSelectedDynamicQR] = useState(null);
//   const [fgColor, setFgColor] = useState("#000000");
//   const [bgColor, setBgColor] = useState("#ffffff");
//   const [brandingName, setBrandingName] = useState("");
//   const [logo, setLogo] = useState(null);
//   const [logoOpacity, setLogoOpacity] = useState(1);
//   const [logoSize, setLogoSize] = useState(40);
//   const [logoPlacement, setLogoPlacement] = useState("top"); // top | inside

//   // Set default branding and logo from retailer info
//   useEffect(() => {
//     if (auth?.user && !selectedDynamicQR) {
//       if (!brandingName) setBrandingName(auth.user.storeName || "");
//       if (!logo) setLogo(auth.user.storeImage || null);
//     }
//   }, [auth, selectedDynamicQR]);

//   const landingPageBaseUrl = "https://vadik.ai"; // Adjust as needed

//   useEffect(() => {
//     fetchActivities();
//     fetchSavedQRs();
//     fetchAvailablePreferences();
//   }, []);

//   const fetchAvailablePreferences = async () => {
//     try {
//       const response = await api.get(`/api/customer-preferences/${retailerId}`);
//       if (response.data) {
//         setCategorizedPreferences({
//           additionalData: response.data.additionalData || [],
//           advancedDetails: response.data.advancedDetails || [],
//           advancedPrivacyDetails: response.data.advancedPrivacyDetails || []
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching available preferences:", error);
//     }
//   };

//   const fetchSavedQRs = async () => {
//     try {
//       const response = await api.get("/api/dynamic-qr/my-qrs");
//       if (response.data.status) {
//         setSavedQRs(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching saved QRs:", error);
//     }
//   };

//   const handleLogoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 2 * 1024 * 1024) {
//         showToast("Logo size should be less than 2MB", "error");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setLogo(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSaveQR = async () => {
//     if (!qrName) {
//       showToast("Please enter a name for this QR", "error");
//       return;
//     }

//     if (includePreferences) {
//       const invalid = selectedPreferences.some(p => !p.key || !p.question);
//       if (invalid) {
//         showToast("Please complete all preference fields and questions", "error");
//         return;
//       }
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         name: qrName,
//         type: qrType,
//         activityType: qrType === "activity" ? activityType : "none",
//         activityId: qrType === "activity" ? selectedActivityId : "",
//         includePreferences,
//         selectedPreferences: includePreferences ? selectedPreferences : [],
//         qrStatement,
//         fgColor,
//         bgColor,
//         brandingName,
//         logo,
//         logoSize,
//         logoOpacity,
//         logoPlacement
//       };

//       let response;
//       if (selectedDynamicQR) {
//         response = await api.patch(`/api/dynamic-qr/${selectedDynamicQR._id}`, payload);
//         showToast("QR updated successfully!", "success");
//       } else {
//         response = await api.post("/api/dynamic-qr", payload);
//         showToast("QR created successfully!", "success");
//       }

//       if (response.data.status) {
//         fetchSavedQRs();
//         setSelectedDynamicQR(response.data.data);
//         setIsDynamic(true);
//       }
//     } catch (error) {
//       showToast("Failed to save QR", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectDynamicQR = (qr) => {
//     setSelectedDynamicQR(qr);
//     setQrName(qr.name);
//     setQrType(qr.type);
//     if (qr.type === "activity") {
//       setActivityType(qr.activityType);
//       setSelectedActivityId(qr.activityId);
//     }
//     setIncludePreferences(qr.includePreferences);
//     setSelectedPreferences(qr.selectedPreferences || []);
//     setQrStatement(qr.qrStatement || "");
//     setFgColor(qr.fgColor || "#000000");
//     setBgColor(qr.bgColor || "#ffffff");
//     setBrandingName(qr.brandingName || "");
//     setLogo(qr.logo || null);
//     setLogoSize(Math.min(qr.logoSize || 40, 50));
//     setLogoOpacity(qr.logoOpacity || 1);
//     setLogoPlacement(qr.logoPlacement || "top");
//     setIsDynamic(true);
//     setIsPreferenceDropdownOpen(new Array(qr.selectedPreferences?.length || 0).fill(false));
//   };

//   const fetchActivities = async () => {
//     setLoading(true);
//     try {
//       const [quizRes, spinRes, scratchRes] = await Promise.all([
//         api.get("/api/quiz?fully=true"),
//         api.get("/api/spinWheels/spinWheel/all?fully=true"),
//         api.get("/api/scratchCards/scratchCard/all?fully=true")
//       ]);

//       setActivities({
//         quiz: quizRes.data.docs || [],
//         spinwheel: spinRes.data.data || [],
//         scratchcard: scratchRes.data.data || []
//       });
//     } catch (error) {
//       console.error("Error fetching activities:", error);
//       showToast("Failed to load activities", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addPreferenceQuestion = () => {
//     setSelectedPreferences([...selectedPreferences, { key: "", question: "", section: "" }]);
//     setIsPreferenceDropdownOpen([...isPreferenceDropdownOpen, false]);
//   };

//   const removePreferenceQuestion = (index) => {
//     const updated = selectedPreferences.filter((_, i) => i !== index);
//     setSelectedPreferences(updated);
//     const updatedDropdowns = isPreferenceDropdownOpen.filter((_, i) => i !== index);
//     setIsPreferenceDropdownOpen(updatedDropdowns);
//   };

//   const togglePreferenceDropdown = (index) => {
//     const updated = [...isPreferenceDropdownOpen];
//     updated[index] = !updated[index];
//     setIsPreferenceDropdownOpen(updated);
//   };

//   const handlePreferenceKeyChange = (index, key, section) => {
//     const sectionFields = categorizedPreferences[section];
//     const selectedPref = sectionFields.find(p => p.key === key);
    
//     if (selectedPref) {
//       const updated = [...selectedPreferences];
//       updated[index] = {
//         key: selectedPref.key,
//         section: section,
//         question: selectedPref.type === "date" 
//           ? `When is your ${selectedPref.key}?` 
//           : `What is your ${selectedPref.key}?`
//       };
//       setSelectedPreferences(updated);
//     }
//   };

//   const handlePreferenceQuestionChange = (index, value) => {
//     const updated = [...selectedPreferences];
//     updated[index].question = value;
//     setSelectedPreferences(updated);
//   };

//   const getGeneratedUrl = () => {
//     if (isDynamic && selectedDynamicQR) {
//       return `${landingPageBaseUrl}/q/${selectedDynamicQR.qrId}`;
//     }

//     let baseUrl = "";
//     if (qrType === "registration") {
//       baseUrl = `${landingPageBaseUrl}/customer-registration/${retailerId}`;
//     } else {
//       if (!selectedActivityId) return "";
//       baseUrl = `${landingPageBaseUrl}/customer-registration/${retailerId}?activityType=${activityType}&activityId=${selectedActivityId}`;
//     }

//     if (includePreferences) {
//       baseUrl += (baseUrl.includes("?") ? "&" : "?") + "includePreferences=true";
//       if (selectedPreferences.length > 0) {
//         baseUrl += `&prefFields=${encodeURIComponent(JSON.stringify(selectedPreferences))}`;
//       }
//     }
//     return baseUrl;
//   };

//   const generatedUrl = getGeneratedUrl();

//   const downloadQR = () => {
//     const svg = document.getElementById("qr-code-svg");
//     if (!svg) return;
//     const svgData = new XMLSerializer().serializeToString(svg);
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     const img = new Image();
//     img.onload = () => {
//       const padding = 40;
//       const statementHeight = qrStatement ? 60 : 0;
//       const brandingHeight = (brandingName || (logo && logoPlacement === "top")) ? 80 : 0;
      
//       canvas.width = img.width + (padding * 2);
//       canvas.height = img.height + (padding * 2) + statementHeight + brandingHeight;
      
//       ctx.fillStyle = bgColor;
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       if (brandingHeight > 0) {
//         ctx.fillStyle = fgColor === "#ffffff" ? "#000000" : fgColor;
//         ctx.font = "bold 28px Inter, system-ui, sans-serif";
//         ctx.textAlign = "center";
        
//         if (logo && logoPlacement === "top") {
//           const logoImg = new Image();
//           logoImg.crossOrigin = "anonymous";
//           logoImg.onload = () => {
//             const logoDispSize = 40;
//             const gap = 15;
//             const textWidth = ctx.measureText(brandingName).width;
//             const totalWidth = brandingName ? (logoDispSize + gap + textWidth) : logoDispSize;
//             const startX = (canvas.width - totalWidth) / 2;
            
//             ctx.globalAlpha = logoOpacity;
//             ctx.drawImage(logoImg, startX, padding + 10, logoDispSize, logoDispSize);
//             ctx.globalAlpha = 1;
            
//             if (brandingName) {
//               ctx.textAlign = "left";
//               ctx.fillText(brandingName, startX + logoDispSize + gap, padding + 40);
//             }
            
//             // Continue drawing rest after logo loads
//             drawRest();
//           };
//           logoImg.src = logo;
//         } else if (brandingName) {
//           ctx.fillText(brandingName, canvas.width / 2, padding + 40);
//           drawRest();
//         } else {
//           drawRest();
//         }
//       } else {
//         drawRest();
//       }

//       function drawRest() {
//         ctx.drawImage(img, padding, padding + brandingHeight);
        
//         if (qrStatement) {
//           ctx.fillStyle = fgColor === "#ffffff" ? "#000000" : fgColor;
//           ctx.font = "bold 24px Inter, system-ui, sans-serif";
//           ctx.textAlign = "center";
//           ctx.fillText(qrStatement, canvas.width / 2, img.height + padding + brandingHeight + 40);
//         }
        
//         const pngFile = canvas.toDataURL("image/png");
//         const downloadLink = document.createElement("a");
//         downloadLink.download = `QR_${qrType}_${new Date().getTime()}.png`;
//         downloadLink.href = `${pngFile}`;
//         downloadLink.click();
//       }
//     };
//     img.src = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgData)))}`;
//   };

//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(generatedUrl);
//     showToast("URL copied to clipboard!", "success");
//   };

//   const handleQrTypeChange = (type) => {
//     setQrType(type);
//     if (type === "activity") {
//       setIncludePreferences(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#F6F7FB] p-4 md:p-8">
//       <div className="max-w-5xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-[#313166] flex items-center gap-3">
//             <QrCode className="w-8 h-8 text-pink-500" />
//             QR Module
//           </h1>
//           <p className="text-gray-500 mt-2">
//             Generate QR codes for customer registration and engagement activities.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-6">
//             <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 md:p-8">
//               <h2 className="text-xl font-bold text-[#313166] mb-6 flex items-center gap-2">
//                 1. Select QR Type
//               </h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <button
//                   onClick={() => handleQrTypeChange("registration")}
//                   className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all ${
//                     qrType === "registration" 
//                     ? "border-purple-500 bg-purple-50" 
//                     : "border-gray-100 hover:border-gray-200"
//                   }`}
//                 >
//                   <UserPlus className={`w-8 h-8 mb-3 ${qrType === "registration" ? "text-purple-600" : "text-gray-400"}`} />
//                   <span className={`font-bold ${qrType === "registration" ? "text-purple-900" : "text-gray-700"}`}>Customer Registration</span>
//                   <span className="text-sm text-gray-500 mt-1">Direct customers to your sign-up page</span>
//                 </button>

//                 <button
//                   onClick={() => handleQrTypeChange("activity")}
//                   className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all ${
//                     qrType === "activity" 
//                     ? "border-pink-500 bg-pink-50" 
//                     : "border-gray-100 hover:border-gray-200"
//                   }`}
//                 >
//                   <Gamepad2 className={`w-8 h-8 mb-3 ${qrType === "activity" ? "text-pink-600" : "text-gray-400"}`} />
//                   <span className={`font-bold ${qrType === "activity" ? "text-pink-900" : "text-gray-700"}`}>Customer Activity</span>
//                   <span className="text-sm text-gray-500 mt-1">Redirect to games or quizzes</span>
//                 </button>
//               </div>

//               <div className="mt-8 pt-8 border-t border-gray-100">
//                 <h2 className="text-xl font-bold text-[#313166] mb-6 flex items-center gap-2">
//                   2. Customize QR Options
//                 </h2>
                
//                 <div className="space-y-6">
//                   {qrType === "registration" && (
//                     <div className="flex items-center gap-3">
//                       <input
//                         type="checkbox"
//                         id="includePreferences"
//                         checked={includePreferences}
//                         onChange={(e) => {
//                           setIncludePreferences(e.target.checked);
//                           if (e.target.checked && selectedPreferences.length === 0) {
//                             addPreferenceQuestion();
//                           }
//                         }}
//                         className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                       />
//                       <label htmlFor="includePreferences" className="text-sm font-semibold text-gray-700">
//                         Include Customer Preference Questions in Form
//                       </label>
//                     </div>
//                   )}

//                   {qrType === "registration" && includePreferences && (
//                     <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
//                       {selectedPreferences.map((item, index) => (
//                         <div key={index} className="bg-[#31316612] rounded-2xl p-6 border border-gray-200 relative group">
//                           <div className="flex justify-between items-start mb-4">
//                             <h3 className="text-lg font-semibold text-slate-800">
//                               Question {index + 1}
//                             </h3>
                            
//                             <div className="flex items-center gap-3">
//                               <div className="relative">
//                                 <button
//                                   type="button"
//                                   onClick={() => togglePreferenceDropdown(index)}
//                                   className="flex items-center justify-between w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
//                                 >
//                                   <span className="text-sm truncate">
//                                     {item.key ? `${item.key} (${item.section.replace(/([A-Z])/g, ' $1')})` : "Select Field"}
//                                   </span>
//                                   <ChevronDown className="w-4 h-4 text-gray-400" />
//                                 </button>

//                                 {isPreferenceDropdownOpen[index] && (
//                                   <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-300 rounded-md shadow-lg z-[100] max-h-80 overflow-y-auto">
//                                     {/* Additional Data */}
//                                     {categorizedPreferences.additionalData.length > 0 && (
//                                       <div className="p-2">
//                                         <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
//                                           <Database className="w-3 h-3" /> Additional Data
//                                         </div>
//                                         {categorizedPreferences.additionalData.map((pref) => (
//                                           <button
//                                             key={pref.key}
//                                             type="button"
//                                             onClick={() => {
//                                               handlePreferenceKeyChange(index, pref.key, "additionalData");
//                                               togglePreferenceDropdown(index);
//                                             }}
//                                             className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors rounded-lg flex items-center justify-between group"
//                                           >
//                                             <span className="text-gray-700 group-hover:text-purple-700">{pref.key}</span>
//                                             <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">{pref.type}</span>
//                                           </button>
//                                         ))}
//                                       </div>
//                                     )}

//                                     {/* Advanced Details */}
//                                     {categorizedPreferences.advancedDetails.length > 0 && (
//                                       <div className="p-2 bg-gray-50/50">
//                                         <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
//                                           <LayoutDashboard className="w-3 h-3" /> Advanced Details
//                                         </div>
//                                         {categorizedPreferences.advancedDetails.map((pref) => (
//                                           <button
//                                             key={pref.key}
//                                             type="button"
//                                             onClick={() => {
//                                               handlePreferenceKeyChange(index, pref.key, "advancedDetails");
//                                               togglePreferenceDropdown(index);
//                                             }}
//                                             className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors rounded-lg flex items-center justify-between group"
//                                           >
//                                             <span className="text-gray-700 group-hover:text-purple-700">{pref.key}</span>
//                                             <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">{pref.type}</span>
//                                           </button>
//                                         ))}
//                                       </div>
//                                     )}

//                                     {/* Advanced Privacy Details */}
//                                     {categorizedPreferences.advancedPrivacyDetails.length > 0 && (
//                                       <div className="p-2">
//                                         <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
//                                           <ShieldCheck className="w-3 h-3" /> Advanced Privacy Details
//                                         </div>
//                                         {categorizedPreferences.advancedPrivacyDetails.map((pref) => (
//                                           <button
//                                             key={pref.key}
//                                             type="button"
//                                             onClick={() => {
//                                               handlePreferenceKeyChange(index, pref.key, "advancedPrivacyDetails");
//                                               togglePreferenceDropdown(index);
//                                             }}
//                                             className="w-full px-3 py-2 text-left text-sm hover:bg-purple-50 transition-colors rounded-lg flex items-center justify-between group"
//                                           >
//                                             <span className="text-gray-700 group-hover:text-purple-700">{pref.key}</span>
//                                             <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">{pref.type}</span>
//                                           </button>
//                                         ))}
//                                       </div>
//                                     )}
//                                   </div>
//                                 )}
//                               </div>
                              
//                               <button
//                                 onClick={() => removePreferenceQuestion(index)}
//                                 className="text-red-500 hover:text-red-700 transition-colors"
//                               >
//                                 <X className="w-5 h-5" />
//                               </button>
//                             </div>
//                           </div>

//                           <div className="mt-2">
//                             <input
//                               type="text"
//                               value={item.question}
//                               onChange={(e) => handlePreferenceQuestionChange(index, e.target.value)}
//                               placeholder="Enter your display question"
//                               className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white transition-all font-medium"
//                             />
//                           </div>
//                         </div>
//                       ))}
                      
//                       <button
//                         type="button"
//                         onClick={addPreferenceQuestion}
//                         className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 font-bold"
//                       >
//                         <Plus className="w-5 h-5" />
//                         Add New Question
//                       </button>
//                     </div>
//                   )}

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Static Statement on Downloadable QR (e.g., "Earn Points")
//                     </label>
//                     <input
//                       type="text"
//                       value={qrStatement}
//                       onChange={(e) => setQrStatement(e.target.value)}
//                       placeholder="Enter statement to show below QR"
//                       className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {qrType === "activity" && (
//                 <div className="mt-8 pt-8 border-t border-gray-100">
//                   <h2 className="text-xl font-bold text-[#313166] mb-6 flex items-center gap-2">
//                     3. Select Activity Details
//                   </h2>
                  
//                   <div className="space-y-6">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-3">Activity Category</label>
//                       <div className="flex flex-wrap gap-3">
//                         {["quiz", "spinwheel", "scratchcard"].map((type) => (
//                           <button
//                             key={type}
//                             onClick={() => {
//                               setActivityType(type);
//                               setSelectedActivityId("");
//                             }}
//                             className={`px-6 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
//                               activityType === type 
//                               ? "bg-[#313166] border-[#313166] text-white" 
//                               : "border-gray-100 text-gray-600 hover:border-gray-200"
//                             }`}
//                           >
//                             {type.charAt(0).toUpperCase() + type.slice(1)}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-3">Choose {activityType}</label>
//                       <select
//                         value={selectedActivityId}
//                         onChange={(e) => setSelectedActivityId(e.target.value)}
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
//                       >
//                         <option value="">Select an activity</option>
//                         {activities[activityType].map((act) => (
//                           <option key={act._id} value={act._id}>
//                             {act.name || act.campaignName || "Untitled Activity"}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="mt-8 pt-8 border-t border-gray-100">
//                 <h2 className="text-xl font-bold text-[#313166] mb-6 flex items-center gap-2">
//                   4. QR Styling & Branding
//                 </h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Campaign Branding Name
//                       </label>
//                       <input
//                         type="text"
//                         value={brandingName}
//                         onChange={(e) => setBrandingName(e.target.value)}
//                         placeholder="Enter brand name"
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Logo Placement
//                       </label>
//                       <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl">
//                         <button
//                           onClick={() => setLogoPlacement("top")}
//                           className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
//                             logoPlacement === "top" 
//                             ? "bg-white text-purple-600 shadow-sm" 
//                             : "text-gray-400 hover:text-gray-600"
//                           }`}
//                         >
//                           At Top
//                         </button>
//                         <button
//                           onClick={() => setLogoPlacement("inside")}
//                           className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
//                             logoPlacement === "inside" 
//                             ? "bg-white text-purple-600 shadow-sm" 
//                             : "text-gray-400 hover:text-gray-600"
//                           }`}
//                         >
//                           Inside QR
//                         </button>
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           QR Color
//                         </label>
//                         <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
//                           <input
//                             type="color"
//                             value={fgColor}
//                             onChange={(e) => setFgColor(e.target.value)}
//                             className="w-10 h-10 rounded-lg cursor-pointer border-none"
//                           />
//                           <span className="text-xs font-mono uppercase">{fgColor}</span>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Background
//                         </label>
//                         <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
//                           <input
//                             type="color"
//                             value={bgColor}
//                             onChange={(e) => setBgColor(e.target.value)}
//                             className="w-10 h-10 rounded-lg cursor-pointer border-none"
//                           />
//                           <span className="text-xs font-mono uppercase">{bgColor}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Upload Logo
//                       </label>
//                       <div className="flex items-center gap-4">
//                         <div className="flex-1">
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleLogoUpload}
//                             className="hidden"
//                             id="logo-upload"
//                           />
//                           <label
//                             htmlFor="logo-upload"
//                             className="flex items-center justify-center px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-all text-gray-500 font-medium gap-2"
//                           >
//                             <Plus className="w-5 h-5" />
//                             {logo ? "Change Logo" : "Choose File"}
//                           </label>
//                         </div>
//                         {logo && (
//                           <button
//                             onClick={() => setLogo(null)}
//                             className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
//                           >
//                             <X className="w-5 h-5" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                     {logo && (
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-xs font-semibold text-gray-500 mb-1">
//                             Logo Size ({logoSize}px)
//                           </label>
//                           <input
//                             type="range"
//                             min="20"
//                             max="50"
//                             value={logoSize}
//                             onChange={(e) => setLogoSize(parseInt(e.target.value))}
//                             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-xs font-semibold text-gray-500 mb-1">
//                             Logo Opacity ({logoOpacity})
//                           </label>
//                           <input
//                             type="range"
//                             min="0"
//                             max="1"
//                             step="0.1"
//                             value={logoOpacity}
//                             onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
//                             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-8 pt-8 border-t border-gray-100">
//                 <h2 className="text-xl font-bold text-[#313166] mb-6 flex items-center gap-2">
//                   5. Save & Manage Dynamic QR
//                 </h2>
                
//                 <div className="space-y-4">
//                   {savedQRs.length > 0 && (
//                     <div className="space-y-4">
//                       <div className="flex items-center justify-between">
//                         <label className="block text-sm font-semibold text-gray-700">Your Saved QRs</label>
//                         <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{savedQRs.length} QRs</span>
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
//                         {/* Create New Card */}
//                         <div 
//                           onClick={() => {
//                             setSelectedDynamicQR(null);
//                             setIsDynamic(false);
//                             setQrName("");
//                             setBrandingName("");
//                             setLogo(null);
//                             setLogoPlacement("top");
//                             setQrStatement("");
//                             setIncludePreferences(false);
//                             setSelectedPreferences([]);
//                           }}
//                           className={`group p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-3 ${
//                             !selectedDynamicQR 
//                             ? "border-purple-500 bg-purple-50" 
//                             : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
//                           }`}
//                         >
//                           <div className={`p-2 rounded-xl ${
//                             !selectedDynamicQR ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-500"
//                           }`}>
//                             <Plus className="w-5 h-5" />
//                           </div>
//                           <span className={`font-bold text-sm ${!selectedDynamicQR ? "text-purple-900" : "text-gray-500"}`}>Create New QR</span>
//                         </div>

//                         {savedQRs.map((qr) => (
//                           <div 
//                             key={qr._id}
//                             onClick={() => handleSelectDynamicQR(qr)}
//                             className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
//                               selectedDynamicQR?._id === qr._id 
//                               ? "border-purple-500 bg-purple-50" 
//                               : "border-gray-100 bg-white hover:border-purple-200"
//                             }`}
//                           >
//                             <div className="flex items-start gap-4">
//                               <div className={`p-1 rounded-lg bg-white border ${
//                                 selectedDynamicQR?._id === qr._id ? "border-purple-300" : "border-gray-200"
//                               }`}>
//                                 <QRCodeSVG 
//                                   value={`${landingPageBaseUrl}/q/${qr.qrId}`}
//                                   size={60}
//                                   level="L"
//                                   includeMargin={false}
//                                   fgColor={qr.fgColor || "#000000"}
//                                   bgColor={qr.bgColor || "#ffffff"}
//                                 />
//                               </div>
//                               <div className="flex-1 min-w-0">
//                                 <h4 className={`font-bold text-sm truncate ${selectedDynamicQR?._id === qr._id ? "text-purple-900" : "text-gray-700"}`}>
//                                   {qr.name}
//                                 </h4>
//                                 <div className="flex flex-col gap-1 mt-1">
//                                   <div className="flex items-center gap-2">
//                                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
//                                       qr.type === "registration" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"
//                                     }`}>
//                                       {qr.type}
//                                     </span>
//                                     {qr.activityType !== "none" && (
//                                       <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase">
//                                         {qr.activityType}
//                                       </span>
//                                     )}
//                                   </div>
//                                   <p className="text-[10px] text-gray-400 truncate">ID: {qr.qrId}</p>
//                                 </div>
//                               </div>
//                               {selectedDynamicQR?._id === qr._id && (
//                                 <div className="absolute top-2 right-2">
//                                   <div className="bg-purple-500 text-white p-1 rounded-full shadow-sm">
//                                     <Check className="w-3 h-3" />
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   <div className="pt-4 border-t border-gray-100">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       {selectedDynamicQR ? "Update QR Name" : "Save as Dynamic QR"}
//                     </label>
//                     <div className="flex gap-3">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         value={qrName}
//                         onChange={(e) => setQrName(e.target.value)}
//                         placeholder="Enter QR name to save"
//                         className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all"
//                       />
//                     </div>
//                     <button
//                       onClick={handleSaveQR}
//                       disabled={loading}
//                       className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
//                     >
//                       {selectedDynamicQR ? "Update QR" : "Save as Dynamic"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//            <div className="lg:col-span-1">
//             <div className="sticky top-8 bg-white rounded-[32px] border border-gray-100 shadow-lg p-6 md:p-8 flex flex-col items-center">
//               <h2 className="text-xl font-bold text-[#313166] mb-8 w-full">QR Preview</h2>
              
//               <div className="bg-[#F8F9FF] p-8 rounded-[32px] mb-8 border border-[#EEF1FF] flex flex-col items-center justify-center">
//                 {generatedUrl ? (
//                   <>
//                     {(brandingName || (logo && logoPlacement === "top")) && (
//                       <div className="mb-4 flex items-center justify-center gap-3 max-w-[250px]">
//                         {logo && logoPlacement === "top" && (
//                           <img 
//                             src={logo} 
//                             alt="Logo" 
//                             className="h-10 w-10 object-contain rounded-lg"
//                             style={{ opacity: logoOpacity }}
//                           />
//                         )}
//                         {brandingName && (
//                           <p className="text-[#313166] font-bold text-xl text-center break-words">
//                             {brandingName}
//                           </p>
//                         )}
//                       </div>
//                     )}
//                     <QRCodeSVG 
//                       id="qr-code-svg"
//                       value={generatedUrl} 
//                       size={200}
//                       level="H"
//                       includeMargin={true}
//                       fgColor={fgColor}
//                       bgColor={bgColor}
//                       imageSettings={logo && logoPlacement === "inside" ? {
//                         src: logo,
//                         x: undefined,
//                         y: undefined,
//                         height: logoSize,
//                         width: logoSize,
//                         excavate: true,
//                         opacity: logoOpacity
//                       } : undefined}
//                     />
//                     {qrStatement && (
//                       <p className="mt-4 text-[#313166] font-bold text-lg text-center break-words max-w-[200px]">
//                         {qrStatement}
//                       </p>
//                     )}
//                   </>
//                 ) : (
//                   <div className="w-[200px] h-[200px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-center p-4">
//                     Complete setup to see preview
//                   </div>
//                 )}
//               </div>

//               <div className="w-full space-y-4">
//                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
//                   <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target URL</p>
//                   <p className="text-sm font-medium text-[#313166] break-all line-clamp-2">
//                     {generatedUrl || "---"}
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <button
//                     disabled={!generatedUrl}
//                     onClick={copyToClipboard}
//                     className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition-all gap-1 disabled:opacity-50"
//                   >
//                     <Copy className="w-5 h-5 text-gray-600" />
//                     <span className="text-xs font-bold text-gray-600">Copy Link</span>
//                   </button>

//                   <a
//                     href={generatedUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition-all gap-1 ${!generatedUrl ? "pointer-events-none opacity-50" : ""}`}
//                   >
//                     <ExternalLink className="w-5 h-5 text-gray-600" />
//                     <span className="text-xs font-bold text-gray-600">Test Link</span>
//                   </a>
//                 </div>

//                 <button
//                   disabled={!generatedUrl}
//                   onClick={downloadQR}
//                   className="w-full py-4 rounded-2xl bg-[#313166] hover:bg-[#272757] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/10 disabled:opacity-50"
//                 >
//                   <Download className="w-5 h-5" />
//                   Download PNG
//                 </button>
//               </div>

//               <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
//                 <Info className="w-5 h-5 text-blue-500 shrink-0" />
//                 <p className="text-xs text-blue-700 leading-relaxed">
//                   When customers scan this QR, they will be asked to register with WhatsApp OTP before {qrType === "registration" ? "completing registration" : "playing the game"}.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     </div>
//   </div>
//   );
// };

// export default QRGenerator;

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { 
  QrCode, 
  UserPlus, 
  Gamepad2, 
  Download, 
  Copy, 
  ExternalLink,
  ChevronRight,
  Info,
  Loader2,
  FileSpreadsheet,
  Plus,
  X,
  ChevronDown,
  Check,
  ShieldCheck,
  LayoutDashboard,
  Database
} from "lucide-react";
import api from "../api/apiconfig";
import showToast from "../utils/ToastNotification";

const QRGenerator = () => {
  const { auth } = useAuth();
  const [qrType, setQrType] = useState("registration"); // registration | activity
  const [activityType, setActivityType] = useState("quiz"); // quiz | spinwheel | scratchcard
  const [activities, setActivities] = useState({
    quiz: [],
    spinwheel: [],
    scratchcard: []
  });
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [loading, setLoading] = useState(false);
  const [retailerId, setRetailerId] = useState(localStorage.getItem("retailerId") || "");
  const [includePreferences, setIncludePreferences] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]); // [{key, question, section}]
  const [categorizedPreferences, setCategorizedPreferences] = useState({
    additionalData: [],
    advancedDetails: [],
    advancedPrivacyDetails: []
  });
  const [isPreferenceDropdownOpen, setIsPreferenceDropdownOpen] = useState([]);
  const [qrStatement, setQrStatement] = useState("");
  const [isDynamic, setIsDynamic] = useState(false);
  const [qrName, setQrName] = useState("");
  const [savedQRs, setSavedQRs] = useState([]);
  const [selectedDynamicQR, setSelectedDynamicQR] = useState(null);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [brandingName, setBrandingName] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoSize, setLogoSize] = useState(40);
  const [logoPlacement, setLogoPlacement] = useState("top"); // top | inside

  // Set default branding and logo from retailer info
  useEffect(() => {
    if (auth?.user && !selectedDynamicQR) {
      if (!brandingName) setBrandingName(auth.user.storeName || "");
      if (!logo) setLogo(auth.user.storeImage || null);
    }
  }, [auth, selectedDynamicQR]);

  const landingPageBaseUrl = "https://vadik.ai"; // Adjust as needed

  useEffect(() => {
    fetchActivities();
    fetchSavedQRs();
    fetchAvailablePreferences();
  }, []);

  const fetchAvailablePreferences = async () => {
    try {
      const response = await api.get(`/api/customer-preferences/${retailerId}`);
      if (response.data) {
        setCategorizedPreferences({
          additionalData: response.data.additionalData || [],
          advancedDetails: response.data.advancedDetails || [],
          advancedPrivacyDetails: response.data.advancedPrivacyDetails || []
        });
      }
    } catch (error) {
      console.error("Error fetching available preferences:", error);
    }
  };

  const fetchSavedQRs = async () => {
    try {
      const response = await api.get("/api/dynamic-qr/my-qrs");
      if (response.data.status) {
        setSavedQRs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching saved QRs:", error);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Logo size should be less than 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveQR = async () => {
    if (!qrName) {
      showToast("Please enter a name for this QR", "error");
      return;
    }

    if (includePreferences) {
      const invalid = selectedPreferences.some(p => !p.key || !p.question);
      if (invalid) {
        showToast("Please complete all preference fields and questions", "error");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: qrName,
        type: qrType,
        activityType: qrType === "activity" ? activityType : "none",
        activityId: qrType === "activity" ? selectedActivityId : "",
        includePreferences,
        selectedPreferences: includePreferences ? selectedPreferences : [],
        qrStatement,
        fgColor,
        bgColor,
        brandingName,
        logo,
        logoSize,
        logoOpacity,
        logoPlacement
      };

      let response;
      if (selectedDynamicQR) {
        response = await api.patch(`/api/dynamic-qr/${selectedDynamicQR._id}`, payload);
        showToast("QR updated successfully!", "success");
      } else {
        response = await api.post("/api/dynamic-qr", payload);
        showToast("QR created successfully!", "success");
      }

      if (response.data.status) {
        fetchSavedQRs();
        setSelectedDynamicQR(response.data.data);
        setIsDynamic(true);
      }
    } catch (error) {
      showToast("Failed to save QR", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDynamicQR = (qr) => {
    setSelectedDynamicQR(qr);
    setQrName(qr.name);
    setQrType(qr.type);
    if (qr.type === "activity") {
      setActivityType(qr.activityType);
      setSelectedActivityId(qr.activityId);
    }
    setIncludePreferences(qr.includePreferences);
    setSelectedPreferences(qr.selectedPreferences || []);
    setQrStatement(qr.qrStatement || "");
    setFgColor(qr.fgColor || "#000000");
    setBgColor(qr.bgColor || "#ffffff");
    setBrandingName(qr.brandingName || "");
    setLogo(qr.logo || null);
    setLogoSize(Math.min(qr.logoSize || 40, 50));
    setLogoOpacity(qr.logoOpacity || 1);
    setLogoPlacement(qr.logoPlacement || "top");
    setIsDynamic(true);
    setIsPreferenceDropdownOpen(new Array(qr.selectedPreferences?.length || 0).fill(false));
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const [quizRes, spinRes, scratchRes] = await Promise.all([
        api.get("/api/quiz?fully=true"),
        api.get("/api/spinWheels/spinWheel/all?fully=true"),
        api.get("/api/scratchCards/scratchCard/all?fully=true")
      ]);

      setActivities({
        quiz: quizRes.data.docs || [],
        spinwheel: spinRes.data.data || [],
        scratchcard: scratchRes.data.data || []
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
      showToast("Failed to load activities", "error");
    } finally {
      setLoading(false);
    }
  };

  const addPreferenceQuestion = () => {
    setSelectedPreferences([...selectedPreferences, { key: "", question: "", section: "" }]);
    setIsPreferenceDropdownOpen([...isPreferenceDropdownOpen, false]);
  };

  const removePreferenceQuestion = (index) => {
    const updated = selectedPreferences.filter((_, i) => i !== index);
    setSelectedPreferences(updated);
    const updatedDropdowns = isPreferenceDropdownOpen.filter((_, i) => i !== index);
    setIsPreferenceDropdownOpen(updatedDropdowns);
  };

  const togglePreferenceDropdown = (index) => {
    const updated = [...isPreferenceDropdownOpen];
    updated[index] = !updated[index];
    setIsPreferenceDropdownOpen(updated);
  };

  const handlePreferenceKeyChange = (index, key, section) => {
    const sectionFields = categorizedPreferences[section];
    const selectedPref = sectionFields.find(p => p.key === key);
    
    if (selectedPref) {
      const updated = [...selectedPreferences];
      updated[index] = {
        key: selectedPref.key,
        section: section,
        question: selectedPref.type === "date" 
          ? `When is your ${selectedPref.key}?` 
          : `What is your ${selectedPref.key}?`
      };
      setSelectedPreferences(updated);
    }
  };

  const handlePreferenceQuestionChange = (index, value) => {
    const updated = [...selectedPreferences];
    updated[index].question = value;
    setSelectedPreferences(updated);
  };

  const getGeneratedUrl = () => {
    if (isDynamic && selectedDynamicQR) {
      return `${landingPageBaseUrl}/q/${selectedDynamicQR.qrId}`;
    }

    let baseUrl = "";
    if (qrType === "registration") {
      baseUrl = `${landingPageBaseUrl}/customer-registration/${retailerId}`;
    } else {
      if (!selectedActivityId) return "";
      baseUrl = `${landingPageBaseUrl}/customer-registration/${retailerId}?activityType=${activityType}&activityId=${selectedActivityId}`;
    }

    if (includePreferences) {
      baseUrl += (baseUrl.includes("?") ? "&" : "?") + "includePreferences=true";
      if (selectedPreferences.length > 0) {
        baseUrl += `&prefFields=${encodeURIComponent(JSON.stringify(selectedPreferences))}`;
      }
    }
    return baseUrl;
  };

  const generatedUrl = getGeneratedUrl();

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const padding = 40;
      const statementHeight = qrStatement ? 60 : 0;
      const brandingHeight = (brandingName || (logo && logoPlacement === "top")) ? 80 : 0;
      
      canvas.width = img.width + (padding * 2);
      canvas.height = img.height + (padding * 2) + statementHeight + brandingHeight;
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (brandingHeight > 0) {
        ctx.fillStyle = fgColor === "#ffffff" ? "#000000" : fgColor;
        ctx.font = "bold 28px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        
        if (logo && logoPlacement === "top") {
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            const logoDispSize = 40;
            const gap = 15;
            const textWidth = ctx.measureText(brandingName).width;
            const totalWidth = brandingName ? (logoDispSize + gap + textWidth) : logoDispSize;
            const startX = (canvas.width - totalWidth) / 2;
            
            ctx.globalAlpha = logoOpacity;
            ctx.drawImage(logoImg, startX, padding + 10, logoDispSize, logoDispSize);
            ctx.globalAlpha = 1;
            
            if (brandingName) {
              ctx.textAlign = "left";
              ctx.fillText(brandingName, startX + logoDispSize + gap, padding + 40);
            }
            
            // Continue drawing rest after logo loads
            drawRest();
          };
          logoImg.src = logo;
        } else if (brandingName) {
          ctx.fillText(brandingName, canvas.width / 2, padding + 40);
          drawRest();
        } else {
          drawRest();
        }
      } else {
        drawRest();
      }

      function drawRest() {
        ctx.drawImage(img, padding, padding + brandingHeight);
        
        if (qrStatement) {
          ctx.fillStyle = fgColor === "#ffffff" ? "#000000" : fgColor;
          ctx.font = "bold 24px Inter, system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(qrStatement, canvas.width / 2, img.height + padding + brandingHeight + 40);
        }
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${qrType}_${new Date().getTime()}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    showToast("URL copied to clipboard!", "success");
  };

  const handleQrTypeChange = (type) => {
    setQrType(type);
    if (type === "activity") {
      setIncludePreferences(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center md:justify-start gap-3">
            <div className="p-2 bg-indigo-100 rounded-2xl">
              <QrCode className="w-7 h-7 text-indigo-600" />
            </div>
            QR Module
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl">
            Generate customizable QR codes for customer registration and interactive activities.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1: QR Type Selection */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                Select QR Type
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleQrTypeChange("registration")}
                  className={`group flex flex-col items-start p-4 rounded-xl border transition-all ${
                    qrType === "registration" 
                    ? "border-indigo-300 bg-indigo-50/30 shadow-sm" 
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`p-2 rounded-xl mb-3 ${
                    qrType === "registration" ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:text-gray-500"
                  }`}>
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${qrType === "registration" ? "text-indigo-700" : "text-gray-700"}`}>Customer Registration</span>
                  <span className="text-xs text-gray-400 mt-1">Direct customers to your sign-up page</span>
                </button>

                <button
                  onClick={() => handleQrTypeChange("activity")}
                  className={`group flex flex-col items-start p-4 rounded-xl border transition-all ${
                    qrType === "activity" 
                    ? "border-rose-300 bg-rose-50/30 shadow-sm" 
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`p-2 rounded-xl mb-3 ${
                    qrType === "activity" ? "bg-rose-100 text-rose-500" : "bg-gray-100 text-gray-400 group-hover:text-gray-500"
                  }`}>
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className={`font-semibold ${qrType === "activity" ? "text-rose-600" : "text-gray-700"}`}>Customer Activity</span>
                  <span className="text-xs text-gray-400 mt-1">Redirect to games or quizzes</span>
                </button>
              </div>
            </div>

            {/* Card 2: Customization Options */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                Customize Options
              </h2>
              
              <div className="space-y-5">
                {qrType === "registration" && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                    <input
                      type="checkbox"
                      id="includePreferences"
                      checked={includePreferences}
                      onChange={(e) => {
                        setIncludePreferences(e.target.checked);
                        if (e.target.checked && selectedPreferences.length === 0) {
                          addPreferenceQuestion();
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-500 focus:ring-indigo-400"
                    />
                    <label htmlFor="includePreferences" className="text-sm font-medium text-gray-700">
                      Include customer preference questions in form
                    </label>
                  </div>
                )}

                {qrType === "registration" && includePreferences && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-top-4">
                    {selectedPreferences.map((item, index) => (
                      <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 relative group shadow-sm">
                        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                          <h3 className="text-md font-semibold text-gray-700">
                            Question {index + 1}
                          </h3>
                          
                          <div className="flex items-center gap-3">
                            <div className="relative w-64">
                              <button
                                type="button"
                                onClick={() => togglePreferenceDropdown(index)}
                                className="flex items-center justify-between w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none text-sm"
                              >
                                <span className="truncate text-gray-600">
                                  {item.key ? `${item.key} (${item.section.replace(/([A-Z])/g, ' $1').trim()})` : "Select Field"}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </button>

                              {isPreferenceDropdownOpen[index] && (
                                <div className="absolute top-full right-0 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                                  {categorizedPreferences.additionalData.length > 0 && (
                                    <div className="p-2">
                                      <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <Database className="w-3 h-3" /> Additional Data
                                      </div>
                                      {categorizedPreferences.additionalData.map((pref) => (
                                        <button
                                          key={pref.key}
                                          type="button"
                                          onClick={() => {
                                            handlePreferenceKeyChange(index, pref.key, "additionalData");
                                            togglePreferenceDropdown(index);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors rounded-lg flex items-center justify-between"
                                        >
                                          <span className="text-gray-700">{pref.key}</span>
                                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">{pref.type}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {categorizedPreferences.advancedDetails.length > 0 && (
                                    <div className="p-2 bg-gray-50/50">
                                      <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <LayoutDashboard className="w-3 h-3" /> Advanced Details
                                      </div>
                                      {categorizedPreferences.advancedDetails.map((pref) => (
                                        <button
                                          key={pref.key}
                                          type="button"
                                          onClick={() => {
                                            handlePreferenceKeyChange(index, pref.key, "advancedDetails");
                                            togglePreferenceDropdown(index);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors rounded-lg flex items-center justify-between"
                                        >
                                          <span className="text-gray-700">{pref.key}</span>
                                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">{pref.type}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {categorizedPreferences.advancedPrivacyDetails.length > 0 && (
                                    <div className="p-2">
                                      <div className="flex items-center gap-2 px-2 py-1 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <ShieldCheck className="w-3 h-3" /> Privacy Details
                                      </div>
                                      {categorizedPreferences.advancedPrivacyDetails.map((pref) => (
                                        <button
                                          key={pref.key}
                                          type="button"
                                          onClick={() => {
                                            handlePreferenceKeyChange(index, pref.key, "advancedPrivacyDetails");
                                            togglePreferenceDropdown(index);
                                          }}
                                          className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors rounded-lg flex items-center justify-between"
                                        >
                                          <span className="text-gray-700">{pref.key}</span>
                                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded uppercase">{pref.type}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => removePreferenceQuestion(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => handlePreferenceQuestionChange(index, e.target.value)}
                            placeholder="Enter your display question"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-gray-700"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addPreferenceQuestion}
                      className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Question
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Static Statement on QR Image
                  </label>
                  <input
                    type="text"
                    value={qrStatement}
                    onChange={(e) => setQrStatement(e.target.value)}
                    placeholder="E.g., Scan to earn rewards"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Activity Details (conditional) */}
            {qrType === "activity" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all">
                <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">3</span>
                  Activity Details
                </h2>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Activity Category</label>
                    <div className="flex flex-wrap gap-2">
                      {["quiz", "spinwheel", "scratchcard"].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setActivityType(type);
                            setSelectedActivityId("");
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activityType === type 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose {activityType}</label>
                    <select
                      value={selectedActivityId}
                      onChange={(e) => setSelectedActivityId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all text-gray-700"
                    >
                      <option value="">Select an activity</option>
                      {activities[activityType].map((act) => (
                        <option key={act._id} value={act._id}>
                          {act.name || act.campaignName || "Untitled Activity"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Card 4: Styling & Branding */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">4</span>
                Styling & Branding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branding Name
                    </label>
                    <input
                      type="text"
                      value={brandingName}
                      onChange={(e) => setBrandingName(e.target.value)}
                      placeholder="Your brand name"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo Placement
                    </label>
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                      <button
                        onClick={() => setLogoPlacement("top")}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                          logoPlacement === "top" 
                          ? "bg-white text-indigo-600 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        At Top
                      </button>
                      <button
                        onClick={() => setLogoPlacement("inside")}
                        className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                          logoPlacement === "inside" 
                          ? "bg-white text-indigo-600 shadow-sm" 
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Inside QR
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        QR Color
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono text-gray-600">{fgColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Background
                      </label>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono text-gray-600">{bgColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex items-center justify-center px-4 py-2.5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-gray-500 text-sm font-medium gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {logo ? "Change Logo" : "Choose File"}
                        </label>
                      </div>
                      {logo && (
                        <button
                          onClick={() => setLogo(null)}
                          className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {logo && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Size ({logoSize}px)
                        </label>
                        <input
                          type="range"
                          min="20"
                          max="50"
                          value={logoSize}
                          onChange={(e) => setLogoSize(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Opacity ({logoOpacity})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={logoOpacity}
                          onChange={(e) => setLogoOpacity(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 5: Save & Manage */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 transition-all">
              <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">5</span>
                Save & Manage
              </h2>
              
              <div className="space-y-5">
                {savedQRs.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">Your Saved QRs</label>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{savedQRs.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                      <div 
                        onClick={() => {
                          setSelectedDynamicQR(null);
                          setIsDynamic(false);
                          setQrName("");
                          setBrandingName("");
                          setLogo(null);
                          setLogoPlacement("top");
                          setQrStatement("");
                          setIncludePreferences(false);
                          setSelectedPreferences([]);
                        }}
                        className={`group p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          !selectedDynamicQR 
                          ? "border-indigo-300 bg-indigo-50/30" 
                          : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${
                          !selectedDynamicQR ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500"
                        }`}>
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-medium ${!selectedDynamicQR ? "text-indigo-700" : "text-gray-500"}`}>Create New</span>
                      </div>

                      {savedQRs.map((qr) => (
                        <div 
                          key={qr._id}
                          onClick={() => handleSelectDynamicQR(qr)}
                          className={`group relative p-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-sm ${
                            selectedDynamicQR?._id === qr._id 
                            ? "border-indigo-300 bg-indigo-50/30" 
                            : "border-gray-100 bg-white hover:border-indigo-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1 rounded-lg bg-white border border-gray-100 shadow-sm">
                              <QRCodeSVG 
                                value={`${landingPageBaseUrl}/q/${qr.qrId}`}
                                size={48}
                                level="L"
                                includeMargin={false}
                                fgColor={qr.fgColor || "#000000"}
                                bgColor={qr.bgColor || "#ffffff"}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm truncate ${selectedDynamicQR?._id === qr._id ? "text-indigo-700" : "text-gray-700"}`}>
                                {qr.name}
                              </h4>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                                  qr.type === "registration" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-600"
                                }`}>
                                  {qr.type}
                                </span>
                                {qr.activityType !== "none" && (
                                  <span className="text-[9px] font-medium px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {qr.activityType}
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-gray-400 truncate mt-1">{qr.qrId}</p>
                            </div>
                            {selectedDynamicQR?._id === qr._id && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-indigo-500 text-white p-0.5 rounded-full shadow-sm">
                                  <Check className="w-3 h-3" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedDynamicQR ? "Update QR Name" : "Save as Dynamic QR"}
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={qrName}
                        onChange={(e) => setQrName(e.target.value)}
                        placeholder="Enter a name for this QR"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={handleSaveQR}
                      disabled={loading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {selectedDynamicQR ? "Update" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-6 w-full text-center">QR Preview</h2>
              
              <div className="bg-gray-50/50 p-6 rounded-2xl mb-6 w-full flex flex-col items-center justify-center border border-gray-100">
                {generatedUrl ? (
                  <>
                    {(brandingName || (logo && logoPlacement === "top")) && (
                      <div className="mb-4 flex items-center justify-center gap-3 max-w-[220px]">
                        {logo && logoPlacement === "top" && (
                          <img 
                            src={logo} 
                            alt="Brand Logo" 
                            className="h-8 w-8 object-contain rounded-md"
                            style={{ opacity: logoOpacity }}
                          />
                        )}
                        {brandingName && (
                          <p className="text-gray-800 font-semibold text-base text-center break-words">
                            {brandingName}
                          </p>
                        )}
                      </div>
                    )}
                    <QRCodeSVG 
                      id="qr-code-svg"
                      value={generatedUrl} 
                      size={180}
                      level="H"
                      includeMargin={true}
                      fgColor={fgColor}
                      bgColor={bgColor}
                      imageSettings={logo && logoPlacement === "inside" ? {
                        src: logo,
                        x: undefined,
                        y: undefined,
                        height: logoSize,
                        width: logoSize,
                        excavate: true,
                        opacity: logoOpacity
                      } : undefined}
                    />
                    {qrStatement && (
                      <p className="mt-4 text-gray-700 font-medium text-sm text-center break-words max-w-[180px]">
                        {qrStatement}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="w-[180px] h-[180px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-center p-4 text-sm">
                    Complete setup to see preview
                  </div>
                )}
              </div>

              <div className="w-full space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Target URL</p>
                  <p className="text-xs font-medium text-gray-600 break-all line-clamp-2">
                    {generatedUrl || "---"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={!generatedUrl}
                    onClick={copyToClipboard}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all gap-1 disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Copy Link</span>
                  </button>

                  <a
                    href={generatedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-all gap-1 ${!generatedUrl ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Test Link</span>
                  </a>
                </div>

                <button
                  disabled={!generatedUrl}
                  onClick={downloadQR}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>
              </div>

              <div className="mt-6 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  When scanned, customers will register via WhatsApp OTP before {qrType === "registration" ? "registration" : "playing"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default QRGenerator;
