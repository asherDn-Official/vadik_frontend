import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/apiconfig";

const PlanContext = createContext();

const PlanProvider = ({ children }) => {
    const [currentPlans, setCurrentPlans] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isCurrentPlansAvailable = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/subscriptions/credit/usage");
            if (response.data) {
                setCurrentPlans(response.data);
            } else {
                setCurrentPlans(null);
            }
        } catch (error) {
            console.error("Error fetching current plans:", error);
            if (error.response?.status === 404) {
                setCurrentPlans(null);
            } else {
                setError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        isCurrentPlansAvailable();
    }, []);

    const refreshPlans = async () => {
        await isCurrentPlansAvailable();
    };

    return (
        <PlanContext.Provider value={{ 
            currentPlans, 
            setCurrentPlans, 
            loading, 
            error,
            refreshPlans,
            isCurrentPlansAvailable 
        }}>
            {children}
        </PlanContext.Provider>
    );
}

export const usePlan = () => useContext(PlanContext);

export default PlanProvider;