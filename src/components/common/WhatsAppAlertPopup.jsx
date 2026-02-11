import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiExternalLink, FiCreditCard, FiShield } from 'react-icons/fi';
import api from '../../api/apiconfig';

const WhatsAppAlertPopup = () => {
  const [alerts, setAlerts] = useState([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/notifications?type=whatsapp_failure&isRead=false');
      if (response.data && response.data.notifications) {
        setAlerts(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 2 minutes
    const interval = setInterval(fetchAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      const updatedAlerts = alerts.filter(alert => alert._id !== id);
      setAlerts(updatedAlerts);
      if (currentAlertIndex >= updatedAlerts.length && updatedAlerts.length > 0) {
        setCurrentAlertIndex(updatedAlerts.length - 1);
      }
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  if (loading || alerts.length === 0) return null;

  const alert = alerts[currentAlertIndex];
  const isPaymentIssue = alert.alertData?.errorCode === 131042;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        <div className={`p-1 ${alert.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-full ${alert.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
              <FiAlertCircle size={28} />
            </div>
            <button 
              onClick={() => handleMarkAsRead(alert._id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {alert.title}
          </h3>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <p className="text-gray-700 leading-relaxed">
              {alert.message}
            </p>
            {alert.alertData?.errorCode && (
              <p className="mt-2 text-xs font-mono text-gray-400">
                Meta Error Code: {alert.alertData.errorCode}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {alert.alertData?.actionLink && (
              <a 
                href={alert.alertData.actionLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl ${
                  alert.priority === 'high' 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                }`}
              >
                {isPaymentIssue ? <FiCreditCard /> : <FiShield />}
                Fix Issue Now
                <FiExternalLink size={16} />
              </a>
            )}
            
            <button 
              onClick={() => handleMarkAsRead(alert._id)}
              className="w-full py-3 px-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Acknowledge
            </button>
          </div>
        </div>

        {alerts.length > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
            <span>Alert {currentAlertIndex + 1} of {alerts.length}</span>
            <div className="flex gap-2">
              <button 
                disabled={currentAlertIndex === 0}
                onClick={() => setCurrentAlertIndex(prev => prev - 1)}
                className="disabled:opacity-30 hover:text-indigo-600"
              >
                Previous
              </button>
              <button 
                disabled={currentAlertIndex === alerts.length - 1}
                onClick={() => setCurrentAlertIndex(prev => prev + 1)}
                className="disabled:opacity-30 hover:text-indigo-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAlertPopup;
