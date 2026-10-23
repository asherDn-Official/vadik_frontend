// import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// import api from '../api/apiconfig';
// import { useAuth } from './AuthContext';

// const CustomerImportContext = createContext();

// export const useCustomerImport = () => useContext(CustomerImportContext);

// export const CustomerImportProvider = ({ children }) => {
//   const { auth, loading: authLoading } = useAuth();
//   const [activeJobs, setActiveJobs] = useState([]);
//   const pollIntervalRef = useRef(null);
//   const inFlightRef = useRef(false);
//   const retailerId = auth?.data?._id || localStorage.getItem("retailerId");
//   const token = localStorage.getItem("token");
//   const canFetchActiveJobs = !authLoading && Boolean(auth) && Boolean(retailerId) && Boolean(token);

//   const stopPolling = useCallback(() => {
//     if (pollIntervalRef.current) {
//       clearInterval(pollIntervalRef.current);
//       pollIntervalRef.current = null;
//     }
//   }, []);

//   const fetchActiveJobs = useCallback(async () => {
//     if (!canFetchActiveJobs || inFlightRef.current) return;

//     inFlightRef.current = true;
//     try {
//       const response = await api.get(`/api/customers/active-imports/${retailerId}`);
//       const jobs = Array.isArray(response.data) ? response.data : [];
//       setActiveJobs(jobs);
      
//       // If we have active jobs, poll faster (3s), otherwise poll slow (30s)
//       const nextInterval = jobs.length > 0 ? 3000 : 30000;
//       stopPolling();
//       pollIntervalRef.current = setInterval(fetchActiveJobs, nextInterval);
//     } catch (err) {
//       if (err.response?.status === 401) {
//         stopPolling();
//         setActiveJobs([]);
//       } else {
//         console.error("Error fetching active import jobs:", err);
//         // On error, try again in 30s
//         stopPolling();
//         pollIntervalRef.current = setInterval(fetchActiveJobs, 30000);
//       }
//     } finally {
//       inFlightRef.current = false;
//     }
//   }, [canFetchActiveJobs, retailerId, stopPolling]);

//   useEffect(() => {
//     if (!canFetchActiveJobs) {
//       stopPolling();
//       setActiveJobs([]);
//       return;
//     }

//     fetchActiveJobs();
//     return () => stopPolling();
//   }, [canFetchActiveJobs, fetchActiveJobs, stopPolling]);

//   const value = {
//     activeJobs,
//     refreshJobs: fetchActiveJobs
//   };

//   return (
//     <CustomerImportContext.Provider value={value}>
//       {children}
//     </CustomerImportContext.Provider>
//   );
// };



import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/apiconfig';
import { useAuth } from './AuthContext';

const CustomerImportContext = createContext();

export const useCustomerImport = () => useContext(CustomerImportContext);

export const CustomerImportProvider = ({ children }) => {
  const { auth, loading: authLoading } = useAuth();
  const [activeJobs, setActiveJobs] = useState([]);
  const pollIntervalRef = useRef(null);
  const currentIntervalMsRef = useRef(null);
  const inFlightRef = useRef(false);

  const retailerId = auth?.data?._id || localStorage.getItem("retailerId");
  const token = localStorage.getItem("token");
  const canFetchActiveJobs = !authLoading && Boolean(auth) && Boolean(retailerId) && Boolean(token);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    currentIntervalMsRef.current = null;
  }, []);

  const fetchActiveJobs = useCallback(async () => {
    if (!canFetchActiveJobs || inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      const response = await api.get(`/api/customers/active-imports/${retailerId}`);
      const jobs = Array.isArray(response.data) ? response.data : [];
      
      // Filter active jobs (pending or processing)
      const runningJobs = jobs.filter((job) =>
        ['pending', 'processing'].includes(job.status?.toLowerCase())
      );
      
      setActiveJobs(runningJobs);
      
      // Dynamic interval: 3s if active jobs exist, 30s if idle
      const neededInterval = runningJobs.length > 0 ? 3000 : 30000;

      if (currentIntervalMsRef.current !== neededInterval) {
        stopPolling();
        currentIntervalMsRef.current = neededInterval;
        pollIntervalRef.current = setInterval(fetchActiveJobs, neededInterval);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        stopPolling();
        setActiveJobs([]);
      } else {
        console.error("Error fetching active import jobs:", err);
        if (currentIntervalMsRef.current !== 30000) {
          stopPolling();
          currentIntervalMsRef.current = 30000;
          pollIntervalRef.current = setInterval(fetchActiveJobs, 30000);
        }
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [canFetchActiveJobs, retailerId, stopPolling]);

  useEffect(() => {
    if (!canFetchActiveJobs) {
      stopPolling();
      setActiveJobs([]);
      return;
    }

    fetchActiveJobs();
    return () => stopPolling();
  }, [canFetchActiveJobs, fetchActiveJobs, stopPolling]);

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