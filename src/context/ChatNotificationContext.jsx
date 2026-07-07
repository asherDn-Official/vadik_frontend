import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/apiconfig";
import { useAuth } from "./AuthContext";

const ChatNotificationContext = createContext();

export const ChatNotificationProvider = ({ children }) => {
  const { auth } = useAuth();

  const [totalUnread, setTotalUnread] = useState(0);

 const fetchUnreadCount = async () => {
  try {
    if (!auth?.user?._id) {
      setTotalUnread(0);
      return;
    }

    const retailerId = localStorage.getItem("retailerId");

    if (!retailerId) {
      setTotalUnread(0);
      return;
    }

    const res = await api.get(
      `/api/customers/all?retailerId=${retailerId}&limit=200&fields=chat&chatOnly=true&skipCount=true`
    );

    setTotalUnread(res.data?.totalUnread ?? 0);
    // console.log("API totalUnread:", res.data.totalUnread);
  } catch (err) {
    setTotalUnread(0);
  }
};
useEffect(() => {
  // User not logged in
  if (!auth?.user?._id) {
    setTotalUnread(0);
    return;
  }

  fetchUnreadCount();

  const interval = setInterval(() => {
    fetchUnreadCount();
  }, 5000);

  return () => clearInterval(interval);
}, [auth?.user?._id]);
// console.log("Context totalUnread:", totalUnread);
  return (
    <ChatNotificationContext.Provider
      value={{
        totalUnread,
        fetchUnreadCount,
        setTotalUnread,
      }}
    >
      {children}
    </ChatNotificationContext.Provider>
  );
};

export const useChatNotification = () =>
  useContext(ChatNotificationContext);