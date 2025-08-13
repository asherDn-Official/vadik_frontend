import React, { useEffect, useState } from "react";
import SpinWheelList from "./SpinWheelList";
import SpinWheelForm from "./SpinWheelForm";
import { ArrowLeft } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import deleteConfirmTostNotification from "../../utils/deleteConfirmTostNotification";

const SpinWheel = () => {
  const [spinWheels, setSpinWheels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSpinWheel, setEditingSpinWheel] = useState(null);


  const getAllWheelData = async () => {
    try {
      const response = await api.get('/api/spinWheels/spinWheel/all');
      setSpinWheels(response.data.data);

    } catch (error) {
      showToast(error.response.data.message, "error")
    }

  }

  useEffect(() => {
    getAllWheelData()
  }, [])


  const handleCreate = () => {
    setEditingSpinWheel(null);
    setShowForm(true);
  };

  const handleEdit = async (spineWheelSingledata) => {
  console.log("edit", spineWheelSingledata);

  try {
    // If you need to fetch coupon details for each coupon in the wheel
    const couponDetails = {};
    
    // Get unique coupon IDs to avoid duplicate API calls
    const uniqueCouponIds = [...new Set(spineWheelSingledata.couponOptions)];
    
    // Fetch details for all coupons in parallel
    const couponPromises = uniqueCouponIds.map(async (couponId) => {
      const res = await api.post("/api/coupons/couponforCampains", { coupons: couponId });
      return { [couponId]: res?.data?.data || {} };
    });
    
    // Wait for all promises and merge results
    const couponResults = await Promise.all(couponPromises);
    couponResults.forEach(result => {
      Object.assign(couponDetails, result);
    });

    // Transform the spin wheel data into your editing format
    const transformedData = {
      ...spineWheelSingledata,
      segments: spineWheelSingledata.couponOptions.map((couponId, index) => ({
        id: `segment-${index}`, // or use actual segment IDs if available
        couponId,
        productName: couponDetails[couponId]?.name || "",
        offer: String(couponDetails[couponId]?.discount ?? "0"),
        couponType: couponDetails[couponId]?.couponType,
        // Add other segment properties as needed
      }))
    };

    setEditingSpinWheel(transformedData);
    setShowForm(true);
  } catch (error) {
    console.error("Error editing spin wheel:", error);
    // Handle error (show toast, etc.)
  }
};

  const handleSave = () => {
    // Refresh list from server after create/update and close form
    getAllWheelData();
    setEditingSpinWheel(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const onconfirm = async () => {
      try {
        await api.delete(`/api/spinWheels/${id}`);
        getAllWheelData();
        showToast("Quiz deleted successfully", "success");
      } catch (err) {
        showToast(err.response.data.message, "error");
      }
    };

    deleteConfirmTostNotification("", onconfirm);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <SpinWheelForm
            campaign={editingSpinWheel}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {spinWheels.length} Quiz Activities
        </h3>
        <button
          onClick={handleCreate}
          className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
        >
          Create Quiz
        </button>
      </div>
      <SpinWheelList
        activities={spinWheels}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default SpinWheel;