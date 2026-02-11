import React, { useState, useEffect, useRef } from 'react';
import { 
  FiBell, FiCalendar, FiGift, FiMessageSquare, 
  FiX, FiClock, FiArchive, FiCheck,
  FiUser, FiDollarSign,
  FiSend, FiEye
} from 'react-icons/fi';
import moment from 'moment';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../api/apiconfig';
import showToast from '../utils/ToastNotification';

const Notification = () => {
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsForSelectedDate, setEventsForSelectedDate] = useState({ birthday: [], anniversary: [] });
  const [loyalCustomers, setLoyalCustomers] = useState([]);
  const [highCLVCustomersAtRisk, setHighCLVCustomersAtRisk] = useState([]);
  const [loading, setLoading] = useState({
    notifications: true,
    calendar: true,
    loyalCustomers: true,
    clvCustomers: true
  });
  
  const [viewedNotifications, setViewedNotifications] = useState(new Set());
  const notificationRefs = useRef({});
  const [viewModal, setViewModal] = useState({ open: false, item: null });

  // Create intersection observer to detect when notifications are viewed
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const notificationId = entry.target.dataset.id;
            if (!viewedNotifications.has(notificationId)) {
              handleMarkAsRead(notificationId);
              setViewedNotifications(prev => new Set(prev).add(notificationId));
            }
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of notification is visible
    );

    // Observe all notification elements
    Object.values(notificationRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [notifications, viewedNotifications]);

  // Fetch data on component mount
  useEffect(() => {
    fetchNotificationStats();
    fetchNotifications();
    fetchCalendarEvents();
    fetchLoyalCustomers();
    fetchHighCLVCustomersAtRisk();
  }, []);

  // Fetch data when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchEventsForDate(selectedDate);
    }
  }, [selectedDate]);

  // API functions
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data.notifications);
      setLoading(prev => ({ ...prev, notifications: false }));
    } catch (error) {
      showToast('Failed to fetch notifications', 'error');
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const response = await api.get('/api/notifications/stats');
      setNotificationStats(response.data);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const startDate = moment().startOf('month').format('YYYY-MM-DD');
      const endDate = moment().endOf('month').format('YYYY-MM-DD');
      const response = await api.get(`/api/notifications/calendar?startDate=${startDate}&endDate=${endDate}`);
      setCalendarEvents(response.data.events);
      setLoading(prev => ({ ...prev, calendar: false }));
    } catch (error) {
      showToast('Failed to fetch calendar events', 'error');
      console.error('Error fetching calendar events:', error);
    }
  };

  const fetchEventsForDate = async (date) => {
    try {
      const dateStr = moment(date).format('YYYY-MM-DD');
      const response = await api.get(`/api/notifications/events/${dateStr}`);
      setEventsForSelectedDate(response.data.events);
    } catch (error) {
      showToast('Failed to fetch events for date', 'error');
      console.error('Error fetching events for date:', error);
    }
  };

  const fetchLoyalCustomers = async () => {
    try {
      const response = await api.get('/api/notifications/loyal-customers');
      setLoyalCustomers(response.data.loyalCustomers);
      setLoading(prev => ({ ...prev, loyalCustomers: false }));
    } catch (error) {
      showToast('Failed to fetch loyal customers', 'error');
      console.error('Error fetching loyal customers:', error);
    }
  };

  const fetchHighCLVCustomersAtRisk = async () => {
    try {
      const response = await api.get('/api/notifications/high-clv-at-risk');
      setHighCLVCustomersAtRisk(response.data.highCLVCustomersAtRisk);
      setLoading(prev => ({ ...prev, clvCustomers: false }));
    } catch (error) {
      showToast('Failed to fetch high CLV customers', 'error');
      console.error('Error fetching high CLV customers:', error);
    }
  };

  // Action handlers
  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSetReminder = async (notificationId, reminderDate) => {
    try {
      await api.put(`/api/notifications/${notificationId}/reminder`, { reminderDate });
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, status: 'scheduled' } : n
      ));
      showToast('Reminder set successfully', 'success');
    } catch (error) {
      showToast('Failed to set reminder', 'error');
      console.error('Error setting reminder:', error);
    }
  };
  
  const handleSendNotification = async (notificationId, customerIds, eventType) => {
    try {
      await api.post('/api/notifications/send-greeting', {
        customerIds,
        eventType,
        notificationId
      });
      
      // Update notification status to "sent"
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, status: 'sent' } : n
      ));
      
      showToast('Notification sent successfully', 'success');
    } catch (error) {
      showToast('Failed to send notification', 'error');
      console.error('Error sending notification:', error);
    }
  };
  
  const handleArchive = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/archive`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      showToast('Notification archived', 'success');
    } catch (error) {
      showToast('Failed to archive notification', 'error');
      console.error('Error archiving notification:', error);
    }
  };

  const handleSendGreeting = async (notificationId, customerIds, eventType) => {
    try {
      await api.post('/api/notifications/send-greeting', {
        customerIds,
        eventType,
        notificationId
      });
      setNotifications(notifications.filter(n => n._id !== notificationId));
      showToast('Greeting sent successfully', 'success');
    } catch (error) {
      showToast('Failed to send greeting', 'error');
      console.error('Error sending greeting:', error);
    }
  };

  // Helper functions
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'birthday': return <FiGift className="text-pink-500 text-xl" />;
      case 'anniversary': return <FiCalendar className="text-blue-500 text-xl" />;
      case 'campaign': return <FiMessageSquare className="text-green-500 text-xl" />;
      case 'whatsapp_failure': return <FiAlertCircle className="text-red-500 text-xl" />;
      default: return <FiBell className="text-indigo-500 text-xl" />;
    }
  };

  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY');
  };

  // Loading skeleton
  if (loading.notifications || loading.calendar) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="flex space-x-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-md w-24"></div>
            ))}
          </div>
          <div className="space-y-6 mt-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Notification</h1>
          
          {/* Tabs */}
          <div className="flex mt-4 border-b">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'campaigns' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('campaigns')}
            >
              Campaigns
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <FiBell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-gray-500">You'll see important updates here.</p>
            </div>
          ) : (
            notifications.map(notification => (
              console.log("notification", notification),
              <div 
                key={notification._id}
                ref={el => notificationRefs.current[notification._id] = el}
                data-id={notification._id}
                className={`bg-white rounded-lg shadow-sm p-5 transition-all duration-300 ${
                  !notification.isRead 
                    ? 'border-l-4 border-indigo-500' 
                    : 'opacity-90'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notificationType)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{notification.message}</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                          {moment(notification.createdAt).fromNow()}
                        </span>
                        {!notification.isRead ? (
                          <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                          </span>
                        ) : (
                          <FiCheck className="text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">{notification.description}</p>
                    
                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {notification.notificationType === 'birthday' || notification.notificationType === 'anniversary' ? (
                        <button
                          onClick={() => handleSendGreeting(notification._id, notification.customerIds, notification.notificationType)}
                          className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm"
                        >
                          <FiGift className="mr-1" /> Send Greeting
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => handleSetReminder(notification._id, moment().add(1, 'day').toDate())}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm"
                      >
                        <FiClock className="mr-1" /> Remind Later
                      </button>
                      
                      <button
                        onClick={() => handleSendNotification(
                          notification._id, 
                          notification.customerIds, 
                          notification.notificationType
                        )}
                        disabled={notification.status === 'sent'}
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${
                          notification.status === 'sent'
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <FiSend className="mr-1" /> 
                        {notification.status === 'sent' ? 'Sent' : 'Send Now'}
                      </button>
                      
                      {/* <button
                        onClick={() => handleArchive(notification._id)}
                        className="flex items-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm"
                      >
                        <FiArchive className="mr-1" /> Archive
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loyal Customers Section */}
        {loyalCustomers.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Loyal Customers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loyalCustomers.slice(0, 4).map(customer => (
                <div key={customer._id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">
                        {customer.firstname} {customer.lastname}
                      </h3>
                      <p className="text-sm text-gray-500">{customer.mobileNumber}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Last order: {moment(customer.lastOrderDate).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* High CLV Customers at Risk */}
        {highCLVCustomersAtRisk.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">High-CLV Customers at Risk</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {highCLVCustomersAtRisk.slice(0, 4).map(customer => (
                <div key={customer._id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">
                        {customer.customerDetails?.firstname} {customer.customerDetails?.lastname}
                      </h3>
                      <p className="text-sm text-gray-500">{customer.customerDetails?.mobileNumber}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <FiDollarSign className="inline mr-1" />
                        {customer.totalSpend.toFixed(2)} spent
                      </p>
                      <p className="text-sm text-gray-500">
                        Last order: {moment(customer.lastOrderDate).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Sidebar */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-l p-6">
        <div className="sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Calendar</h2>
          
          <Calendar 
            onChange={setSelectedDate}
            value={selectedDate}
            className="border-0 shadow-none w-full"
            tileClassName={({ date, view }) => 
              view === 'month' && calendarEvents.some(event => 
                moment(event.eventDate).isSame(date, 'day')
              ) ? 'bg-blue-50' : ''
            }
          />
          
          <div className="mt-8">
            <h3 className="font-medium text-gray-900 mb-3">
              Upcoming Events - {formatDate(selectedDate)}
            </h3>
            
            {eventsForSelectedDate.birthday.length === 0 && 
             eventsForSelectedDate.anniversary.length === 0 ? (
              <p className="text-gray-500 text-sm">No events scheduled for this day</p>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.birthday.map(event => (
                  <div key={event._id} className="flex items-start p-3 bg-pink-50 rounded-md">
                    <FiGift className="text-pink-500 mt-1 mr-2" />
                    <div>
                      <p className="font-medium">{event.customerName}'s Birthday</p>
                      <p className="text-sm text-gray-500">
                        {moment(event.originalDate).fromNow()} anniversary
                      </p>
                    </div>
                  </div>
                ))}
                
                {eventsForSelectedDate.anniversary.map(event => (
                  <div key={event._id} className="flex items-start p-3 bg-blue-50 rounded-md">
                    <FiCalendar className="text-blue-500 mt-1 mr-2" />
                    <div>
                      <p className="font-medium">{event.customerName}'s Anniversary</p>
                      <p className="text-sm text-gray-500">
                        {moment(event.originalDate).fromNow()} anniversary
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;