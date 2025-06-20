import React from 'react';

function CustomerEngagementScore() {
  const score = 70; // Hardcoded score

  return (
    <div className="bg-white rounded-2xl shadow-sm pl-5 pr-8 pt-5 pb-5  ">
      {/* Title */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-[#1D1B4F]">
          Customer Engagement Score :
        </h2>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Progress and Score */}
      <div className="flex items-center gap-4">
        <div className="relative w-full h-5 sm:h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-300 via-pink-500 to-pink-600 rounded-full transition-all duration-500"
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className="text-2xl sm:text-3xl font-bold text-indigo-900">{score}%</span>
      </div>
    </div>
  );
}

export default CustomerEngagementScore;
