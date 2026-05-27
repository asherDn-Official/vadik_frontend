export const GST_PERCENTAGE = 18;

export const calculateGST = (amount) => {
  const gst = (amount * GST_PERCENTAGE) / 100;
  return Math.round(gst * 100) / 100;
};

export const calculateTotalWithGST = (subtotal) => {
  const gstAmount = calculateGST(subtotal);
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount,
    gstPercentage: GST_PERCENTAGE,
    totalAmount: Math.round((subtotal + gstAmount) * 100) / 100,
  };
};

export const calculateGSTFromInclusiveTotal = (totalAmount) => {
  const numericTotal = Number(totalAmount) || 0;
  const subtotal = numericTotal / (1 + GST_PERCENTAGE / 100);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const gstAmount = Math.round((numericTotal - roundedSubtotal) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    gstAmount,
    gstPercentage: GST_PERCENTAGE,
    totalAmount: numericTotal,
  };
};

export const formatPrice = (amount) => {
  return amount !== undefined && amount !== null 
    ? `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : 'Rs. 0.00';
};

export const downloadBill = (subscriptionId, type = 'subscription') => {
  const link = document.createElement('a');
  if (type === 'topup') {
    link.href = `/api/subscriptions/topup/${subscriptionId}/bill/download`;
    link.download = `topup-bill-${subscriptionId}.html`;
  } else {
    link.href = `/api/subscriptions/${subscriptionId}/bill/download`;
    link.download = `bill-${subscriptionId}.html`;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
