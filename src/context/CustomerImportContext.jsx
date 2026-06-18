import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/apiconfig';

const CustomerImportContext = createContext();

export const useCustomerImport = () => useContext(CustomerImportContext);

export const CustomerImportProvider = ({ children }) => {
  const [activeJobs, setActiveJobs] = useState([]);
  const pollIntervalRef = useRef(null);
  const retailerId = localStorage.getItem("retailerId");

  const fetchActiveJobs = async () => {
    if (!retailerId) return;
    try {
      const response = await api.get(`/api/customers/active-imports/${retailerId}`);
      setActiveJobs(response.data);
      
      // If we have active jobs, poll faster (3s), otherwise poll slow (30s)
      const nextInterval = response.data.length > 0 ? 3000 : 30000;
      resetPolling(nextInterval);
    } catch (err) {
      console.error("Error fetching active import jobs:", err);
      // On error, try again in 30s
      resetPolling(30000);
    }
  };

  const resetPolling = (ms) => {
    stopPolling();
    pollIntervalRef.current = setInterval(fetchActiveJobs, ms);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    fetchActiveJobs();
    return () => stopPolling();
  }, [retailerId]);

  const value = {
    activeJobs,
    refreshJobs: fetchActiveJobs
  };

  return (
    <CustomerImportContext.Provider value={value}>
      {children}
    </CustomerImportContext.Provider>
  );
};
