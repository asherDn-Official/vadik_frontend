import { useState, useEffect, useRef } from "react";
import api from "../../api/apiconfig";
import Loader from "../../utils/Loader";
import { useCustomerImport } from "../../context/CustomerImportContext";

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { refreshJobs } = useCustomerImport();
  const retailerId = localStorage.getItem("retailerId");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importJobId, setImportJobId] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setFile(null);
      setImportJobId(null);
      setJobDetails(null);
      setSuccessMessage("");
      setLoading(false);
      stopPolling();
    }
  }, [isOpen]);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startPolling = (jobId) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/api/customers/import-status/${jobId}`);
        const data = response.data;
        setJobDetails(data);

        if (data.status === "completed" || data.status === "failed") {
          stopPolling();
          if (data.status === "completed") {
            setSuccessMessage(`Import completed! ${data.successCount} customers added.`);
            setTimeout(() => {
              onSuccess(`Import completed! ${data.successCount} customers added.`);
              onClose();
            }, 3000);
          } else {
            // Handle failure status
            alert(`Import failed: ${data.importErrors?.[0]?.message || 'Unknown error'}`);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
        stopPolling();
      }
    }, 2000);
  };

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!file) return alert("Please select an Excel file");

    try {
      setLoading(true);
      setJobDetails(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(`/api/customers/bulk-upload/${retailerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;

      if (data.jobId) {
        setImportJobId(data.jobId);
        startPolling(data.jobId);
        refreshJobs(); // Trigger context update
      } else {
        alert("Failed to start import job");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(err?.response?.data?.error || "Upload failed");
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    const response = await api.get("/api/customers/bulk-upload/template", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customer_bulk_upload_template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const calculateProgress = () => {
    if (!jobDetails) return 0;
    if (jobDetails.percentage !== undefined) return jobDetails.percentage;
    if (!jobDetails.totalRows) return 0;
    const p = Math.round((jobDetails.processedRows / jobDetails.totalRows) * 100);
    return Math.min(100, p);
  };

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-black/60
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          relative
          w-full max-w-2xl
          overflow-hidden

          rounded-[28px]
          border border-[#EEF1FF]

          bg-white
          p-6

          shadow-[0_20px_80px_rgba(15,23,42,0.18)]

          animate-[fadeIn_.2s_ease]
        "
      >
        <button
          onClick={onClose}
          disabled={loading && jobDetails?.status === "processing"}
          className="
            absolute right-4 top-4
            flex h-10 w-10 items-center justify-center

            rounded-full
            border border-[#EEF1FF]

            bg-white
            text-[#8B90B2]

            transition-all duration-200

            hover:bg-[#F8F9FF]
            hover:text-[#313166]

            disabled:opacity-50
          "
        >
          ✕
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[24px] font-bold tracking-[-0.03em] text-[#1F1C5C]">
            Bulk Import Customers
          </h2>
          {!importJobId && (
            <button
              onClick={downloadTemplate}
              className="
                text-sm font-medium
                text-[#313166]
                transition-all duration-200
                hover:text-[#1F1C5C]
              "
            >
              Download Excel Template
            </button>
          )}
        </div>

        {successMessage && (
          <div
            className="
              mb-4 rounded-2xl
              border border-green-200
              bg-green-50
              px-4 py-3

              text-sm font-medium
              text-green-700
            "
          >
            {successMessage}
          </div>
        )}

        {!importJobId ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <label
                  className="
                    flex h-11 items-center
                    rounded-xl

                    border border-[#EEF1FF]
                    bg-[#F8F9FF]

                    px-4

                    text-sm font-medium text-[#313166]

                    cursor-pointer
                    transition-all duration-200

                    hover:bg-white
                    hover:border-[#D8DDF8]
                  "
                >
                  Choose Excel File
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </label>

                {file && (
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {file.name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Required columns: First Name, Mobile Number, Country Code, Source, First Visit (DD-MM-YYYY). Last Name and Labels are optional.
            </div>
            <div className="text-xs text-[#313166] mt-4 p-3 bg-blue-50 rounded-lg">
              <b>Pro Tip:</b> Our new system handles 1,00,000+ records with ease. 
              The process runs in the background, so you'll see a progress bar once started.
            </div>
          </>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`text-lg font-bold capitalize ${
                  jobDetails?.status === 'completed' ? 'text-green-600' :
                  jobDetails?.status === 'failed' ? 'text-red-600' : 'text-[#313166]'
                }`}>
                  {jobDetails?.status || 'Starting...'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Progress</p>
                <p className="text-lg font-bold text-[#1F1C5C]">{calculateProgress()}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#313166] transition-all duration-500 ease-out"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#F8F9FF] p-4 rounded-2xl border border-[#EEF1FF]">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-xl font-bold text-[#1F1C5C]">{jobDetails?.totalRows ?? '-'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <p className="text-xs text-green-600 mb-1">Success</p>
                <p className="text-xl font-bold text-green-700">{jobDetails?.successCount || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <p className="text-xs text-red-600 mb-1">Errors</p>
                <p className="text-xl font-bold text-red-700">{jobDetails?.errorCount || 0}</p>
              </div>
            </div>

            {jobDetails?.importErrors?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-[#1F1C5C] mb-2">Recent Errors (First 100)</p>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-[#EEF1FF] bg-[#FCFCFF]">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Row</th>
                        <th className="px-3 py-2 text-left">Details</th>
                        <th className="px-3 py-2 text-left">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobDetails.importErrors.map((err, idx) => (
                        <tr key={idx} className="border-t border-gray-50">
                          <td className="px-3 py-2 font-medium">{err.row || '-'}</td>
                          <td className="px-3 py-2 text-gray-500">
                            {err.data?.countryCode ? `+${err.data.countryCode} ${err.data.mobileNumber}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-red-600">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className="
            sticky bottom-0
            mt-5

            flex justify-end gap-3

            border-t border-[#EEF1FF]
            bg-white
            pt-5
          "
        >
          {!importJobId ? (
            <>
              <button
                onClick={onClose}
                className="
                  h-11 rounded-xl
                  border border-[#EEF1FF]
                  px-5
                  text-sm font-medium
                  text-[#313166]
                  transition-all duration-200
                  hover:bg-[#F8F9FF]
                "
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className={`
                  h-11 rounded-xl px-5
                  text-sm font-medium
                  transition-all duration-200
                  ${
                    loading || !file
                      ? "cursor-not-allowed bg-[#E5E7F3] text-[#8B90B2]"
                      : "bg-[#313166] text-white hover:bg-[#272757]"
                  }
                `}
                disabled={loading || !file}
              >
                {loading ? "Initializing..." : "Start Import"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              disabled={jobDetails?.status === "processing"}
              className="
                h-11 rounded-xl
                bg-[#313166]
                px-5
                text-sm font-medium
                text-white
                transition-all duration-200
                hover:bg-[#272757]
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {jobDetails?.status === "processing" ? "Importing..." : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
