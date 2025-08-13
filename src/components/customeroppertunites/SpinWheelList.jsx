import React from "react";
import { Edit, Trash2, Plus } from "lucide-react";

const SpinWheelList = ({ activities, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {activities.map((campaign) => (
        <div
          key={campaign.id}
          className="bg-white rounded-lg p-6 border border-gray-300 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
               
                <img src="../assets/wheel-icon.png" alt="" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {campaign.name}
                </h3>
                <p className="text-gray-600">No Of Spins : {campaign.noOfSpins}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(campaign)}
                className="p-2 text-[#313166] bg-[#3131661A] hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(campaign._id)}
                className="p-2 text-[#FD2C2F] bg-[#FF00001A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>
            No spin wheel activities created yet. Click "Create Spin Wheel" to
            get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default SpinWheelList;
