import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import api from "../api/apiconfig";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await api.get("/api/notifications/stats");
      const count = response.data?.overall?.unread ?? 0;
      setUnreadCount(count);
    } catch (error) {
      // Silently fail — don't break the app if this fails
      console.log("Notification unread count fetch error:", error?.response?.status || error.message);
    }
  }, []);

  // Initial fetch + poll every 60 seconds
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchUnreadCount();

    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, 60000); // 60 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        refreshUnreadCount: fetchUnreadCount,
        decrementUnreadCount: () =>
          setUnreadCount(prev => Math.max(0, prev - 1)),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export default NotificationContext;
