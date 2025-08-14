import React, { useState, useEffect } from "react";
import ScratchCardList from "./ScratchCardList";
import ScratchCardForm from "./ScratchCardForm";
import { ArrowLeft } from "lucide-react";
import api from "../../api/apiconfig";

const ScratchCard = () => {
    const [scratchCards, setScratchCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingScratchCard, setEditingScratchCard] = useState(null);

    const fetchScratchCards = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/scratchCards/scratchCard/all');
            const list = res?.data?.data || [];
            // Normalize to existing list card shape for display
            const mapped = list.map((item) => ({
                id: item._id,
                title: item.name,
                offers: 1, // Not provided by API; placeholder
                raw: item,
            }));
            setScratchCards(mapped);
        } catch (e) {
            console.error('Failed to load scratch cards', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScratchCards();
    }, []);

    const handleCreate = () => {
        setEditingScratchCard(null);
        setShowForm(true);
    };

    const handleEdit = (item) => {
        // Pass full raw record when available for edit-prefill
        setEditingScratchCard(item?.raw ? { ...item.raw, _id: item.id } : item);
        setShowForm(true);
    };

    const handleSave = async () => {
        // After form submit, refresh list
        await fetchScratchCards();
        setShowForm(false);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/scratchCards/${id}`);
            await fetchScratchCards();
        } catch (e) {
            console.error('Failed to delete scratch card', e);
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
                    <ScratchCardForm
                        campaign={editingScratchCard}
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
                    {scratchCards.length} Scratch Cards
                </h3>
                <button
                    onClick={handleCreate}
                    className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
                >
                    Create Scratch Card
                </button>
            </div>
            <ScratchCardList
                activities={scratchCards}
                onEdit={handleEdit}
                onDelete={(id)=>handleDelete(id)}
            />
        </div>
    );
};

export default ScratchCard;