import React, { useEffect, useState } from "react";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";
import { ArrowLeft } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import { get } from "react-hook-form";
import deleteConfirmTostNotification from "../../utils/deleteConfirmTostNotification";

// Add optional props: backButton to control visibility and onClose to notify parent (e.g., close modal)
const Quiz = ({ backButton = true, onClose }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [pagination, setPagination] = useState(null);

  async function getQuizeList(page = 1, limit = 10) {
    try {
      let res = await api.get(`/api/quiz?page=${page}&limit=${limit}`);
      setQuizzes(res.data.docs);
      setPagination(res.data);
    } catch (err) {
      console.log("err", err)
    }
  }

  useEffect(() => {
    getQuizeList()
  }, [])

  const handlePageChange = (page, limit) => {
    getQuizeList(page, limit);
  };

  const handleCreate = () => {
    setEditingQuiz(null);
    setShowForm(true);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleSave = () => {
    // After create or update, refresh from server to keep data shape consistent
    getQuizeList();
    setShowForm(false);
    setEditingQuiz(null);
  };

  const handleDelete = (id) => {
    const deleteOperations = async () => {
      try {
        const response = await api.delete(`/api/quiz/${id}`);
        showToast('Deleted Successfully!', 'success');
        getQuizeList();
      } catch (error) {
        showToast(error.response.data.message, 'error')
      }
    }
    deleteConfirmTostNotification("delete", deleteOperations)
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          {backButton && (
            <button
              onClick={() => (onClose ? onClose() : setShowForm(false))}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />  
              Back
            </button>
          )}
          <QuizForm
            quiz={editingQuiz}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          {/* {backButton && (
            <button
              onClick={() => (onClose ? onClose() : null)}
              className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )} */}
          <h3 className="text-lg font-semibold text-slate-800">
            {pagination?.totalDocs || quizzes.length} Quiz Activities
          </h3>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
        >
          Create Quiz
        </button>
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