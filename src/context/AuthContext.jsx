import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/apiconfig";
const AuthContext = createContext();

const clearStoredAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("retailerId");
};

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setAuth(null);
            setLoading(false);
            return null;
        }

        try {
            const response = await api.get(`/api/auth/validate-token`);
            // Ensure data exists before setting auth
            if (response.data && response.data.data) {
                setAuth(response.data);
            } else {
                setAuth(null);
            }

            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                clearStoredAuth();
            } else {
                console.error("Error fetching auth status:", error);
            }
            setAuth(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );

}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
