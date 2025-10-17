// components/ExcelImport.jsx
import React, { useState } from "react";
import { Upload, FileSpreadsheet, X, Download } from "lucide-react";
import api from "../../api/apiconfig";
import showToast from "../../utils/ToastNotification";

const ExcelImport = ({ retailerId, onImportSuccess, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template'
    ];
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
                       ['xls', 'xlsx'].includes(fileExtension);

    if (!isValidType) {
      showToast("Please select a valid Excel file (.xls, .xlsx)", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size must be less than 10MB", "error");
      return;
    }

    setSelectedFile(file);
    previewFileInfo(file);
  };

  const previewFileInfo = (file) => {
    // In a real implementation, you might want to parse the Excel file
    // and show a preview. For now, we'll just show basic file info.
    setImportPreview({
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2),
      recordCount: "Will be processed after upload"
    });
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a file first", "error");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("ordersFile", selectedFile);

      const response = await api.post(
        `/api/orderHistory/excel/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast("Excel file imported successfully!", "success");
      if (onImportSuccess) {
        onImportSuccess(response.data);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Error importing Excel file";
      showToast(errorMessage, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setImportPreview(null);
  };

  const downloadTemplate = () => {
    // Create template data based on your Excel structure
    const templateData = [
      ['Order ID', 'Customer Name', 'Mobile Number', 'Gender', 'Product Name', 'Quantity', 'Unit Price', 'Discount', 'Payment Status', 'Order Date'],
      ['ORD-001', 'John Doe', '911234567890', 'Male', 'T-Shirt', '2', '500', '50', 'Paid', '2024-01-15'],
      ['ORD-002', 'Jane Smith', '911234567891', 'Female', 'Jeans', '1', '1200', '100', 'Unpaid', '2024-01-15'],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Notes:', '', '', '', '', '', '', '', '', ''],
      ['- Order ID: Leave empty for auto-generation', '', '', '', '', '', '', '', '', ''],
      ['- Mobile Number: Format 91XXXXXXXXXX', '', '', '', '', '', '', '', '', ''],
      ['- Gender: Male/Female/Other', '', '', '', '', '', '', '', '', ''],
      ['- Payment Status: Paid/Unpaid', '', '', '', '', '', '', '', '', ''],
      ['- Order Date: YYYY-MM-DD format', '', '', '', '', '', '', '', '', '']
    ];

    let csvContent = templateData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'order_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast("Template downloaded successfully", "success");
  };

  const downloadExcelTemplate = async () => {
    try {
      // If you have an actual Excel template file, you can serve it from your backend
      const response = await api.get('/api/orderHistory/excel/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'order_import_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast("Excel template downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading Excel template:", error);
      // Fallback to CSV if Excel template is not available
      downloadTemplate();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Import Orders from Excel
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload Excel file with order data
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Required Format Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Expected Excel Format:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Columns:</strong> Order ID, Customer Name, Mobile Number, Gender, Product Name, Quantity, Unit Price, Discount, Payment Status, Order Date</p>
              <p><strong>Sheet Name:</strong> Orders (or first sheet will be used)</p>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input").click()}
          >
            <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              Drag & drop your Excel file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports .xls, .xlsx (max 10MB)
            </p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>
            <input
              id="file-input"
              type="file"
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Selected File Info */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileSpreadsheet size={20} className="text-green-500 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              {importPreview && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Records:</span>
                      <span className="ml-2 text-gray-800">{importPreview.recordCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Format:</span>
                      <span className="ml-2 text-green-600 font-medium">✓ Valid</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Template Download */}
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors"
            >
              <Download size={16} />
              Download Excel Template
            </button>
{/*             
            <div className="text-center">
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
              >
                Download CSV Template (Alternative)
              </button>
            </div> */}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            {isUploading ? "Processing..." : "Import Orders"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;