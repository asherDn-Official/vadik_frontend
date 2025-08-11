import React, { useState } from "react";
import { Plus } from "lucide-react";
import QuizList from "./QuizList";
import SpinWheelList from "./SpinWheelList";
import ScratchCardList from "./ScratchCardList";
import QuizForm from "./QuizForm";
import SpinWheelForm from "./SpinWheelForm";
import ScratchCardForm from "./ScratchCardForm";
import { ArrowLeft } from "lucide-react";

const EngagementActivities = () => {
  const [selectedCampaign, setSelectedCampaign] = useState("quiz");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [quizActivities, setQuizActivities] = useState([
    { id: 1, title: "Special Day Quizz", questions: 8 },
    { id: 2, title: "Favourite Product Quizz", questions: 6 },
    { id: 3, title: "Personal Details Quiz", questions: 3 },
  ]);

  const [spinWheelActivities, setSpinWheelActivities] = useState([
    { id: 1, title: "Spin Wheel 1", spins: 8 },
    { id: 2, title: "Spin Wheel 2", spins: 6 },
    { id: 3, title: "Spin Wheel 3", spins: 3 },
  ]);

  const [scratchCardActivities, setScratchCardActivities] = useState([
    { id: 1, title: "Summer Sale Scratch", offers: 5 },
    { id: 2, title: "Welcome Bonus Card", offers: 3 },
  ]);

  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    setShowCreateForm(true);
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setShowCreateForm(true);
  };

  const handleSaveCampaign = (campaignData) => {
    if (selectedCampaign === "quiz") {
      if (editingCampaign) {
        setQuizActivities((prev) =>
          prev.map((c) =>
            c.id === editingCampaign.id
              ? { ...campaignData, id: editingCampaign.id }
              : c
          )
        );
      } else {
        setQuizActivities((prev) => [
          ...prev,
          { ...campaignData, id: Date.now() },
        ]);
      }
    } else if (selectedCampaign === "spinwheel") {
      if (editingCampaign) {
        setSpinWheelActivities((prev) =>
          prev.map((c) =>
            c.id === editingCampaign.id
              ? { ...campaignData, id: editingCampaign.id }
              : c
          )
        );
      } else {
        setSpinWheelActivities((prev) => [
          ...prev,
          { ...campaignData, id: Date.now() },
        ]);
      }
    } else if (selectedCampaign === "scratchcard") {
      if (editingCampaign) {
        setScratchCardActivities((prev) =>
          prev.map((c) =>
            c.id === editingCampaign.id
              ? { ...campaignData, id: editingCampaign.id }
              : c
          )
        );
      } else {
        setScratchCardActivities((prev) => [
          ...prev,
          { ...campaignData, id: Date.now() },
        ]);
      }
    }
    setShowCreateForm(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = (id) => {
    if (selectedCampaign === "quiz") {
      setQuizActivities((prev) => prev.filter((c) => c.id !== id));
    } else if (selectedCampaign === "spinwheel") {
      setSpinWheelActivities((prev) => prev.filter((c) => c.id !== id));
    } else if (selectedCampaign === "scratchcard") {
      setScratchCardActivities((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
    setEditingCampaign(null);
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <button
            onClick={handleBackToList}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {selectedCampaign === "quiz" && (
            <QuizForm
              campaign={editingCampaign}
              onSave={handleSaveCampaign}
              onCancel={handleBackToList}
            />
          )}

          {selectedCampaign === "spinwheel" && (
            <SpinWheelForm
              campaign={editingCampaign}
              onSave={handleSaveCampaign}
              onCancel={handleBackToList}
            />
          )}

          {selectedCampaign === "scratchcard" && (
            <ScratchCardForm
              campaign={editingCampaign}
              onSave={handleSaveCampaign}
              onCancel={handleBackToList}
            />
          )}
        </div>
      </div>
    );
  }

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