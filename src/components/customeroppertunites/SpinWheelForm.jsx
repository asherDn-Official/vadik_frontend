import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import SpinWheelPreview from "./SpinWheelPreview";

const SpinWheelForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "Our Spin",
    spins: 3,
    segments: [
      {
        id: 1,
        productName: "Premium Wireless Headphones",
        offer: "12",
        color: "#E91E63",
      },
      { id: 2, productName: "", offer: "0.00", color: "#FF4081" },
      { id: 3, productName: "", offer: "0.00", color: "#E91E63" },
    ],
  });

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "Our Spin",
        spins: campaign.spins || 3,
        segments: campaign.segmentsData || [
          {
            id: 1,
            productName: "Premium Wireless Headphones",
            offer: "12",
            color: "#E91E63",
          },
          { id: 2, productName: "", offer: "0.00", color: "#FF4081" },
          { id: 3, productName: "", offer: "0.00", color: "#E91E63" },
        ],
      });
    }
  }, [campaign]);

  const colors = [
    "#E91E63",
    "#FF4081",
    "#F06292",
    "#EC407A",
    "#E91E63",
    "#AD1457",
    "#C2185B",
    "#D81B60",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSegmentChange = (segmentId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      segments: prev.segments.map((s) =>
        s.id === segmentId ? { ...s, [field]: value } : s
      ),
    }));
  };

  const addSegment = () => {
    const newSegment = {
      id: Date.now(),
      productName: "",
      offer: "0.00",
      color: colors[formData.segments.length % colors.length],
    };
    setFormData((prev) => ({
      ...prev,
      segments: [...prev.segments, newSegment],
      spins: prev.segments.length + 1,
    }));
  };

  const removeSegment = (segmentId) => {
    if (formData.segments.length > 1) {
      setFormData((prev) => ({
        ...prev,
        segments: prev.segments.filter((s) => s.id !== segmentId),
        spins: prev.segments.length - 1,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const campaignData = {
      title: formData.title,
      spins: formData.segments.length,
      segmentsData: formData.segments,
    };
    onSave(campaignData);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Spin Wheel</h2>
        <p className="text-gray-600">
          Add excitement with a spin-to-win experience that keeps your customers
          engaged and coming back.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Preview */}
          <div>
            <SpinWheelPreview segments={formData.segments} />
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Of Spins
              </label>
              <input
                type="number"
                value={formData.spins}
                onChange={(e) =>
                  handleInputChange("spins", parseInt(e.target.value))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                min="1"
                required
              />
            </div>

          
          </div></div>
            {/* Segments Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      S.no
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Product Name
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Offer %
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Add Image
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Choose Color
                    </th>
                    <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.segments.map((segment, index) => (
                    <tr key={segment.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          type="text"
                          placeholder="Enter Product Name"
                          value={segment.productName}
                          onChange={(e) =>
                            handleSegmentChange(
                              segment.id,
                              "productName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <input
                          type="text"
                          value={segment.offer + " %"}
                          onChange={(e) =>
                            handleSegmentChange(
                              segment.id,
                              "offer",
                              e.target.value.replace(" %", "")
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none text-sm"
                        />
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 transition-colors"
                        >
                          Click To Add
                        </button>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-8 h-6 rounded-full cursor-pointer border-2 border-gray-300"
                            style={{ backgroundColor: segment.color }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "color";
                              input.value = segment.color;
                              input.onchange = (e) =>
                                handleSegmentChange(
                                  segment.id,
                                  "color",
                                  e.target.value
                                );
                              input.click();
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3">
                        {formData.segments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSegment(segment.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addSegment}
                className="flex items-center px-4 py-2 text-pink-600 hover:text-pink-700 transition-colors"
              >
                Add Spin <Plus className="w-4 h-4 ml-1" />
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
                Save Spin Wheel
              </button>
            </div>
        
      </form>
    </div>
  );
};

export default SpinWheelForm;
