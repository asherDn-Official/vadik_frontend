import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';

const CustomerForm = ({ onSubmit, resetForm }) => {
    // Initialize form state
    const initialFormData = {
        firstname: '',
        lastname: '',
        mobileNumber: '',
        source: 'walk-in' // Default value
    };
    
    const [formData, setFormData] = useState(initialFormData);

    // Reset form when resetForm prop changes
    useEffect(() => {
        if (resetForm) {
            setFormData(initialFormData);
        }
    }, [resetForm]);

    // Handle text input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle phone input changes
    const handlePhoneChange = (value) => {
        setFormData(prev => ({ ...prev, mobileNumber: value }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm text-[#31316680]">
                        First Name *
                    </label>
                    <input
                        type="text"
                        name="firstname"
                        placeholder='First Name'
                        value={formData.firstname}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm text-[#31316680]">
                        Last Name
                    </label>
                    <input
                        type="text"
                        name="lastname"
                        placeholder='Last Name'
                        value={formData.lastname}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm text-[#31316680]">
                        Mobile Number *
                    </label>
                    <PhoneInput
                        international
                        defaultCountry="IN"
                        value={formData.mobileNumber}
                        onChange={handlePhoneChange}
                        className="w-full p-2 border border-gray-300 rounded text-[#313166]"
                        inputStyle={{ width: "100%", padding: "0.5rem" }}
                        dropdownClass="text-gray-700"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm text-[#31316680]">
                        Source *
                    </label>
                    <select
                        name="source"
                        value={formData.source}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded text-[#313166] bg-white"
                        required
                    >
                        <option value="walk-in">Walk-in</option>
                        <option value="online">Online</option>
                        <option value="order">Order</option>
                    </select>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white bg-gradient-to-r from-[#CB376D] to-[#A72962] rounded hover:bg-pink-700 transition"
                >
                    Create Customer
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;