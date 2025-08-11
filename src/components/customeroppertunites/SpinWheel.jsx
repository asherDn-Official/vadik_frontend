import React, { useState } from "react";
import SpinWheelList from "./SpinWheelList";
import SpinWheelForm from "./SpinWheelForm";
import { ArrowLeft } from "lucide-react";

const SpinWheel = () => {
    const [spinWheels, setSpinWheels] = useState([
        { id: 1, title: "Spin Wheel 1", spins: 8 },
        { id: 2, title: "Spin Wheel 2", spins: 6 },
        { id: 3, title: "Spin Wheel 3", spins: 3 },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [editingSpinWheel, setEditingSpinWheel] = useState(null);

    const handleCreate = () => {
        setEditingSpinWheel(null);
        setShowForm(true);
    };

    const handleEdit = () => {
        setEditingSpinWheel();
        setShowForm(true);
    };

    const handleSave = (spinWheels) => {
        if (editingSpinWheel) {
            setSpinWheels(prev =>
                prev.map(q => q.id === editingSpinWheel.id ? { ...spinWheels, id: editingSpinWheel.id } : q)
            );
        } else {
            setSpinWheels(prev => [...prev, { ...spinWheels, id: Date.now() }]);
        }
        setShowForm(false);
    };

    const handleDelete = (id) => {
        setSpinWheels(prev => prev.filter(q => q.id !== id));
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
          <SpinWheelForm 
            quiz={editingSpinWheel} 
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
          {spinWheels.length} Quiz Activities
        </h3>
        <button
          onClick={handleCreate}
          className="flex items-center text-[#313166] px-4 py-2 bg-white border border-[#313166] rounded-[10px] hover:bg-gray-50 transition-colors"
        >
          Create Quiz
        </button>
      </div>
      <SpinWheelList 
        activities={spinWheels} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default SpinWheel;