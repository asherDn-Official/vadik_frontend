// import React, { useState } from 'react';
// import { useCustomerImport } from '../../context/CustomerImportContext';
// import { FiUploadCloud, FiX } from 'react-icons/fi';

// const CustomerImportNavbarProgress = () => {
//   const { activeJobs } = useCustomerImport();
//   const [isDismissed, setIsDismissed] = useState(false);

//   if (!activeJobs || activeJobs.length === 0 || isDismissed) return null;

//   const job = activeJobs[0]; // Show most recent active job
//   let progress = 0;
//   if (job) {
//     if (job.percentage !== undefined && !isNaN(job.percentage)) {
//       progress = job.percentage;
//     } else if (job.totalRows > 0) {
//       progress = Math.min(100, Math.round((job.processedRows / job.totalRows) * 100));
//     }
//   }
//   // Final safety check
//   if (isNaN(progress)) progress = 0;

//   return (
//     <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 shadow-sm animate-pulse">
//       <FiUploadCloud className="text-blue-600 animate-bounce" />
//       <div className="flex flex-col">
//         <div className="flex items-center gap-2">
//           <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Importing...</span>
//           <span className="text-[11px] font-bold text-blue-600">{progress}%</span>
//         </div>
//         <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden mt-0.5">
//           <div 
//             className="h-full bg-blue-600 transition-all duration-500 ease-out"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//       </div>
//       <div className="ml-1 flex flex-col items-end">
//         <span className="text-[10px] font-medium text-gray-500 line-clamp-1 max-w-[80px]">{job.fileName}</span>
//         <span className="text-[9px] text-blue-500 font-bold">{job.successCount} created</span>
//       </div>
//       <button 
//         onClick={() => setIsDismissed(true)}
//         className="p-1 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
//       >
//         <FiX size={14} />
//       </button>
//     </div>
//   );
// };

// export default CustomerImportNavbarProgress;


import React, { useState } from 'react';
import { useCustomerImport } from '../../context/CustomerImportContext';
import { FiUploadCloud, FiX } from 'react-icons/fi';

const CustomerImportNavbarProgress = () => {
  const { activeJobs } = useCustomerImport();

  // Load dismissed job IDs from localStorage so clicking 'X' keeps it hidden after page refresh
  const [dismissedJobs, setDismissedJobs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissedImportJobs') || '[]');
    } catch {
      return [];
    }
  });

  const activeJob = activeJobs?.find((j) => {
    const status = j?.status?.toUpperCase();
    const isRunning = status === 'PENDING' || status === 'PROCESSING';
    const isDismissed = dismissedJobs.includes(j._id || j.id);
    return isRunning && !isDismissed;
  });

  if (!activeJob) return null;

  let progress = 0;
  if (activeJob.percentage !== undefined && !isNaN(activeJob.percentage)) {
    progress = activeJob.percentage;
  } else if (activeJob.totalRows > 0) {
    progress = Math.min(100, Math.round(((activeJob.processedRows || 0) / activeJob.totalRows) * 100));
  }

  if (isNaN(progress)) progress = 0;

  const handleDismiss = () => {
    const jobId = activeJob._id || activeJob.id;
    if (jobId) {
      const updatedDismissed = [...dismissedJobs, jobId];
      setDismissedJobs(updatedDismissed);
      localStorage.setItem('dismissedImportJobs', JSON.stringify(updatedDismissed));
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 shadow-sm animate-pulse">
      <FiUploadCloud className="text-blue-600 animate-bounce" />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Importing...</span>
          <span className="text-[11px] font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden mt-0.5">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="ml-1 flex flex-col items-end">
        <span className="text-[10px] font-medium text-gray-500 line-clamp-1 max-w-[80px]">{activeJob.fileName}</span>
        <span className="text-[9px] text-blue-500 font-bold">{activeJob.successCount || activeJob.processedRows || 0} created</span>
      </div>
      <button 
        onClick={handleDismiss}
        className="p-1 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
        title="Close notification"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

export default CustomerImportNavbarProgress;