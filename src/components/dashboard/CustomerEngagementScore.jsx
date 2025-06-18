function CustomerEngagementScore() {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Customer Engagement Score :</h2>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-full bg-gray-200 rounded-full h-7">
          <div className="bg-gradient-to-r from-pink-400 to-pink-600 h-7 rounded-full" style={{ width: '52%' }}></div>
        </div>
        <span className="text-3xl font-bold text-indigo-900">52%</span>
      </div>
    </div>
  );
}

export default CustomerEngagementScore;