function OptInOptOut() {
  return (
    <div className="dashboard-card">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Opt-In/Opt-Out</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">25%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-accent-600 h-4 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">75%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-navbg h-4 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-around mt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-navbg"></span>
          <span className="text-sm text-gray-600">Opt-In</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent-600"></span>
          <span className="text-sm text-gray-600">Opt-out</span>
        </div>
      </div>
    </div>
  );
}

export default OptInOptOut;