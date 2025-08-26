import React, { useState, useEffect } from "react";
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const QuizList = ({ activities = [], pagination, onEdit, onDelete, onPageChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Safely get pagination values with defaults
  const totalItems = pagination?.totalDocs || 0;
  const totalPages = pagination?.totalPages || 1;

  // Update state when pagination prop changes
  useEffect(() => {
    if (pagination?.page) {
      setCurrentPage(pagination.page);
    }
    if (pagination?.limit) {
      setItemsPerPage(pagination.limit);
    }
  }, [pagination]);

  // Calculate display values safely
  const startItem = totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      onPageChange(newPage, itemsPerPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    const newItemsPerPage = parseInt(newLimit);
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
    onPageChange(1, newItemsPerPage);
  };

  // Generate page numbers for display
  const getPageNumbers = () => {
    if (totalPages <= 1) return [];
    
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else if (totalPages > 1) {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1 && !rangeWithDots.includes(totalPages)) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <div className="space-y-4">
      {/* Items per page selector, showing entries info, and pagination */}
      {totalItems > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-600">Items per page:</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="border rounded-md p-1 text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPageNumbers().map((pageNumber, index) => (
                  pageNumber === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-1">...</span>
                  ) : (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded-md ${currentPage === pageNumber 
                        ? 'bg-[#313166] text-white' 
                        : 'text-gray-700 hover:bg-gray-200'}`}
                    >
                      {pageNumber}
                    </button>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-200'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activities list */}
      {activities.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white rounded-lg p-6 border border-gray-300 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <img src="../assets/quiz-icon.png" alt="Quiz icon" className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {quiz.campaignName}
                </h3>
                <p className="text-gray-600">Questions: {quiz.questions.length}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(quiz)}
                className="p-2 text-[#313166] bg-[#3131661A] hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(quiz._id)}
                className="p-2 text-[#FD2C2F] bg-[#FF00001A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>
            No quiz activities created yet. Click "Create Quiz" to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizList;
