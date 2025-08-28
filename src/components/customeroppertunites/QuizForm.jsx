import React, { useState, useEffect } from "react";
import { Plus, X, Check, ChevronDown } from "lucide-react";
import AddOption from "../common/AddOption";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const QuizForm = ({ quiz, onSave, onCancel }) => {

  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      console.error('Attempted to render object:', value);
      return JSON.stringify(value);
    }
    return String(value);
  };
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
  const [errors, setErrors] = useState({});

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

      // Clear key and question errors when preference is selected (since both fields get filled)
      if (errors.questions) {
        const questionIndex = formData.questions.findIndex(q => q.id === questionId);
        if (errors.questions[questionIndex] && (errors.questions[questionIndex].key || errors.questions[questionIndex].question)) {
          setErrors(prev => {
            const newQuestionErrors = { ...prev.questions };
            if (newQuestionErrors[questionIndex] && typeof newQuestionErrors[questionIndex] === 'object') {
              const currentErrors = newQuestionErrors[questionIndex];
              const { key, question, ...otherErrors } = currentErrors;
              if (Object.keys(otherErrors).length > 0) {
                newQuestionErrors[questionIndex] = otherErrors;
              } else {
                delete newQuestionErrors[questionIndex];
              }
            }
            return {
              ...prev,
              questions: Object.keys(newQuestionErrors).length > 0 ? newQuestionErrors : undefined
            };
          });
        }
      }
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
    if (quiz) {
      setFormData({
        title: quiz.campaignName || "",
        description: quiz.description || "",
        loyaltyPoints: quiz.loyaltyPoints || "",
        questions: (quiz.questions || []).map((q, idx) => ({
          // ensure local editing id exists for each question
          id: typeof q.id !== 'undefined' ? q.id : Date.now() + idx,
          key: q.key || "",
          question: q.question || "",
          type: q.type || "string",
          section: q.section || "additionalData",
          options: Array.isArray(q.options) ? q.options : [],
          iconUrl: q.iconUrl || ""
        }))
      });
    }
  }, [quiz]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleQuestionChange = (questionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    }));

    // Clear question error when user starts typing
    if (errors.questions) {
      const questionIndex = formData.questions.findIndex(q => q.id === questionId);
      if (errors.questions[questionIndex] && errors.questions[questionIndex][field]) {
        setErrors(prev => {
          const newQuestionErrors = { ...prev.questions };
          if (newQuestionErrors[questionIndex]) {
            const updatedQuestionErrors = { ...newQuestionErrors[questionIndex] };
            delete updatedQuestionErrors[field];
            if (Object.keys(updatedQuestionErrors).length > 0) {
              newQuestionErrors[questionIndex] = updatedQuestionErrors;
            } else {
              delete newQuestionErrors[questionIndex];
            }
          }
          return {
            ...prev,
            questions: Object.keys(newQuestionErrors).length > 0 ? newQuestionErrors : undefined
          };
        });
      }
    }
  };

  const handleOptionChange = (questionId, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? {
            ...q,
            options: (Array.isArray(q.options) ? q.options : []).map((opt, idx) =>
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
        q.id === questionId ? { ...q, options: [...(Array.isArray(q.options) ? q.options : []), ""] } : q
      ),
    }));

    // Clear options error when option is added
    if (errors.questions) {
      const questionIndex = formData.questions.findIndex(q => q.id === questionId);
      if (errors.questions[questionIndex] && errors.questions[questionIndex].options) {
        setErrors(prev => {
          const newQuestionErrors = { ...prev.questions };
          if (newQuestionErrors[questionIndex]) {
            const updatedQuestionErrors = { ...newQuestionErrors[questionIndex] };
            delete updatedQuestionErrors.options;
            if (Object.keys(updatedQuestionErrors).length > 0) {
              newQuestionErrors[questionIndex] = updatedQuestionErrors;
            } else {
              delete newQuestionErrors[questionIndex];
            }
          }
          return {
            ...prev,
            questions: Object.keys(newQuestionErrors).length > 0 ? newQuestionErrors : undefined
          };
        });
      }
    }
  };

  const removeOption = (questionId, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId
          ? { ...q, options: (Array.isArray(q.options) ? q.options : []).filter((_, idx) => idx !== optionIndex) }
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

  const validateForm = () => {
    const newErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Quiz title is required';
    }

    // Validate loyalty points
    if (!formData.loyaltyPoints) {
      newErrors.loyaltyPoints = 'Loyalty points is required';
    } else if (!/^\d+$/.test(formData.loyaltyPoints)) {
      newErrors.loyaltyPoints = 'Loyalty points must contain only numbers';
    } else {
      const points = parseInt(formData.loyaltyPoints, 10);

      if (points <= 0) {
        newErrors.loyaltyPoints = 'Loyalty points must be a positive number';
      } else if (points > 10000) {
        newErrors.loyaltyPoints = 'Loyalty points cannot exceed 10,000';
      }
    }

    // Validate questions
    const questionErrors = {};
    formData.questions.forEach((question, index) => {
      const questionError = {};

      if (!question.key.trim()) {
        questionError.key = 'Please select a preference key';
      }

      if (!question.question.trim()) {
        questionError.question = 'Question text is required';
      }

      if (question.type === 'options' && (!Array.isArray(question.options) || question.options.length === 0)) {
        questionError.options = 'At least one option is required for multiple choice questions';
      }

      if (Object.keys(questionError).length > 0) {
        questionErrors[index] = questionError;
      }
    });

    if (Object.keys(questionErrors).length > 0) {
      newErrors.questions = questionErrors;
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission

    // Validate form
    if (!validateForm()) {
      return;
    }

    const baseData = {
      campaignName: formData.title,
      quizName: formData.title,
      description: formData.description,
      loyaltyPoints: parseInt(formData.loyaltyPoints),
      quizFor: "quiz",
      questions: formData.questions.map(q => ({
        key: q.key,
        question: q.question,
        type: q.type,
        section: q.section,
        ...(Array.isArray(q.options) && q.options.length > 0 && { options: q.options }),
        ...(q.iconUrl && { iconUrl: q.iconUrl })
      }))
    };

    setIsSubmitting(true);

    try {
      let response;
      if (quiz && quiz._id) {
        const payload = {
          ...baseData,
          retailerId,
          _id: quiz._id,
          isActive: typeof quiz.isActive === 'boolean' ? quiz.isActive : true,
        };
        response = await api.put(`/api/quiz/${quiz._id}`, payload);
        showToast('Quiz updated successfully:', 'success');
      } else {
        response = await api.post('/api/quiz', { ...baseData, retailerId });
        showToast('Quiz created successfully:', "success");
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      showToast(error.response?.data?.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{quiz ? 'Edit Quiz' : 'Create Quiz'}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-slate-600">Loyalty Point</span>
          <div className="flex flex-col">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter Value"
              value={formData.loyaltyPoints}
              onChange={(e) => handleInputChange("loyaltyPoints", e.target.value)}
              className={`px-3 py-1 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.loyaltyPoints ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.loyaltyPoints && (
              <span className="text-red-500 text-xs mt-1">{safeRender(errors.loyaltyPoints)}</span>
            )}
          </div>
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
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
          // required
          />
          {errors.title && (
            <span className="text-red-500 text-sm mt-1 block">{safeRender(errors.title)}</span>
          )}
        </div>

    
        {/* Questions Section */}
        {formData.questions.map((question, qIndex) => (
          <div
            key={question.id}
            className="bg-[#31316612] rounded-lg p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex w-full justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Question {qIndex + 1}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => togglePreferenceDropdown(qIndex)}
                      className={`flex items-center justify-between w-48 px-3 py-2 bg-white border rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${errors.questions?.[qIndex]?.key ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                  {errors.questions?.[qIndex]?.key && (
                    <span className="text-red-500 text-xs mt-1 w-48 text-right">
                      {safeRender(errors.questions[qIndex].key)}
                    </span>
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white ${errors.questions?.[qIndex]?.question ? 'border-red-500' : 'border-gray-300'
                  }`}
              // required
              />
              {errors.questions?.[qIndex]?.question && (
                <span className="text-red-500 text-sm mt-1 block">
                  {safeRender(errors.questions[qIndex].question)}
                </span>
              )}
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
                {errors.questions?.[qIndex]?.options && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {safeRender(errors.questions[qIndex].options)}
                  </span>
                )}
              </div>
            )}

            {question.type !== "options" && (
              <div>
                <input
                  type={question.type === "date" ? "date" :
                    question.type === "number" ? "number" :
                      question.type === "boolean" ? "checkbox" : "text"}
                  placeholder={`Enter your ${question.key || "answer"}`}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white ${question.type === "checkbox" ? "w-auto" : ""
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
            className={`px-6 py-2 text-white rounded-lg transition-colors ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-pink-600 hover:bg-pink-700'
              }`}
          >
            {isSubmitting ? (quiz ? 'Updating Quiz...' : 'Creating Quiz...') : (quiz ? 'Update Quiz' : 'Create Quiz')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;