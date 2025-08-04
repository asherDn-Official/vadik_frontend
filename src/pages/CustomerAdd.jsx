// ParentComponent.jsx
import { ArrowLeft } from "lucide-react";
import CustomerForm from "../components/customerProfile/CustomerForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/apiconfig";

const CustomerAdd = () => {
    const navigate = useNavigate();
    const [retailerId, setRetailerId] = useState(() => {
        return localStorage.getItem("retailerId") || "";
    });
    const [resetForm, setResetForm] = useState(false);

    const handleSubmit = async (customerData) => {
        // Format data for API
        const apiData = {
            ...customerData,
            retailerId: retailerId,
        };

        try {
            const response = await api.post('/api/customers', apiData);
            const newCustomer = response.data;
            alert("Customer added successfully!");

            // Navigate to the newly created customer's profile
            navigate(`/customer-profile/${newCustomer._id}`);

        } catch (error) {
            console.error('Error adding customer:', error);
            alert('Failed to add customer. Please try again.');
        }

    };

    const handleBackClick = () => {
        navigate("/customers");
    }

    return (
        <div className="flex h-screen bg-[#F4F5F9]">
            <div className="p-14">
                <button className="flex gap-2" onClick={handleBackClick}>
                    <ArrowLeft /> Back
                </button>
                <div className=" p-4   max-w-2xl ">
                    <h1 className="text-xl font-bold mb-4">Add New Customer</h1>

                    {/* <h2>Create New Customer</h2> */}
                    <div className=" max-w-2xl  flex justify-center items-center mt-3">

                        <CustomerForm onSubmit={handleSubmit} resetForm={resetForm} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAdd;