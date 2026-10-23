// import React, { useState } from "react";
// import { FiX } from "react-icons/fi";
// import { Sparkles, Loader2 } from "lucide-react";
// import api from "../../api/apiconfig";

// export default function AiImageGeneratorModal({ onClose, onSelect }) {
//   const [prompt, setPrompt] = useState("");
//   const [aspectRatio, setAspectRatio] = useState("1:1");
//   const [useBrandKit, setUseBrandKit] = useState(true);
//   const [generating, setGenerating] = useState(false);

//   const handleGenerate = async (saveToLibrary) => {
//     if (!prompt.trim()) return alert("Please enter an image description");

//     try {
//       setGenerating(true);
//       const res = await api.post("/api/ai/generate-image", {
//         prompt,
//         aspectRatio,
//         useBrandKit,
//         saveToLibrary
//       });

//       if (res.data?.status === "success") {
//         onSelect(res.data.data.s3Url);
//         onClose();
//       }
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to generate image");
//     } finally {
//       setGenerating(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
//       <div className="bg-white rounded-2xl w-full max-w-lg border border-[#E7EAF7] shadow-2xl p-6 relative flex flex-col space-y-5">
        
//         {/* Header */}
//         <div className="flex justify-between items-center pb-3 border-b border-[#E7EAF7]">
//           <div className="flex items-center gap-2 text-[#313166]">
//             <Sparkles className="h-5 w-5 text-[#CB376D]" />
//             <h3 className="text-base font-bold">Generate AI Image</h3>
//           </div>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//             <FiX size={20} />
//           </button>
//         </div>

//         {/* Prompt Input */}
//         <div>
//           <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
//             Describe Your Image
//           </label>
//           <textarea
//             rows={3}
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="e.g., Seasonal offer banner with festive decorations and gift boxes..."
//             className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#313166]"
//           />
//           <p className="text-[10px] text-gray-400 mt-1">
//             ✨ English correction & prompt optimization models run automatically.
//           </p>
//         </div>

//         {/* Aspect Ratio */}
//         <div>
//           <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Aspect Ratio</label>
//           <div className="grid grid-cols-4 gap-2">
//             {["1:1", "4:5", "9:16", "16:9"].map((ratio) => (
//               <button
//                 key={ratio}
//                 type="button"
//                 onClick={() => setAspectRatio(ratio)}
//                 className={`py-2 text-xs font-bold rounded-xl border transition-all ${
//                   aspectRatio === ratio
//                     ? "bg-[#313166] text-white border-[#313166]"
//                     : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
//                 }`}
//               >
//                 {ratio}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Brand Kit Switch */}
//         <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
//           <span className="text-xs font-semibold text-gray-700">Apply Business Brand Kit</span>
//           <input
//             type="checkbox"
//             checked={useBrandKit}
//             onChange={(e) => setUseBrandKit(e.target.checked)}
//             className="w-4 h-4 text-[#313166] rounded focus:ring-[#313166]"
//           />
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-2 pt-2">
//           <button
//             type="button"
//             disabled={generating}
//             onClick={() => handleGenerate(true)}
//             className="flex-1 py-3 bg-[#313166] text-white rounded-xl text-xs font-bold hover:bg-[#272757] transition flex items-center justify-center gap-2 shadow-sm"
//           >
//             {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
//             Use & Save to Media Library
//           </button>

//           <button
//             type="button"
//             disabled={generating}
//             onClick={() => handleGenerate(false)}
//             className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
//           >
//             Use Temporarily
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }







// import React, { useState } from "react";
// import { Sparkles, X, RefreshCw, BookmarkPlus, Check, Wand2, Image as ImageIcon } from "lucide-react";
// import api from "../../api/apiconfig";
// import { toast } from "react-toastify";

// const AiImageGeneratorModal = ({ onClose, onSelect }) => {
//   const [prompt, setPrompt] = useState("");
//   const [aspectRatio, setAspectRatio] = useState("1:1");
//   const [useBrandKit, setUseBrandKit] = useState(true);
  
//   const [loading, setLoading] = useState(false);
//   const [loadingStep, setLoadingStep] = useState(0);
//   const [generatedResult, setGeneratedResult] = useState(null); // { s3Url, enhancedPrompt }
//   const [savingToLibrary, setSavingToLibrary] = useState(false);
//   const [savedSuccess, setSavedSuccess] = useState(false);

