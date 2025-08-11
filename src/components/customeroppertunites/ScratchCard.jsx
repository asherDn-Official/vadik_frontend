import React, { useState } from "react";
import ScratchCardList from "./ScratchCardList";
import ScratchCardForm from "./ScratchCardForm";
import { ArrowLeft } from "lucide-react";

const ScratchCard = () => {
    const [scratchCards, setScratchCards] = useState([
        { id: 1, title: "Summer Sale Scratch", offers: 5 },
        { id: 2, title: "Welcome Bonus Card", offers: 3 },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [editingScratchCard, setEditingScratchCard] = useState(null);

    const handleCreate = () => {
        setEditingScratchCard(null);
        setShowForm(true);
    };

    const handleEdit = (quiz) => {
        setEditingScratchCard(quiz);
        setShowForm(true);
    };

    const handleSave = (quizData) => {
        if (editingScratchCard) {
            setScratchCards(prev =>
                prev.map(q => q.id === editingScratchCard.id ? { ...quizData, id: editingScratchCard.id } : q)
            );
        } else {
            setScratchCards(prev => [...prev, { ...quizData, id: Date.now() }]);
        }
        setShowForm(false);
    };

    const handleDelete = (id) => {
        setScratchCards(prev => prev.filter(q => q.id !== id));
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
                    <ScratchCardForm
                        quiz={editingScratchCard}
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
                    {scratchCards.length} Quiz Activities
                </h3>
                <button
                    onClick={handleCreate}
                    className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
                >
                    Create Quiz
                </button>
            </div>
            <ScratchCardList
                activities={scratchCards}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ScratchCard;