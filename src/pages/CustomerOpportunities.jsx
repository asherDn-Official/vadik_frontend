import React, { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import QuizForm from "../components/customeroppertunites/QuizForm";
import QuizList from "../components/customeroppertunites/QuizList";
import SpinWheelForm from "../components/customeroppertunites/SpinWheelForm";
import SpinWheelList from "../components/customeroppertunites/SpinWheelList";
import ScratchCardForm from "../components/customeroppertunites/ScratchCardForm";
import ScratchCardList from "../components/customeroppertunites/ScratchCardList";
import PersonalizationCampaign from "../components/customeroppertunites/PersonalizationCampaign";
import CustomerRecommendation from "../components/customeroppertunites/CustomerRecommendation";
import StoreRecommendation from "../components/customeroppertunites/StoreRecommendation";
import EngagementActivities from "../components/customeroppertunites/EngagementActivities";

const CustomerOpportunities = () => {
  const [activeTab, setActiveTab] = useState("engagement");
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

  if (showCreateForm && activeTab === "engagement") {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Customer Opportunities
          </h1>
          <p className="text-gray-600 ">
            This smart chatbot suggests the right offers to the right customers
            <br />
            at the right time using intelligent triggers.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-8 space-x-8">
          <button
            onClick={() => setActiveTab("engagement")}
            className={`flex space-x-2 px-4 py-2 border rounded-lg transition-colors ${activeTab === "engagement"
                ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
          >
            <div className="w-8 h-8 rounded-lg flex justify-center items-center">
              {/* <div className="w-4 h-4 bg-white rounded"></div> */}
              <img src="../assets/cus-1.png" alt="" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-start">
                Personalization engagement
              </div>
              <div className="text-xs text-gray-500 text-start">
                Birthday and anniversary-based personalized offers.
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("campaign")}
            className={`flex space-x-2 px-4 py-2 border rounded-lg transition-colors ${activeTab === "campaign"
                ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
          >
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <img src="../assets/cus-2.png" alt="" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-start">
                Personalization Activities
              </div>
              <div className="text-xs text-gray-500 text-start">
                Festival and region-specific campaign suggestions.
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("customer-recommendation")}
            className={`flex space-x-2 px-4 py-2 border rounded-lg transition-colors ${activeTab === "customer-recommendation"
                ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
          >
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <img src="../assets/cus-3.png" alt="" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-start">
                Customer Recommendation
              </div>
              <div className="text-xs text-gray-500 text-start">
                Product suggestions based on behavior and stock.
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("store-recommendation")}
            className={`flex space-x-2 px-4 py-2 border rounded-lg transition-colors ${activeTab === "store-recommendation"
                ? "bg-[#3131661A] border-pink-200 rounded-[12px]"
                : "bg-gray-50 border-gray-200 opacity-60 hover:opacity-100"
              }`}
          >
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
              <img src="../assets/cus-4.png" alt="" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-start">
                Store recommendation
              </div>
              <div className="text-xs text-gray-500 text-start">
                Retailer Stock Management Suggestion
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "engagement" && (
          <EngagementActivities
            activeTab={activeTab}
            selectedCampaign={selectedCampaign}
            setSelectedCampaign={setSelectedCampaign}
            quizActivities={quizActivities}
            spinWheelActivities={spinWheelActivities}
            scratchCardActivities={scratchCardActivities}
            handleCreateCampaign={handleCreateCampaign}
            handleEditCampaign={handleEditCampaign}
            handleDeleteCampaign={handleDeleteCampaign}
          />
        )}

        {activeTab === "campaign" && (
          <PersonalizationCampaign
            quizActivities={quizActivities}
            spinWheelActivities={spinWheelActivities}
            scratchCardActivities={scratchCardActivities}
          />
        )}

        {activeTab === "customer-recommendation" && <CustomerRecommendation />}

        {activeTab === "store-recommendation" && <StoreRecommendation />}
      </div>
    </div>
  );
};

export default CustomerOpportunities;
