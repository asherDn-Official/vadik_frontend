import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/apiconfig";
import { useAuth } from "./AuthContext";

const PlanContext = createContext();

const PlanProvider = ({ children }) => {
    const { auth, loading: authLoading } = useAuth();
    const [currentPlans, setCurrentPlans] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAuthenticated = Boolean(auth);
    const token = localStorage.getItem("token");

    const resetPlans = () => {
        setCurrentPlans(undefined);
        setError(null);
        setLoading(false);
    };

    const isCurrentPlansAvailable = async () => {
        if (authLoading || !isAuthenticated || !token) {
            resetPlans();
            return null;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await api.get("/api/subscriptions/credit/usage");
            if (response.data) {
                setCurrentPlans(response.data);
            } else {
                setCurrentPlans(null);
            }
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                resetPlans();
            } else if (error.response?.status === 404) {
                setCurrentPlans(null);
            } else {
                console.error("Error fetching current plans:", error);
                setError(error);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) {
            setLoading(true);
            return;
        }

        isCurrentPlansAvailable();
    }, [authLoading, isAuthenticated, token]);

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
