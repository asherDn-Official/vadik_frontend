import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/apiconfig";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    const retailerId = localStorage.getItem('retailerId');

    const checkAuth = async () => {
        try {
            const response = await api.get(`/api/retailer/${retailerId}`);
            // Ensure data exists before setting auth
            if (response.data && response.data.data) {
                setAuth(response.data.data);
            } else {
                setAuth(null);
            }
        } catch (error) {
            console.error("Error fetching auth status:", error);
            setAuth(null);
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
