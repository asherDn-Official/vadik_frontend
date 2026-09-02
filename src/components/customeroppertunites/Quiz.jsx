import React, { useEffect, useState } from "react";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";
import { ArrowLeft } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import deleteConfirmTostNotification from "../../utils/deleteConfirmTostNotification";

const Quiz = ({ backButton = true, onClose }) => {
  const AI_ENABLED_RETAILER_ID =
  "68a8219ecfbeaf1f70936f07";

const retailerId =
  localStorage.getItem("retailerId");

const canBuildWithAI =
  retailerId === AI_ENABLED_RETAILER_ID;
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [pagination, setPagination] = useState(null);


  const [buildWithAI, setBuildWithAI] = useState(false);

  async function getQuizeList(page = 1, limit = 10) {
    try {
      const res = await api.get(`/api/quiz?page=${page}&limit=${limit}`);

      setQuizzes(res.data.docs);
      setPagination(res.data);
    } catch (err) {
      console.log("err", err);
    }
  }

  useEffect(() => {
    getQuizeList();
  }, []);

  const handlePageChange = (page, limit) => {
    getQuizeList(page, limit);
  };


  const handleCreate = () => {
    setEditingQuiz(null);
    setBuildWithAI(false);
    setShowForm(true);
  };

  const handleBuildWithAI = () => {
    setEditingQuiz(null);
    setBuildWithAI(true);
    setShowForm(true);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setBuildWithAI(false);
    setShowForm(true);
  };

  const handleSave = () => {
    getQuizeList();

    setShowForm(false);
    setEditingQuiz(null);
    setBuildWithAI(false);
  };

  const handleDelete = (id) => {
    const deleteOperations = async () => {
      try {
        await api.delete(`/api/quiz/${id}`);

        showToast("Deleted Successfully!", "success");

        getQuizeList();
      } catch (error) {
        showToast(error.response?.data?.message, "error");
      }
    };

    deleteConfirmTostNotification("delete", deleteOperations);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          {backButton && (
            <button
              onClick={() => {
                setShowForm(false);
                setBuildWithAI(false);

                if (onClose) {
                  onClose();
                }
              }}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          )}

          <QuizForm
            quiz={editingQuiz}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setBuildWithAI(false);
            }}
            buildWithAI={buildWithAI}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-slate-800">
            {pagination?.totalDocs || quizzes.length} Quiz Activities
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {canBuildWithAI && (
  <button
    onClick={handleBuildWithAI}
    className="flex items-center px-4 py-2 text-white bg-[#313166] rounded-[10px] hover:opacity-90 transition-colors"
  >
    Build with AI
  </button>
)}

          <button
            onClick={handleCreate}
            className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            Create Quiz
          </button>
        </div>
      </div>

      <QuizList
        activities={quizzes}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default Quiz;