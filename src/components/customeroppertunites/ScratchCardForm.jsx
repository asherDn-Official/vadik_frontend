import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Gift } from "lucide-react";

const ScratchCard = ({ offer, title }) => {
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
        <div className="text-2xl font-bold">{offer}% OFF</div>
        <div className="text-sm text-center px-4 mt-2">{title}</div>
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
      
      {/* Instruction text */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white text-sm font-medium text-center">
            Scratch to reveal
            <br />
            your offer!
          </div>
        </div>
      )}
    </div>
  );
};

const ScratchCardForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "Summer Scratch Card",
        offers: campaign.offersData || [
          {
            id: 1,
            title: "Enter Title Name",
            offer: "10",
            couponCode: "SUMMER10",
          },
        ],
      });
    }
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

  const handleSubmit = () => {
    const campaignData = {
      title: formData.title,
      offers: formData.offers.length,
      offersData: formData.offers,
    };
    onSave && onSave(campaignData);
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
              offer={currentOffer?.offer || "0"} 
              title={currentOffer?.title || "No Title"}
            />
            
            {/* Offer selector */}
            {formData.offers.length > 1 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Offer:
                </label>
                <select
                  value={selectedOffer}
                  onChange={(e) => setSelectedOffer(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                >
                  {formData.offers.map((offer, index) => (
                    <option key={offer.id} value={index}>
                      {offer.title} - {offer.offer}%
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activities Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                required
              />
            </div>

            {/* Offers Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      S.no
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Enter Title
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Offer %
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Coupon Code
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.offers.map((offer, index) => (
                    <tr 
                      key={offer.id} 
                      className={`hover:bg-gray-50 ${
                        index === selectedOffer ? 'bg-pink-50' : ''
                      }`}
                    >
                      <td className="border border-gray-200 px-4 py-3 text-sm">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          type="text"
                          value={offer.title}
                          onChange={(e) =>
                            handleOfferChange(offer.id, "title", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          type="number"
                          value={offer.offer}
                          onChange={(e) =>
                            handleOfferChange(offer.id, "offer", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          type="text"
                          value={offer.couponCode}
                          onChange={(e) =>
                            handleOfferChange(
                              offer.id,
                              "couponCode",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOffer(index)}
                            className="text-gray-500 hover:text-pink-600"
                            title="Preview this offer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {formData.offers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOffer(offer.id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addOffer}
                className="px-4 py-2 text-pink-600 hover:text-pink-700 transition-colors"
              >
                + Add Offer
              </button>
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
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Save Scratch Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardForm;