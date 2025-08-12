import React, { useEffect, useState } from "react";
import QuizList from "./QuizList";
import QuizForm from "./QuizForm";
import { ArrowLeft } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";
import { get } from "react-hook-form";

const Quiz = () => {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: "Special Day Quizz", questions: 8 },
    { id: 2, title: "Favourite Product Quizz", questions: 6 },
    { id: 3, title: "Personal Details Quiz", questions: 3 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  async function getQuizeList() {
    try {
      let res = await api.get('/api/quiz');
      setQuizzes(res.data);
    } catch (err) {
      console.log("err", err)
    }
  }

  useEffect(() => {
    getQuizeList()
  }, [])

  const handleCreate = () => {
    setEditingQuiz(null);
    setShowForm(true);
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setShowForm(true);
  };

  const handleSave = (quizData) => {
    // Transform the quiz data to match the expected format for QuizList
    const transformedQuiz = {
      id: editingQuiz ? editingQuiz.id : Date.now(),
      title: quizData.title || quizData.campaignName || 'Untitled Quiz',
      questions: Array.isArray(quizData.questions) ? quizData.questions.length : (quizData.questions || 0)
    };

    if (editingQuiz) {
      setQuizzes(prev =>
        prev.map(q => q.id === editingQuiz.id ? transformedQuiz : q)
      );
    } else {
      setQuizzes(prev => [...prev, transformedQuiz]);
    }
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/api/quiz/${id}`);
      showToast('Deleted Successfully!', 'success');
      getQuizeList();
    } catch (error) {
      showToast(error.response.data.message,'error')
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
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
        <h3 className="text-lg font-semibold text-slate-800">
          {quizzes.length} Quiz Activities
        </h3>
        <button
          onClick={handleCreate}
          className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
        >
          Create Quiz
        </button>
      </div>
      <QuizList
        activities={quizzes}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Quiz;