//   const handleGenerate = async () => {
//     if (!prompt.trim()) {
//       toast.error("Please enter a description for your image");
//       return;
//     }

//     setLoading(true);
//     setLoadingStep(1); // "Optimizing prompt with GPT-4o-mini..."
//     setGeneratedResult(null);
//     setSavedSuccess(false);

//     try {
//       setTimeout(() => setLoadingStep(2), 1500); // "Generating high-resolution visual..."

//       const response = await api.post("/api/ai/generate-image", {
//         prompt,
//         aspectRatio,
//         useBrandKit,
//         saveToLibrary: false // Separate explicit action
//       });

//       if (response.data?.status === "success") {
//         setGeneratedResult(response.data.data);
//       } else {
//         toast.error("Failed to generate image");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "AI Generation failed");
//     } finally {
//       setLoading(false);
//       setLoadingStep(0);
//     }
//   };

//   const handleSaveToLibrary = async () => {
//     if (!generatedResult?.s3Url) return;

//     setSavingToLibrary(true);
//     try {
//       // 1. Check if backend already auto-saved the image during generation
//       if (generatedResult?.savedToLibrary || generatedResult?.mediaId) {
//         setSavedSuccess(true);
//         toast.success("Image is already saved in your Media Library!");
//         return;
//       }

//       // 2. Fallback call to active media library route if not yet saved
//       const res = await api.post("/api/media-library", {
//         s3Url: generatedResult.s3Url,
//         fileName: generatedResult.fileName || `ai-${Date.now()}.png`,
//         mimeType: "image/png"
//       });

//       if (res.data?.status || res.data?.success) {
//         setSavedSuccess(true);
//         toast.success("Saved to Media Library!");
//       }
//     } catch (error) {
//       console.error("Save to Media Library Error:", error);
//       toast.error("Failed to save to Media Library");
//     } finally {
//       setSavingToLibrary(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
//       <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
//         {/* Modal Header */}
//         <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
//           <div className="flex items-center gap-2">
//             <div className="p-2 rounded-xl bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white shadow-md">
//               <Sparkles size={18} />
//             </div>
//             <div>
//               <h3 className="font-bold text-gray-900 text-base">Vadik AI Image Generator</h3>
//               <p className="text-xs text-gray-500">Transform prompts into WhatsApp-ready marketing visuals</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
//             <X size={20} />
//           </button>
//         </div>

//         {/* Modal Content */}
//         <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
//           {/* Form Inputs (Shown when not loading / or adjusting prompt) */}
//           {!generatedResult && !loading && (
//             <div className="space-y-4">
//               <div>
//                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
//                   Describe Your Visual
//                 </label>
//                 <textarea
//                   rows="3"
//                   className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D] outline-none transition-all font-medium"
//                   placeholder="e.g. Grand Diwali festive discount banner with glowing diyas, modern gift boxes, and gold sparkles..."
//                   value={prompt}
//                   onChange={(e) => setPrompt(e.target.value)}
//                 />
//               </div>

//               {/* Aspect Ratio Picker */}
//               <div>
//                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
//                   Aspect Ratio
//                 </label>
//                 <div className="grid grid-cols-4 gap-3">
//                   {[
//                     { label: "1:1 Square", val: "1:1" },
//                     { label: "4:5 Portrait", val: "4:5" },
//                     { label: "9:16 Story", val: "9:16" },
//                     { label: "16:9 Banner", val: "16:9" }
//                   ].map((ratio) => (
//                     <button
//                       key={ratio.val}
//                       type="button"
//                       onClick={() => setAspectRatio(ratio.val)}
//                       className={`p-3 rounded-xl border text-xs font-bold transition-all ${
//                         aspectRatio === ratio.val
//                           ? "border-[#CB376D] bg-[#CB376D]/5 text-[#CB376D] shadow-sm"
//                           : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
//                       }`}
//                     >
//                       {ratio.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Brand Kit Toggle */}
//               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
//                 <div className="flex items-center gap-2">
//                   <Wand2 size={16} className="text-[#CB376D]" />
//                   <span className="text-xs font-bold text-gray-800">Apply Business Brand Colors & Style</span>
//                 </div>
//                 <input
//                   type="checkbox"
//                   checked={useBrandKit}
//                   onChange={(e) => setUseBrandKit(e.target.checked)}
//                   className="w-4 h-4 accent-[#CB376D] rounded cursor-pointer"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Modern Animated Loading Screen */}
//           {loading && (
//             <div className="py-12 flex flex-col items-center justify-center space-y-6">
//               <div className="relative flex items-center justify-center">
//                 {/* Pulsing Outer Glow */}
//                 <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-[#CB376D] to-[#313166] opacity-30 animate-ping" />
//                 {/* Spinning Gradient Ring */}
//                 <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-[#CB376D] border-r-[#313166] animate-spin" />
//                 <Sparkles className="absolute text-[#CB376D] animate-pulse" size={28} />
//               </div>

//               <div className="text-center space-y-2">
//                 <h4 className="font-bold text-gray-900 text-base animate-pulse">
//                   {loadingStep === 1 ? "Optimizing Prompt & Grammar..." : "Rendering Visual with DALL-E 3..."}
//                 </h4>
//                 <p className="text-xs text-gray-500 max-w-xs">
//                   This takes ~4–6 seconds. We are reserving credits and formatting the visual for high conversion.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Generated Image Preview & Separate Actions */}
//           {generatedResult && !loading && (
//             <div className="space-y-4 animate-in zoom-in-95 duration-200">
//               <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 max-h-[350px] flex items-center justify-center group">
//                 <img
//                   src={generatedResult.s3Url}
//                   alt="AI Preview"
//                   className="max-h-[350px] w-full object-contain"
//                 />
//               </div>

//               {generatedResult.enhancedPrompt && (
//                 <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
//                   <span className="font-bold text-gray-800">Enhanced Prompt: </span>
//                   {generatedResult.enhancedPrompt}
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
//                 {/* Button 1: Save to Media Library */}
//                 <button
//                   type="button"
//                   onClick={handleSaveToLibrary}
//                   disabled={savingToLibrary || savedSuccess}
//                   className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
//                     savedSuccess
//                       ? "bg-green-50 border-green-200 text-green-700"
//                       : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
//                   }`}
//                 >
//                   {savedSuccess ? <Check size={16} /> : <BookmarkPlus size={16} />}
//                   {savedSuccess ? "Saved to Library" : savingToLibrary ? "Saving..." : "Save to Library"}
//                 </button>

//                 {/* Button 2: Regenerate */}
//                 <button
//                   type="button"
//                   onClick={handleGenerate}
//                   className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
//                 >
//                   <RefreshCw size={16} />
//                   Regenerate
//                 </button>

//                 {/* Button 3: Use in Feature */}
//                 <button
//                   type="button"
//                   onClick={() => onSelect(generatedResult.s3Url)}
//                   className="py-3 px-4 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md"
//                 >
//                   <Check size={16} />
//                   Use in Feature
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Modal Footer (When not yet generated) */}
//         {!generatedResult && !loading && (
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={handleGenerate}
//               className="px-6 py-2.5 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all flex items-center gap-2 shadow-md"
//             >
//               <Sparkles size={16} />
//               Generate Image
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default AiImageGeneratorModal;


















import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, RefreshCw, BookmarkPlus, Check, Wand2, Gamepad2 } from "lucide-react";
import api from "../../api/apiconfig";
import { toast } from "react-toastify";

// Compact Embedded Vadik AI Snake Game for Loading Screen
const MiniSnakeGame = () => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const gridSize = 14;
    const tileCount = 18;
    let snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
    let food = { x: 13, y: 9 };
    let dx = 1;
    let dy = 0;
    let currentScore = 0;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; }
      else if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; }
      else if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; }
      else if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; }
    };

    window.addEventListener("keydown", handleKeyDown);

    const gameLoop = setInterval(() => {
      // Move Snake
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wrap Walls
      if (head.x < 0) head.x = tileCount - 1;
      if (head.x >= tileCount) head.x = 0;
      if (head.y < 0) head.y = tileCount - 1;
      if (head.y >= tileCount) head.y = 0;

      snake.unshift(head);

      // Check Food Collision
      if (head.x === food.x && head.y === food.y) {
        currentScore += 10;
        setScore(currentScore);
        food = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount),
        };
      } else {
        snake.pop();
      }

      // Draw Grid Background
      ctx.fillStyle = "#1E1E38";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Food (Sparkle Glow)
      ctx.fillStyle = "#CB376D";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#CB376D";
      ctx.beginPath();
      ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0; // Reset Shadow

      // Draw Snake
      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#CB376D" : "#5B5B9E";
        ctx.fillRect(
          part.x * gridSize + 1,
          part.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );
      });
    }, 110);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 bg-[#14142B] p-4 rounded-2xl border border-[#313166] shadow-inner">
      <div className="flex items-center justify-between w-full text-xs text-gray-300 font-medium px-1">
        <span className="flex items-center gap-1.5 text-[#CB376D] font-bold">
          <Gamepad2 size={16} /> Play while AI renders...
        </span>
        <span className="bg-[#313166] px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white">
          Score: {score}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={252}
        height={252}
        className="rounded-xl border border-white/10"
      />
      <p className="text-[10px] text-gray-400">Use ⬆️ ⬇️ ⬅️ ➡️ arrow keys to play</p>
    </div>
  );
};

