import React, { useState, useEffect } from "react";
import { Plus, X, Check, ChevronDown } from "lucide-react";
import AddOption from "../common/AddOption";
import api from "../../api/apiconfig";

const QuizForm = ({ campaign, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    // description: "",
    loyaltyPoints: "",
    questions: [
      {
        id: 1,
        key: "",
        question: "",
        type: "string",
        section: "additionalData",
        options: [],
      },
    ],
  });

  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  const [allPreferences, setAllPreferences] = useState([]);
  const [isPreferenceDropdownOpen, setIsPreferenceDropdownOpen] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function getPerferences() {
    try {
      const response = await api.get(`/api/customer-preferences/${retailerId}`);
      const preference = response?.data;

      // Combine all preferences from different categories
      const combinedPreferences = [
        ...(preference.additionalData?.map(item => ({
          ...item,
          section: "additionalData"
        })) || []),
        ...(preference.advancedDetails?.map(item => ({
          ...item,
          section: "advancedDetails"
        })) || []),
        ...(preference.advancedPrivacyDetails?.map(item => ({
          ...item,
          section: "advancedPrivacyDetails"
        })) || [])
      ];

      setAllPreferences(combinedPreferences);
      setIsPreferenceDropdownOpen(new Array(combinedPreferences.length).fill(false));

    } catch (error) {
      console.error('Error fetching preferences:', error.response?.data?.message || error.message);
    }
  }

  useEffect(() => {
    getPerferences();
  }, []);

  const handlePreferenceKeyChange = (questionId, key) => {
    const selectedPref = allPreferences.find(item => item.key === key);
    if (selectedPref) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(q => 
          q.id === questionId ? {
            ...q,
            key: selectedPref.key,
            type: selectedPref.type,
            section: selectedPref.section,
            question: selectedPref.type === "date" 
              ? `When is your ${selectedPref.key}?` 
              : `What is your ${selectedPref.key}?`,
            options: selectedPref.options || []
          } : q
        )
      }));
    }
  };

  const togglePreferenceDropdown = (questionIndex, isOpen) => {
    const newDropdownState = [...isPreferenceDropdownOpen];
    newDropdownState[questionIndex] = isOpen !== undefined 
      ? isOpen 
      : !newDropdownState[questionIndex];
    setIsPreferenceDropdownOpen(newDropdownState);
  };

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || "",
        description: campaign.description || "",
        loyaltyPoints: campaign.loyaltyPoints || "",
        questions: campaign.questionsData || [
          {
            id: 1,
            key: "",
            question: "",
            type: "string",
            section: "additionalData",
            options: [],
          },
        ],
      });
    }
  }, [campaign]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuestionChange = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    }));
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
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
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, options: [...q.options, ""] } : q
      ),
    }));
  };

  const removeOption = (questionId, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
          : q
      ),
    }));
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      key: "",
      question: "",
      type: "string",
      section: "additionalData",
      options: [],
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setIsPreferenceDropdownOpen([...isPreferenceDropdownOpen, false]);
  };

  const removeQuestion = (questionId) => {
    if (formData.questions.length > 1) {
      const questionIndex = formData.questions.findIndex(q => q.id === questionId);
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
      }));
      const newDropdownState = [...isPreferenceDropdownOpen];
      newDropdownState.splice(questionIndex, 1);
      setIsPreferenceDropdownOpen(newDropdownState);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    // Validate required fields
    if (!formData.title.trim()) {
      console.error('Quiz title is required');
      return;
    }
    
    if (!formData.loyaltyPoints || formData.loyaltyPoints <= 0) {
      console.error('Loyalty points must be a positive number');
      return;
    }
    
    // Validate questions
    for (const question of formData.questions) {
      if (!question.key.trim()) {
        console.error('All questions must have a preference key selected');
        return;
      }
      if (!question.question.trim()) {
        console.error('All questions must have question text');
        return;
      }
      if (question.type === 'options' && question.options.length === 0) {
        console.error('Questions with options type must have at least one option');
        return;
      }
    }

    const campaignData = {
      campaignName: formData.title,
      description: formData.description,
      loyaltyPoints: parseInt(formData.loyaltyPoints),
      questions: formData.questions.map(q => ({
        key: q.key,
        question: q.question,
        type: q.type,
        section: q.section,
        ...(q.options.length > 0 && { options: q.options }),
        ...(q.iconUrl && { iconUrl: q.iconUrl })
      }))
    };

    setIsSubmitting(true);
    
    try {
      const response = await api.post('/api/quiz', campaignData);
      console.log('Quiz created successfully:', response.data);
      
      // Call the onSave callback with the response data
      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      console.error('Error creating quiz:', error.response?.data?.message || error.message);
      // You can replace this with proper toast notification
      // showToast(error.response?.data?.message || 'Failed to create quiz', 'error');
    } finally {
      setIsSubmitting(false);
    }
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

        {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter quiz description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
            rows={3}
          />
        </div> */}

        {/* Questions Section */}
        {formData.questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="bg-[#31316612] rounded-lg p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex w-full justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Question {qIndex + 1}
                  </h3>
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => togglePreferenceDropdown(qIndex)}
                    className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
                  >
                    <span className="text-sm truncate">
                      {question.key || "Select a preference"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isPreferenceDropdownOpen[qIndex] && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      {allPreferences.map((pref) => (
                        <button
                          key={`${pref.key}-${qIndex}`}
                          type="button"
                          onClick={() => {
                            handlePreferenceKeyChange(question.id, pref.key);
                            togglePreferenceDropdown(qIndex, false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 outline-none truncate"
                        >
                          {pref.key}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
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

            {question.type === "options" && (
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

            {question.type !== "options" && (
              <div>
                <input
                  type={question.type === "date" ? "date" : 
                        question.type === "number" ? "number" : 
                        question.type === "boolean" ? "checkbox" : "text"}
                  placeholder={`Enter your ${question.key || "answer"}`}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white ${
                    question.type === "checkbox" ? "w-auto" : ""
                  }`}
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
            disabled={isSubmitting}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            {isSubmitting ? 'Creating Quiz...' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;