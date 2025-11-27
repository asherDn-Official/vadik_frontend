export const sampleTours = [
  {
    id: 'quick-start',
    name: 'Quick Start Guide',
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome to Our Platform',
        description: 'Thank you for joining us! This quick tour will walk you through the key features and help you get started. You can navigate using the Next and Previous buttons, or click on the progress dots below to jump to any step.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'welcome-2',
        title: 'Welcome to the Platform',
        description: 'We have added a Watch Video button on every page to help you fully understand the product. Start here to get an overview of how everything works.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'loyalty-confirmation',
        title: 'Ready to Explore More?',
        description: 'You have completed the quick start guide. Click confirm to proceed to the Customer Profile module and learn how to manage customer information effectively.',
        imageUrl: '',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Are you ready to explore more modules?',
        confirmButtonText: 'Yes, Continue to Next Module',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 1. Customer Profile
  {
    id: 'customer-profile',
    name: 'Customer Profile',
    steps: [
      {
        id: 'customer-profile-1',
        title: 'Open Customer Profile',
        description: 'Click the Customer Profile menu from the sidebar.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'customer-profile-2',
        title: 'Add a New Customer',
        description: 'Click "Add New Customer" and fill in the required details to create a customer profile.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'customer-profile-3',
        title: 'View Customer List',
        description: 'Once added, the customer will appear in the Customer List section.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'customer-profile-4',
        title: 'Open a Customer Profile',
        description: 'Click any customer from the list to view their complete profile details.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'customer-profile-5',
        title: 'Customer Sidebar',
        description: 'Inside the customer profile page, the sidebar displays all customers for easy navigation.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'customer-profile-6',
        title: 'Loyalty Points System',
        description: 'Loyalty points are automatically created when the customer completes a quiz. This helps in customer retention and engagement.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready to learn about Integration Management?',
        confirmButtonText: 'Continue to Integration',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 2. Integration Management
  {
    id: 'integration-management',
    name: 'Integration Management',
    steps: [
      {
        id: 'integration-1',
        title: 'Open Integration Management',
        description: 'Click the Integration Management menu from the sidebar.',
        imageUrl: 'https://cdn.prod.website-files.com/64d3ea9763ecfeda51231f05/64d458156c35e014adad6418_6033d6da39d77da71d42d3b9_Direction.gif',
      },
      {
        id: 'integration-2',
        title: 'Google Place Review',
        description: 'Select the Google Place Review integration to proceed.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'integration-3',
        title: 'Watch the Video',
        description: 'Click the Watch Video button to understand how to configure and use this integration.',
        imageUrl: '',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready for Personalization Insights?',
        confirmButtonText: 'Continue to Personalization',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 3. Personalization Insight
  {
    id: 'personalization-insight',
    name: 'Personalization Insight',
    steps: [
      {
        id: 'personalization-1',
        title: 'Open Personalization Insight',
        description: 'Click the Personalization Insight section from the sidebar.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'personalization-2',
        title: 'Use Filters',
        description: 'Use available filters to refine and analyze customer data.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'personalization-3',
        title: 'Watch the Workflow Video',
        description: 'Click the Watch Video button to understand the full workflow and insights.',
        imageUrl: '',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready to explore Customer Opportunities?',
        confirmButtonText: 'Continue to Opportunities',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 4. Customer Opportunities
  {
    id: 'customer-opportunities',
    name: 'Customer Opportunities',
    steps: [
      {
        id: 'opportunities-1',
        title: 'Open Customer Opportunities',
        description: 'Click the Customer Opportunities menu from the sidebar.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'opportunities-2',
        title: 'Watch Campaign Videos',
        description: 'Each campaign includes a Watch Video button to help you understand the strategy and workflow.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready to track Performance?',
        confirmButtonText: 'Continue to Performance',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 5. Performance Tracking
  {
    id: 'performance-tracking',
    name: 'Performance Tracking',
    steps: [
      {
        id: 'performance-1',
        title: 'Activities',
        description: 'View all activities performed by customers or team members in this section.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'performance-2',
        title: 'Conversion Rate',
        description: 'Track how many interactions convert into meaningful actions.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'performance-3',
        title: 'Customer Lifetime Value (CLV)',
        description: 'Monitor the total value generated by customers throughout their relationship.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'performance-4',
        title: 'Cart Value / Turnover',
        description: 'Analyze customer spending behavior and overall turnover.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'performance-5',
        title: 'Top Customers',
        description: 'Identify high-value customers based on engagement and spending.',
        imageUrl: '',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready to explore the Dashboard?',
        confirmButtonText: 'Continue to Dashboard',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 6. Dashboard
  {
    id: 'dashboard',
    name: 'Dashboard Overview',
    steps: [
      {
        id: 'dashboard-1',
        title: 'Open Dashboard',
        description: 'Click the Dashboard menu from the sidebar.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-2',
        title: 'Customer Profile Collection',
        description: 'View statistics related to customer profile collection.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-3',
        title: 'Customer Profile Overview',
        description: 'Get a complete overview of customer demographics and behavior.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-4',
        title: 'Customer Retention Rate',
        description: 'Track how well you are retaining customers over time.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-5',
        title: 'Customer Engagement Score',
        description: 'Monitor how frequently and deeply customers engage.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-6',
        title: 'Churn Rate',
        description: 'Identify how many customers are becoming inactive.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-7',
        title: 'Opt-In / Opt-Out Tracking',
        description: 'View customer preferences for communication and marketing.',
        imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      },
      {
        id: 'dashboard-8',
        title: 'Customer Satisfaction Score',
        description: 'Measure overall customer satisfaction based on surveys and feedback.',
        imageUrl: '',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready to learn about Quick Search?',
        confirmButtonText: 'Continue to Quick Search',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 7. Quick Search
  {
    id: 'quick-search',
    name: 'Quick Search',
    steps: [
      {
        id: 'search-1',
        title: 'Use Quick Search',
        description: 'Click the Quick Search bar to instantly find any customer profile and view their details.',
        imageUrl: '',
        showConfirmation: true,
        showGoBackOption: true,
        confirmationText: 'Ready to configure Settings?',
        confirmButtonText: 'Continue to Settings',
        cancelButtonText: 'No, Stay Here'
      },
    ],
  },

  // 8. Settings
  {
    id: 'settings',
    name: 'Settings',
    steps: [
      {
        id: 'settings-1',
        title: 'Open Settings',
        description: 'Click the Settings menu from the sidebar to access all configuration options.',
        imageUrl: '',
      },
      {
        id: 'settings-2',
        title: 'Open Loyalty Points',
        description: 'Click the Loyalty Points section to manage customer loyalty point settings.',
        imageUrl: '',
      },
      {
        id: 'settings-3',
        title: 'Watch Loyalty Points Video',
        description: 'Click the Watch Video button to understand the complete loyalty points flow.',
        imageUrl: '',
      },
      {
        id: 'settings-4',
        title: 'Open Coupon Page',
        description: 'Navigate to the Coupons page to manage coupon-related configurations.',
        imageUrl: '',
      },
      {
        id: 'settings-5',
        title: 'Watch Coupon Flow Video',
        description: 'Click the Watch Video button to understand the full coupon workflow.',
        imageUrl: '',
      },
      {
        id: 'settings-6',
        title: 'Customer Preferences',
        description: 'Navigate to Customer Preferences to manage user preference-related settings.',
        imageUrl: '',
      },
      {
        id: 'settings-7',
        title: 'Watch Customer Preference Flow',
        description: 'Click the Watch Video button to understand how customer preferences work.',
        imageUrl: '',
      },
      {
        id: 'settings-8',
        title: 'Daily Billing Update',
        description: 'Click the Daily Billing Update option under Settings to manage billing activity.',
        imageUrl: '',
      },
      {
        id: 'settings-9',
        title: 'Navigate to Daily Billing Page',
        description: 'Open the Daily Billing Update page to view or update billing details.',
        imageUrl: '',
      },
      {
        id: 'settings-10',
        title: 'Watch Daily Billing Video',
        description: 'Click the Watch Video button to understand the daily billing workflow.',
        imageUrl: '',
      },
      {
        id: 'settings-11',
        title: 'Inventory Settings',
        description: 'Open the Inventory section and click the Watch Video button to understand the inventory flow.',
        imageUrl: '',
        showConfirmation: false
      },
    ],
  }
];