import { useState, useEffect } from "react";
import api from "../../api/apiconfig";

const BulkImportModal = ({ isOpen, onClose, onSuccess }) => {
  const retailerId = localStorage.getItem("retailerId");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setFile(null);
      setErrors([]);
      setSummary(null);
      setSuccessMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (skipErrors = false) => {
    if (!file) return alert("Please select an Excel file");

    try {
      setLoading(true);
      setErrors([]);
      setSummary(null);

      const formData = new FormData();
      formData.append("file", file);

      const url = skipErrors
        ? `/api/customers/bulk-upload/${retailerId}?skip_errors=true`
        : `/api/customers/bulk-upload/${retailerId}`;

      const response = await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;

      if (data.status === "validation_failed") {
        setErrors(data.errors || []);
        setSummary({
          valid: data.validCount,
          invalid: data.invalidCount,
        });
      } else {
        const message = `Bulk upload successful. ${data.inserted} customers added.`;
        setSuccessMessage(message);

        setTimeout(() => {
          setSuccessMessage("");
          onSuccess(message);
          onClose();
        }, 1500);
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Upload failed");
    } finally {
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
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-xl z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#313166]"></div>
          </div>
        )}
        <button
          onClick={onClose}
          disabled={loading}
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
          Required columns: First Name, Last Name, Mobile Number, Country Code,
          Source, Gender, First Visit (DD-MM-YYYY)
        </div>
        {summary && (
          <div className="mb-4 flex gap-4 text-sm">
            <span className="text-green-600">
              ✔ Valid: <b>{summary.valid}</b>
            </span>
            <span className="text-red-600">
              ✖ Invalid: <b>{summary.invalid}</b>
            </span>
          </div>
        )}

        {errors.length > 0 && (
          <div
            className="
              mb-4 max-h-56 overflow-auto

              rounded-2xl
              border border-[#EEF1FF]

              bg-[#FCFCFF]
            "
          >
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Row</th>
                  <th className="px-3 py-2 text-left">Mobile</th>
                  <th className="px-3 py-2 text-left">Issues</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-3 py-2">{err.row}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {err.countryCode && err.mobileNumber
                        ? `+${err.countryCode} - ${err.mobileNumber}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-red-600">
                      <ul className="list-disc ml-4">
                        {err.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {errors.length > 0 && (
            <button
              onClick={() => handleUpload(true)}
              className={
                summary?.valid === 0
                  ? "px-4 py-2 bg-yellow-500 text-white rounded-md disabled:opacity-50 cursor-not-allowed"
                  : "px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              }
              disabled={loading || (summary && summary.valid === 0)}
            >
              Proceed & Skip Errors
            </button>
          )}

          <button
            onClick={() => handleUpload(false)}
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
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;
