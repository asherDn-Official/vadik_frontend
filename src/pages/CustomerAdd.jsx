// ParentComponent.jsx
import { ArrowLeft } from "lucide-react";
import CustomerForm from "../components/customerProfile/CustomerForm";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/apiconfig";
import showToast from "../utils/ToastNotification";
import { usePlan } from "../context/PlanContext";

const CustomerAdd = () => {
    const navigate = useNavigate();
    const { refreshPlans, currentPlans } = usePlan();
    const [whatsappConfig, setWhatsappConfig] = useState(null);
    const [retailerId, setRetailerId] = useState(() => {
        return localStorage.getItem("retailerId") || "";
    });

    // Fetch WhatsApp configuration
    useEffect(() => {
        const fetchWhatsappConfig = async () => {
            try {
                const response = await api.get("/api/integrationManagement/whatsapp/config");
                if (response.data.status) {
                    setWhatsappConfig(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching WhatsApp config:", error);
            }
        };
        fetchWhatsappConfig();
        refreshPlans();
    }, []);

    const isLowCredits = whatsappConfig && !whatsappConfig.isUsingOwnWhatsapp && currentPlans?.data?.whatsapp?.remaining <= 0;
    const [resetForm, setResetForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (customerData) => {
        const apiData = {
            ...customerData,
            retailerId: retailerId,
        };

        setIsSubmitting(true);

        try {
            const response = await api.post('/api/customers', apiData);
            const newCustomer = response.data;
            showToast('Customer added successfully!', 'success');

            navigate(`/customers/customer-profile/${newCustomer._id}`);

        } catch (error) {
            console.error(error.response.data.error);
            showToast(error.response.data.error, 'error');

        } finally {
            setIsSubmitting(false);
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
                    {isLowCredits && (
                        <p className="text-red-600 font-semibold text-sm mb-4">
                            ⚠️ You have low WhatsApp credits. Please top up your credits in the subscription page to continue using Vadik's default WhatsApp account. Adding a new customer will not send an opt-in message.
                        </p>
                    )}
                    <div className=" max-w-2xl  flex justify-center items-center mt-3">

                        <CustomerForm onSubmit={handleSubmit} resetForm={resetForm} isSubmitting={isSubmitting} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerAdd;