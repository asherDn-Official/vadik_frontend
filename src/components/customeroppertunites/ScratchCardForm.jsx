import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Gift } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const ScratchCard = ({ offer, title, CoupanName }) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 256;
    canvas.height = 256;

    // Draw the scratch surface
    drawScratchSurface(ctx);
  }, []);

  const drawScratchSurface = (ctx) => {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(1, '#db2777');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    // Add polka dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 50; i++) {
      const x = (i % 8) * 32 + 16;
      const y = Math.floor(i / 8) * 32 + 16;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Add gift icon placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(128, 128, 32, 0, 2 * Math.PI);
    ctx.fill();
  };

  const getMousePos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    };
  };

  const scratch = (x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Check if enough area is scratched
    checkScratchedArea();
  };

  const checkScratchedArea = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const scratchedPercentage = (transparentPixels / (canvas.width * canvas.height)) * 100;

    if (scratchedPercentage > 30 && !isRevealed) {
      setIsRevealed(true);
      // Clear the entire canvas to reveal the offer
      setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 500);
    }
  };

  const handleMouseDown = (e) => {
    setIsScratching(true);
    const pos = getMousePos(canvasRef.current, e);
    scratch(pos.x, pos.y);
  };

  const handleMouseMove = (e) => {
    if (isScratching) {
      const pos = getMousePos(canvasRef.current, e);
      scratch(pos.x, pos.y);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsScratching(true);
    const pos = getTouchPos(canvasRef.current, e);
    scratch(pos.x, pos.y);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (isScratching) {
      const pos = getTouchPos(canvasRef.current, e);
      scratch(pos.x, pos.y);
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    setIsScratching(false);
  };

  return (
    <div className="relative w-64 h-64 rounded-2xl shadow-lg overflow-hidden cursor-pointer select-none">
      {/* Background with offer */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col items-center justify-center text-white">
        <Gift className="w-12 h-12 mb-2" />
        <div className="text-2xl font-bold">{CoupanName}</div>
      </div>

      {/* Scratch layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      />


    </div>
  );
};

const ScratchCardForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Backend fields
    name: "",
    couponId: "",
    allocatedQuizCampainId: "",
    expiryDate: "",
    isActive: true,
    // Local preview fields
    title: "Summer Scratch Card",
    offers: [
      {
        id: 1,
        title: "Enter Title Name",
        offer: "10",
        couponCode: "SUMMER10",
      },
    ],
  });

  const [selectedOffer, setSelectedOffer] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const selectedCoupon = coupons.find(c => c._id === formData.couponId);
  const couponCode = selectedCoupon ? selectedCoupon.code : "";

  // Fetch dropdown data
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get("https://app.vadik.ai/api/coupons/all");
        const list = res?.data?.data || [];
        setCoupons(list);
      } catch (e) {
        console.error("Failed to load coupons", e);
      } finally {
        setLoadingCoupons(false);
      }
    };
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("https://app.vadik.ai/api/quiz");
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
        setQuizzes(list);
      } catch (e) {
        console.error("Failed to load quizzes", e);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchCoupons();
    fetchQuizzes();
  }, []);

  // Prefill from campaign prop (edit mode)
  useEffect(() => {
    if (!campaign) return;

    // If only id is provided, still set what we can
    setFormData((prev) => ({
      ...prev,
      name: campaign.name || prev.name || "",
      couponId: campaign.couponId || prev.couponId || "",
      allocatedQuizCampainId: campaign.allocatedQuizCampainId || prev.allocatedQuizCampainId || "",
      expiryDate: campaign.expiryDate ? String(campaign.expiryDate).slice(0, 10) : (prev.expiryDate || ""),
      isActive: typeof campaign.isActive === "boolean" ? campaign.isActive : (prev.isActive ?? true),
    }));

    // If _id exists, fetch full scratch card details
    const id = campaign._id;
    if (!id) return;

    (async () => {
      try {
        const res = await api.get(`/api/scratchCards/${id}`);
        const data = res?.data;
        if (data && data._id) {
          setFormData((prev) => ({
            ...prev,
            name: data.name || "",
            couponId: data.couponId || "",
            allocatedQuizCampainId: data.allocatedQuizCampainId || "",
            expiryDate: data.expiryDate ? String(data.expiryDate).slice(0, 10) : "",
            isActive: typeof data.isActive === "boolean" ? data.isActive : true,
            _id: data._id,
          }));
        }
      } catch (e) {
        console.error("Failed to fetch scratch card details", e);
      }
    })();
  }, [campaign]);

  useEffect(() => {
    // Update selected offer when offers change
    if (selectedOffer >= formData.offers.length) {
      setSelectedOffer(0);
    }
  }, [formData.offers, selectedOffer]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOfferChange = (offerId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      offers: prev.offers.map((o) =>
        o.id === offerId ? { ...o, [field]: value } : o
      ),
    }));
  };

  const addOffer = () => {
    const newOffer = {
      id: Date.now(),
      title: "Enter Title Name",
      offer: "0",
      couponCode: "Enter here",
    };
    setFormData((prev) => ({
      ...prev,
      offers: [...prev.offers, newOffer],
    }));
  };

  const removeOffer = (offerId) => {
    if (formData.offers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        offers: prev.offers.filter((o) => o.id !== offerId),
      }));
    }
  };

  const handleSubmit = async () => {
    // Build backend payload
    const payload = {
      name: formData.name?.trim() || formData.title?.trim() || "",
      couponId: formData.couponId || "",
      allocatedQuizCampainId: formData.allocatedQuizCampainId || "",
      expiryDate: formData.expiryDate ? `${formData.expiryDate}T00:00:00.000Z` : "",
      isActive: !!formData.isActive,
    };

    // Optimistically pass to parent
    onSave && onSave({ ...payload, _id: formData._id });

    try {
      setSubmitting(true);
      if (campaign._id) {
        // Update existing
        await api.patch(`/api/scratchCards/${campaign._id}`, payload);
        showToast("Scratch Card Updated Successfully!", "success");
      } else {
        // Create new
        await api.post(`/api/scratchCards/`, payload);
        showToast("Scratch Card Created Successfully!", "success");
      }
    } catch (error) {
      showToast(error.response?.data?.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const currentOffer = formData.offers[selectedOffer] || formData.offers[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Scratch Card</h2>
        <p className="text-gray-600">
          Want to keep customers coming back? Share a custom scratch card and
          make their day!
        </p>
      </div>

      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <ScratchCard
              CoupanName={couponCode}//show the coupon code in the scratch card , CoupanName is the coupon code 
            />

            {/* Offer selector */}

          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            {/* Name (backend) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter Scratch Card Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                required
              />
            </div>

            {/* Coupon Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Coupon</label>
              <select
                value={formData.couponId || ""}
                onChange={(e) => handleInputChange("couponId", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                disabled={loadingCoupons}
              >
                <option value="">{loadingCoupons ? "Loading..." : "Select Coupon"}</option>
                {!loadingCoupons && coupons?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate || ""}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              />
            </div>

            {/* Quiz Select (Select Blog) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Quiz</label>
              <select
                value={formData.allocatedQuizCampainId || ""}
                onChange={(e) => handleInputChange("allocatedQuizCampainId", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                disabled={loadingQuizzes}
              >
                <option value="">{loadingQuizzes ? "Loading..." : "Select Quiz"}</option>
                {!loadingQuizzes && quizzes?.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.campaignName}
                  </option>
                ))}
              </select>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={!!formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="h-4 w-4 text-pink-600 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Is Active</label>
            </div>


            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2 rounded-lg transition-colors text-white ${submitting ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"}`}
              >
                {campaign?._id ? (submitting ? "Updating..." : "Update Scratch Card") : (submitting ? "Creating..." : "Create Scratch Card")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardForm;