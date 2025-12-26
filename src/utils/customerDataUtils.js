import { parsePhoneNumber } from "react-phone-number-input";

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
  let countryCode = "";
  let mobileNumber = formData.basic.mobileNumber;

  try {
    const phoneNumber = parsePhoneNumber(formData.basic.mobileNumber);
    if (phoneNumber) {
      countryCode = phoneNumber.countryCallingCode;
      mobileNumber = phoneNumber.nationalNumber;
    }
  } catch (error) {
    console.warn("Could not parse phone number, sending as is", error);
  }

  const apiData = {
    ...originalCustomer,
    firstname: formData.basic.firstname,
    lastname: formData.basic.lastname,
    countryCode: countryCode || originalCustomer.countryCode || "",
    mobileNumber,
    source: formData.basic.source,
    customerId: formData.basic.customerId,
    firstVisit: formData.basic.firstVisit,
    // Include gender in API payload, normalize to lowercase if present
    gender: formData.basic.gender ? String(formData.basic.gender).toLowerCase() : originalCustomer.gender,
    additionalData: {},
    advancedDetails: {},
    advancedPrivacyDetails: {}
  };

  // Handle additionalData
  if (formData.additionalData) {
    apiData.additionalData = Object.keys(formData.additionalData).reduce((acc, key) => {
      acc[key] = {
        ...originalCustomer.additionalData?.[key],
        value: formData.additionalData[key]
      };
      return acc;
    }, {});
  }

  // Handle advancedDetails
  if (formData.advancedDetails) {
    apiData.advancedDetails = Object.keys(formData.advancedDetails).reduce((acc, key) => {
      acc[key] = {
        ...originalCustomer.advancedDetails?.[key],
        value: formData.advancedDetails[key]
      };
      return acc;
    }, {});
  }

  // Handle advancedPrivacyDetails
  if (formData.advancedPrivacyDetails) {
    apiData.advancedPrivacyDetails = Object.keys(formData.advancedPrivacyDetails).reduce((acc, key) => {
      acc[key] = {
        ...originalCustomer.advancedPrivacyDetails?.[key],
        value: formData.advancedPrivacyDetails[key]
      };
      return acc;
    }, {});
  }

  return apiData;
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