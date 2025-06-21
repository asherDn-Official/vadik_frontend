import React, { useState, useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";

const ScratchCardForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "Summer Scratch Card",
    offers: [
      {
        id: 1,
        title: "Enter Title Name",
        offer: "0.00",
        couponCode: "Enter here",
      },
    ],
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "Summer Scratch Card",
        offers: campaign.offersData || [
          {
            id: 1,
            title: "Enter Title Name",
            offer: "0.00",
            couponCode: "Enter here",
          },
        ],
      });
    }
  }, [campaign]);

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
      offer: "0.00",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const campaignData = {
      title: formData.title,
      offers: formData.offers.length,
      offersData: formData.offers,
    };
    onSave(campaignData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Scratch Card</h2>
        <p className="text-gray-600">
          Want to keep customers coming back? Share a custom scratch card and
          make their day!
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-lg relative overflow-hidden">
              {/* Polka dot pattern */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 50 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-4 h-4 bg-white rounded-full"
                    style={{
                      left: `${(i % 8) * 12 + 8}%`,
                      top: `${Math.floor(i / 8) * 12 + 8}%`,
                    }}
                  />
                ))}
              </div>

              {/* Gift icon in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-8 h-8 bg-pink-500 rounded-sm relative">
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-pink-600 rounded-t"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-pink-600"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-pink-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Title
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
                    <tr key={offer.id} className="hover:bg-gray-50">
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
                          type="text"
                          value={offer.offer + " %"}
                          onChange={(e) =>
                            handleOfferChange(
                              offer.id,
                              "offer",
                              e.target.value.replace(" %", "")
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
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
                            className="text-gray-500 hover:text-pink-600"
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
                type="submit"
                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Save Scratch Card
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ScratchCardForm;
