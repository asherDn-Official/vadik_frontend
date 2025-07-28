// Utility functions to handle the new customer data format

/**
 * Extracts the value from a field object that has {value, type} structure
 * @param {Object|string|number} field - The field data
 * @returns {string|number|Date|Array} - The extracted value
 */
export const extractFieldValue = (field) => {
  if (!field) return '';
  
  // If it's already a primitive value, return as is
  if (typeof field !== 'object' || field instanceof Date) {
    return field;
  }
  
  // If it has the new structure with value and type
  if (field.hasOwnProperty('value')) {
    const { value, type } = field;
    
    // Handle different types
    switch (type) {
      case 'date':
        return value ? new Date(value) : '';
      case 'number':
        return value ? Number(value) : '';
      case 'array':
        return Array.isArray(value) ? value : (value ? [value] : []);
      case 'percentage':
        return value ? `${value}%` : '';
      case 'string':
      case 'options':
      default:
        return value || '';
    }
  }
  
  // If it's an object but not in the expected format, return as is
  return field;
};

/**
 * Transforms customer data from new format to display format
 * @param {Object} customer - The customer object from API
 * @returns {Object} - Transformed customer object
 */
export const transformCustomerData = (customer) => {
  if (!customer) return null;
  
  const transformed = {
    ...customer,
    // Transform additionalData
    additionalData: customer.additionalData ? 
      Object.keys(customer.additionalData).reduce((acc, key) => {
        acc[key] = extractFieldValue(customer.additionalData[key]);
        return acc;
      }, {}) : {},
    
    // Transform advancedDetails
    advancedDetails: customer.advancedDetails ? 
      Object.keys(customer.advancedDetails).reduce((acc, key) => {
        acc[key] = extractFieldValue(customer.advancedDetails[key]);
        return acc;
      }, {}) : {},
    
    // Transform advancedPrivacyDetails
    advancedPrivacyDetails: customer.advancedPrivacyDetails ? 
      Object.keys(customer.advancedPrivacyDetails).reduce((acc, key) => {
        acc[key] = extractFieldValue(customer.advancedPrivacyDetails[key]);
        return acc;
      }, {}) : {}
  };
  
  return transformed;
};

/**
 * Transforms form data back to API format
 * @param {Object} formData - The form data to transform
 * @param {Object} originalCustomer - The original customer data for type reference
 * @returns {Object} - Transformed data for API
 */
export const transformFormDataToAPI = (formData, originalCustomer) => {
  const transformed = {
    basic: formData.basic,
    additionalData: {},
    advancedDetails: {},
    advancedPrivacyDetails: {}
  };
  
  // Transform additionalData back to API format
  if (formData.additionalData && originalCustomer.additionalData) {
    Object.keys(formData.additionalData).forEach(key => {
      const originalField = originalCustomer.additionalData[key];
      const newValue = formData.additionalData[key];
      
      if (originalField && typeof originalField === 'object' && originalField.hasOwnProperty('type')) {
        transformed.additionalData[key] = {
          value: newValue,
          type: originalField.type
        };
      } else {
        transformed.additionalData[key] = {
          value: newValue,
          type: 'string' // default type
        };
      }
    });
  }
  
  // Transform advancedDetails back to API format
  if (formData.advancedDetails && originalCustomer.advancedDetails) {
    Object.keys(formData.advancedDetails).forEach(key => {
      const originalField = originalCustomer.advancedDetails[key];
      const newValue = formData.advancedDetails[key];
      
      if (originalField && typeof originalField === 'object' && originalField.hasOwnProperty('type')) {
        transformed.advancedDetails[key] = {
          value: newValue,
          type: originalField.type
        };
      } else {
        transformed.advancedDetails[key] = {
          value: newValue,
          type: 'string' // default type
        };
      }
    });
  }
  
  // Transform advancedPrivacyDetails back to API format
  if (formData.advancedPrivacyDetails && originalCustomer.advancedPrivacyDetails) {
    Object.keys(formData.advancedPrivacyDetails).forEach(key => {
      const originalField = originalCustomer.advancedPrivacyDetails[key];
      const newValue = formData.advancedPrivacyDetails[key];
      
      if (originalField && typeof originalField === 'object' && originalField.hasOwnProperty('type')) {
        transformed.advancedPrivacyDetails[key] = {
          value: newValue,
          type: originalField.type
        };
      } else {
        transformed.advancedPrivacyDetails[key] = {
          value: newValue,
          type: 'string' // default type
        };
      }
    });
  }
  
  return transformed;
};

/**
 * Formats field value for display based on type
 * @param {any} value - The field value
 * @param {string} type - The field type
 * @returns {string} - Formatted display value
 */
export const formatFieldForDisplay = (value, type) => {
  if (!value && value !== 0) return '-';
  
  switch (type) {
    case 'date':
      return value instanceof Date ? value.toLocaleDateString() : 
             (typeof value === 'string' ? new Date(value).toLocaleDateString() : value);
    case 'number':
      return typeof value === 'number' ? value.toString() : value;
    case 'percentage':
      return typeof value === 'string' && value.includes('%') ? value : `${value}%`;
    case 'array':
      return Array.isArray(value) ? value.join(', ') : value;
    default:
      return value.toString();
  }
};

/**
 * Gets the appropriate input type for a field based on its type
 * @param {string} fieldType - The field type from the schema
 * @returns {string} - HTML input type
 */
export const getInputType = (fieldType) => {
  switch (fieldType) {
    case 'number':
    case 'percentage':
      return 'number';
    case 'date':
      return 'date';
    case 'boolean':
      return 'checkbox';
    default:
      return 'text';
  }
};

/**
 * Gets the original field type from customer data
 * @param {Object} customer - The original customer object
 * @param {string} section - The section name (additionalData, advancedDetails, etc.)
 * @param {string} fieldName - The field name
 * @returns {string} - The field type
 */
export const getFieldType = (customer, section, fieldName) => {
  if (!customer || !customer[section] || !customer[section][fieldName]) {
    return 'string';
  }
  
  const field = customer[section][fieldName];
  return field.type || 'string';
};