const AiImageGeneratorModal = ({ onClose, onSelect, source = "template_builder" }) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [useBrandKit, setUseBrandKit] = useState(true);

  const [qualityMode, setQualityMode] = useState("mini");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for your image");
      return;
    }

    setLoading(true);
    setLoadingStep(1); // "Enhancing prompt details & style..."
    setGeneratedResult(null);
    setSavedSuccess(false);

    try {
      setTimeout(() => setLoadingStep(2), 1800); // "Rendering high-resolution visual..."

      const response = await api.post("/api/ai/generate-image", {
        prompt,
        aspectRatio,
        useBrandKit,
        model: qualityMode === "mini" ? "gpt-image-1-mini" : "gpt-image-1",
        saveToLibrary: false,
        source
      });

      if (response.data?.status === "success") {
        setGeneratedResult(response.data.data);
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error) {
      // Helper to map technical backend responses to polite customer messages
      const rawMsg = error.response?.data?.message || error.response?.data?.error || error.message || "";
      const lower = rawMsg.toLowerCase();

      let friendlyMsg = "Failed to generate image. Please try again.";

      if (lower.includes("insufficient") || lower.includes("credit") || lower.includes("balance") || lower.includes("exhausted")) {
        friendlyMsg = "Your AI balance is too low for image generation. Please top up your AI Wallet to continue.";
      } else if (lower.includes("rate limit") || lower.includes("429") || lower.includes("busy")) {
        friendlyMsg = "AI servers are currently busy. Please wait a few seconds and try again.";
      } else if (lower.includes("timeout") || lower.includes("network")) {
        friendlyMsg = "The AI service took longer than expected. Please try generating again.";
      }

      toast.error(friendlyMsg);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

const handleSaveToLibrary = async () => {
    if (!generatedResult?.s3Url) return;

    setSavingToLibrary(true);
    try {
      if (generatedResult?.savedToLibrary || generatedResult?.mediaId) {
        setSavedSuccess(true);
        toast.success("Image is already saved in your Media Library!");
        return;
      }

      // Send JSON payload directly to backend — completely bypasses browser CORS
      const res = await api.post("/api/media-library/upload", {
        s3Url: generatedResult.s3Url,
        fileName: generatedResult.fileName || `ai-${Date.now()}.png`,
        mimeType: "image/png",
        dimensions: generatedResult.dimensions || "1024x1024",
        aiRequestId: generatedResult.aiRequestId || null,
        usedBrandKit: generatedResult.usedBrandKit ?? useBrandKit,
        isAiGenerated: true,
        sizeBytes: generatedResult.sizeBytes || 0
      });

      if (res.data?.success || res.data?.status === "success" || res.status === 200 || res.status === 201) {
        setSavedSuccess(true);
        toast.success("Saved to Media Library!");
      }
    } catch (error) {
      console.error("Save to Media Library Error:", error);
      toast.error("Unable to save image to Media Library right now. Please try again.");
    } finally {
      setSavingToLibrary(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white shadow-md">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Vadik AI Image Generator</h3>
              <p className="text-xs text-gray-500">Transform prompts into WhatsApp-ready marketing visuals</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
          
          {/* Form Inputs */}
          {!generatedResult && !loading && (
            <div className="space-y-4">
              {/* <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Describe Your Visual
                </label>
                <textarea
                  rows="3"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D] outline-none transition-all font-medium"
                  placeholder="e.g. Grand Diwali festive discount banner with glowing diyas, modern gift boxes, and gold sparkles..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div> */}

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Describe Your Visual
                </label>
                <textarea
                  rows="3"
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#CB376D]/20 focus:border-[#CB376D] outline-none transition-all font-medium"
                  placeholder="e.g. Grand Diwali festive discount banner with glowing diyas, modern gift boxes, and gold sparkles..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                {/* Quick Retail Sale Suggestions */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 self-center mr-1">Quick Ideas:</span>
                  {[
                    "Diwali Mega Sale 50% Off retail discount poster with gift hampers and brass diyas",
                    "Exclusive Festive Clearance Offer banner with gold sparkles and festive lighting",
                    "New Seasonal Arrival poster with luxury gift packaging and festive background"
                  ].map((idea, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(idea)}
                      className="text-[10px] bg-gray-100 hover:bg-[#CB376D]/10 hover:text-[#CB376D] text-gray-600 px-2.5 py-1 rounded-lg font-medium transition-all"
                    >
                      + {idea.slice(0, 28)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Picker */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "1:1 Square", val: "1:1" },
                    { label: "4:5 Portrait", val: "4:5" },
                    { label: "9:16 Story", val: "9:16" },
                    { label: "16:9 Banner", val: "16:9" }
                  ].map((ratio) => (
                    <button
                      key={ratio.val}
                      type="button"
                      onClick={() => setAspectRatio(ratio.val)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        aspectRatio === ratio.val
                          ? "border-[#CB376D] bg-[#CB376D]/5 text-[#CB376D] shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Kit Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <Wand2 size={16} className="text-[#CB376D]" />
                  <span className="text-xs font-bold text-gray-800">Apply Business Brand Colors & Style</span>
                </div>
                <input
                  type="checkbox"
                  checked={useBrandKit}
                  onChange={(e) => setUseBrandKit(e.target.checked)}
                  className="w-4 h-4 accent-[#CB376D] rounded cursor-pointer"
                />
              </div>

              {/* Render Mode / Quality Selector */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Render Mode</span>
                  <span className="text-[10px] text-gray-500">
                    {qualityMode === "mini" ? "Fast Test Draft (~₹1.50)" : "HD Commercial (~₹3.50)"}
                  </span>
                </div>
                <div className="flex bg-gray-200/80 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setQualityMode("mini")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      qualityMode === "mini"
                        ? "bg-white text-[#CB376D] shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Draft (₹1.50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQualityMode("standard")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      qualityMode === "standard"
                        ? "bg-[#CB376D] text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    HD (₹3.50)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Loading Screen */}
          {loading && (
            <div className="py-6 flex flex-col items-center justify-center space-y-5">
              <div className="text-center space-y-1">
                <h4 className="font-bold text-gray-900 text-base animate-pulse">
                  {loadingStep === 1
                    ? "Refining Prompt & Lighting Details..."
                    : "Rendering High-Resolution Visual..."}
                </h4>
                <p className="text-xs text-gray-500 max-w-xs">
                  Vadik AI Vision Engine is processing your request (~4–6s).
                </p>
              </div>

              {/* Vadik AI Snake Game */}
              <MiniSnakeGame />
            </div>
          )}

          {/* Generated Image Preview & Actions */}
          {generatedResult && !loading && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 max-h-[350px] flex items-center justify-center group">
                <img
                  src={generatedResult.s3Url}
                  alt="AI Preview"
                  className="max-h-[350px] w-full object-contain"
                />
              </div>

              {generatedResult.enhancedPrompt && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
                  <span className="font-bold text-gray-800">Enhanced Prompt: </span>
                  {generatedResult.enhancedPrompt}
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveToLibrary}
                  disabled={savingToLibrary || savedSuccess}
                  className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                    savedSuccess
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {savedSuccess ? <Check size={16} /> : <BookmarkPlus size={16} />}
                  {savedSuccess ? "Saved to Library" : savingToLibrary ? "Saving..." : "Save to Library"}
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Regenerate
                </button>

                <button
                  type="button"
                  onClick={() => onSelect(generatedResult.s3Url)}
                  className="py-3 px-4 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Check size={16} />
                  Use in Feature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!generatedResult && !loading && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="px-6 py-2.5 bg-gradient-to-r from-[#CB376D] to-[#A72962] text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all flex items-center gap-2 shadow-md"
            >
              <Sparkles size={16} />
              Generate Image
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiImageGeneratorModal;