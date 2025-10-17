import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, X, Check, ChevronDown } from "lucide-react";
import AddOption from "../common/AddOption";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const QuizForm = ({ quiz, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    trigger,
  } = useForm({
    defaultValues: {
      title: "",
      loyaltyPoints: "",
      questions: [
        {
          id: 1,
          key: "",
          question: "",
          type: "string",
          section: "additionalData",
          options: [],
          iconUrl: "",
          iconName: "",
        },
      ],
    },
    mode: "onChange",
  });

  const [retailerId, setRetailerId] = useState(() => {
    return localStorage.getItem("retailerId") || "";
  });

  const [allPreferences, setAllPreferences] = useState([]);
  const [isPreferenceDropdownOpen, setIsPreferenceDropdownOpen] = useState([]);
  const questions = watch("questions");

  async function getPerferences() {
    try {
      const response = await api.get(`/api/customer-preferences/${retailerId}`);
      const preference = response?.data;

      const combinedPreferences = [
        ...(preference.additionalData?.map((item) => ({
          ...item,
          section: "additionalData",
        })) || []),
        ...(preference.advancedDetails?.map((item) => ({
          ...item,
          section: "advancedDetails",
        })) || []),
        ...(preference.advancedPrivacyDetails?.map((item) => ({
          ...item,
          section: "advancedPrivacyDetails",
        })) || []),
      ];

      setAllPreferences(combinedPreferences);
      setIsPreferenceDropdownOpen(
        new Array(combinedPreferences.length).fill(false)
      );
    } catch (error) {
      console.error(
        "Error fetching preferences:",
        error.response?.data?.message || error.message
      );
    }
  }

  useEffect(() => {
    getPerferences();
  }, []);

  useEffect(() => {
    if (quiz) {
      setValue("title", quiz.campaignName || "");
      setValue("loyaltyPoints", quiz.loyaltyPoints || "");
      setValue(
        "questions",
        (quiz.questions || []).map((q, idx) => ({
          id: typeof q.id !== "undefined" ? q.id : Date.now() + idx,
          key: q.key || "",
          question: q.question || "",
          type: q.type || "string",
          section: q.section || "additionalData",
          options: Array.isArray(q.options) ? q.options : [],
          iconUrl: q.iconUrl || "",
          iconName: q.iconName,
        }))
      );
    }
  }, [quiz, setValue]);

  const handlePreferenceKeyChange = (questionIndex, key) => {
    const selectedPref = allPreferences.find((item) => item.key === key);
    if (selectedPref) {
      const questionPath = `questions.${questionIndex}`;

      setValue(`${questionPath}.key`, selectedPref.key);
      setValue(`${questionPath}.type`, selectedPref.type);
      setValue(`${questionPath}.section`, selectedPref.section);
      setValue(
        `${questionPath}.question`,
        selectedPref.type === "date"
          ? `When is your ${selectedPref.key}?`
          : `What is your ${selectedPref.key}?`
      );
      setValue(`${questionPath}.options`, selectedPref.options || []);

      // Add these two lines to set the icon properties
      setValue(`${questionPath}.iconUrl`, selectedPref.iconUrl || "");
      setValue(`${questionPath}.iconName`, selectedPref.iconName || "");

      // Clear errors for this question
      clearErrors(`questions.${questionIndex}.key`);
      clearErrors(`questions.${questionIndex}.question`);
    }
  };

  const togglePreferenceDropdown = (questionIndex, isOpen) => {
    const newDropdownState = [...isPreferenceDropdownOpen];
    newDropdownState[questionIndex] =
      isOpen !== undefined ? isOpen : !newDropdownState[questionIndex];
    setIsPreferenceDropdownOpen(newDropdownState);
  };

  const addOption = (questionIndex) => {
    const currentOptions = questions[questionIndex]?.options || [];
    const newOptions = [...currentOptions, ""];
    setValue(`questions.${questionIndex}.options`, newOptions);

    // Clear options error
    clearErrors(`questions.${questionIndex}.options`);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const currentOptions = questions[questionIndex]?.options || [];
    const newOptions = currentOptions.filter((_, idx) => idx !== optionIndex);
    setValue(`questions.${questionIndex}.options`, newOptions);
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
    const currentQuestions = questions || [];
    setValue("questions", [...currentQuestions, newQuestion]);
    setIsPreferenceDropdownOpen([...isPreferenceDropdownOpen, false]);
  };

  const removeQuestion = (questionIndex) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, idx) => idx !== questionIndex);
      setValue("questions", newQuestions);
      const newDropdownState = [...isPreferenceDropdownOpen];
      newDropdownState.splice(questionIndex, 1);
      setIsPreferenceDropdownOpen(newDropdownState);
    }
  };

  const onSubmit = async (data) => {
    const baseData = {
      campaignName: data.title,
      quizName: data.title,
      description: data.description,
      loyaltyPoints: parseInt(data.loyaltyPoints) || 0,
      quizFor: "quiz",
      questions: data.questions.map((q) => ({
        key: q.key,
        question: q.question,
        type: q.type,
        section: q.section,
        ...(Array.isArray(q.options) &&
          q.options.length > 0 && { options: q.options }),
        iconName: q.iconName || "", // Ensure this is included
        iconUrl: q.iconUrl || "", // Ensure this is include
      })),
    };

    try {
      let response;
      if (quiz && quiz._id) {
        const payload = {
          ...baseData,
          retailerId,
          _id: quiz._id,
          isActive: typeof quiz.isActive === "boolean" ? quiz.isActive : true,
        };
        response = await api.put(`/api/quiz/${quiz._id}`, payload);
        showToast("Quiz updated successfully", "success");
      } else {
        response = await api.post("/api/quiz", { ...baseData, retailerId });
        showToast("Quiz created successfully", "success");
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "An error occurred", "error");
    }
  };

  const validateLoyaltyPoints = (value) => {
    if (value === "" || value === null || value === undefined) return true; // optional field

    if (!/^\d+$/.test(value)) return "Loyalty points must contain only numbers";

    const points = parseInt(value, 10);
    if (points < 0) return "Loyalty points cannot be negative";
    if (points > 10000) return "Loyalty points cannot exceed 10,000";

    return true;
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {quiz ? "Edit Quiz" : "Create Quiz"}
        </h2>
        <div className="flex items-center space-x-4">
          <span className="text-slate-600">Loyalty Point</span>
          <div className="flex flex-col">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter Value"
              {...register("loyaltyPoints", {
                validate: validateLoyaltyPoints,
              })}
              className={`px-3 py-1 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${
                errors.loyaltyPoints ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.loyaltyPoints && (
              <span className="text-red-500 text-xs mt-1">
                {errors.loyaltyPoints.message}
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            placeholder="Enter quiz title"
            {...register("title", {
              required: "Quiz title is required",
              minLength: {
                value: 3,
                message: "Title should have at least 3 characters",
              },
              maxLength: {
                value: 50,
                message: "Title should not exceed 50 characters",
              },
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <span className="text-red-500 text-sm mt-1 block">
              {errors.title.message}
            </span>
          )}
        </div>

        {/* Questions Section */}
        {questions?.map((question, qIndex) => (
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
                      className={`flex items-center justify-between w-48 px-3 py-2 bg-white border rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none ${
                        errors.questions?.[qIndex]?.key
                          ? "border-red-500"
                          : "border-gray-300"
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
                              handlePreferenceKeyChange(qIndex, pref.key);
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
                      {errors.questions[qIndex].key.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <Controller
                name={`questions.${qIndex}.question`}
                control={control}
                rules={{ required: "Question text is required" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your Question"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white ${
                      errors.questions?.[qIndex]?.question
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                )}
              />
              {errors.questions?.[qIndex]?.question && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.questions[qIndex].question.message}
                </span>
              )}
            </div>

            {question.type === "options" && (
              <div className="space-y-3">
                {question.options?.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-3">
                    <span className="font-medium text-slate-600 w-6">
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <Controller
                      name={`questions.${qIndex}.options.${optIndex}`}
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Enter Options"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none bg-white"
                        />
                      )}
                    />
                    <button type="button" className="text-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, optIndex)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <AddOption onClick={() => addOption(qIndex)} />
                {errors.questions?.[qIndex]?.options && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.questions[qIndex].options.message}
                  </span>
                )}
              </div>
            )}

            {question.type !== "options" && (
              <div>
                <input
                  type={
                    question.type === "date"
                      ? "date"
                      : question.type === "number"
                      ? "number"
                      : question.type === "boolean"
                      ? "checkbox"
                      : "text"
                  }
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
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-pink-600 hover:bg-pink-700"
            }`}
          >
            {isSubmitting
              ? quiz
                ? "Updating Quiz..."
                : "Creating Quiz..."
              : quiz
              ? "Update Quiz"
              : "Create Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
