import React, { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import QuestionTypeDropdown from "../common/QuestionTypeDropdown";
import AddOption from "../common/AddOption";
import api from "../../api/apiconfig";

const QuizForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    loyaltyPoints: "",
    questions: [
      {
        id: 1,
        type: "mcq",
        question: "",
        options: ["", ""],
      },
    ],
  });
  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });
  const [perference, setPerference] = useState([]);

  async function getPerferences() {
    try {
      const response = await api.get(`/api/customer-preferences/${retailerId}`)
      const perference = response?.data
      console.log('perference', perference);
      setPerference(perference);
    } catch (error) {
      showToast(error.response.data.message, 'error');
    }
  }

  useEffect(() => {
    // Fetch quizzes data from the API and update state here
    getPerferences();
  }, []);


  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "",
        loyaltyPoints: campaign.loyaltyPoints || "",
        questions: campaign.questionsData || [
          {
            id: 1,
            type: "mcq",
            question: "",
            options: ["", ""],
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

  const handleQuestionChange = (questionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            options: q.options.map((opt, idx) =>
              idx === optionIndex ? value : opt
            ),
          }
          : q
      ),
    }));
  };

  const addOption = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q
      ),
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
          : q
      ),
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: "mcq",
      question: "",
      options: ["", ""],
    };
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (questionId) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const campaignData = {
      title: formData.title,
      questions: formData.questions.length,
      questionsData: formData.questions,
      loyaltyPoints: formData.loyaltyPoints,
    };
    onSave(campaignData);
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Create Quiz</h2>
        <div className="flex items-center space-x-4">
          <span className="text-slate-600">Loyalty Point</span>
          <input
            type="text"
            placeholder="Enter Value"
            value={formData.loyaltyPoints}
            onChange={(e) => handleInputChange("loyaltyPoints", e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            placeholder="Enter quiz title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            required
          />
        </div>

        {formData.questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="bg-[#31316612] rounded-lg p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Question {qIndex + 1}
              </h3>
              <div className="flex items-center space-x-2">
                <QuestionTypeDropdown
                  value={question.type}
                  onChange={(type) =>
                    handleQuestionChange(question.id, "type", type)
                  }
                />
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your Question"
                value={question.question}
                onChange={(e) =>
                  handleQuestionChange(question.id, "question", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white"
                required
              />
            </div>

            {question.type === "mcq" && (
              <div className="space-y-3">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-3">
                    <span className="font-medium text-slate-600 w-6">
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <input
                      type="text"
                      placeholder="Enter Options"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          question.id,
                          optIndex,
                          e.target.value
                        )
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white"
                    />
                    <button type="button" className="text-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(question.id, optIndex)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <AddOption onClick={() => addOption(question.id)} />
              </div>
            )}

            {question.type === "short-answer" && (
              <div>
                <input
                  type="text"
                  placeholder="Field for the customer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white"
                  disabled
                />
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </button>

        <div className="flex justify-end space-x-4">
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
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
