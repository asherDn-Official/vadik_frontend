export function getModulePath(module) {
  const modulePathMap = {
    dashboard: '/dashboard',
    customers: '/customers',
    personalization: '/personalization',
    customerOpportunities: '/customeropportunities',
    performance: '/performance',
    integration: '/integration',
    kyc: '/kyc',
    settings: '/settings'
  };
  
  return modulePathMap[module] || '/';
}