import { Plus } from "lucide-react";
import QuizList from "./QuizList";
import SpinWheelList from "./SpinWheelList";
import ScratchCardList from "./ScratchCardList";

const EngagementActivities = ({
  activeTab,
  selectedCampaign,
  setSelectedCampaign,
  quizActivities,
  spinWheelActivities,
  scratchCardActivities,
  handleCreateCampaign,
  handleEditCampaign,
  handleDeleteCampaign
}) => {
  if (activeTab !== "engagement") return null;

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

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-800">
          {selectedCampaign === "quiz"
            ? quizActivities.length
            : selectedCampaign === "spinwheel"
            ? spinWheelActivities.length
            : scratchCardActivities.length}{" "}
          {selectedCampaign === "quiz"
            ? "Quiz"
            : selectedCampaign === "spinwheel"
            ? "Spin Wheel"
            : "Scratch Card"}{" "}
          Activities
        </h3>
        <button
          onClick={handleCreateCampaign}
          className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2 text-[#313166]" />
          Create{" "}
          {selectedCampaign === "quiz"
            ? "Quiz"
            : selectedCampaign === "spinwheel"
            ? "Spin Wheel"
            : "Scratch Card"}
        </button>
      </div>

      {selectedCampaign === "quiz" && (
        <QuizList
          activities={quizActivities}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
        />
      )}

      {selectedCampaign === "spinwheel" && (
        <SpinWheelList
          activities={spinWheelActivities}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
        />
      )}

      {selectedCampaign === "scratchcard" && (
        <ScratchCardList
          activities={scratchCardActivities}
          onEdit={handleEditCampaign}
          onDelete={handleDeleteCampaign}
        />
      )}
    </div>
  );
};

export default EngagementActivities;