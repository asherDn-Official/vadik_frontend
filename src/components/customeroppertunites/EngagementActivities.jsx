import React, { useState } from "react";
import Quiz from "./Quiz";
// import SpinWheel from "./SpinWheel";
// import ScratchCard from "./ScratchCard";

const EngagementActivities = () => {
  const [selectedCampaign, setSelectedCampaign] = useState("quiz");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Select Activities
        </h2>
        <p className="text-gray-600 mb-6">
          Create fun activities like quiz, scratch card, or spin wheel to
          interact with your customers and learn their preferences.
        </p>

        <div className="max-w-md">
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          >
            <option value="quiz">Quiz</option>
            <option value="spinwheel">Spin Wheel</option>
            <option value="scratchcard">Scratch Card</option>
          </select>
        </div>
      </div>

      {selectedCampaign === "quiz" && <Quiz />}
      {/* {selectedCampaign === "spinwheel" && <SpinWheel />}
      {selectedCampaign === "scratchcard" && <ScratchCard />} */}
    </div>
  );
};

export default EngagementActivities;