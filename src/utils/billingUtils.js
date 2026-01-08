export const GST_PERCENTAGE = 18;

export const calculateGST = (amount) => {
  const gst = Math.round((amount * GST_PERCENTAGE) / 100);
  return gst;
};

export const calculateTotalWithGST = (subtotal) => {
  const gstAmount = calculateGST(subtotal);
  return {
    subtotal,
    gstAmount,
    gstPercentage: GST_PERCENTAGE,
    totalAmount: subtotal + gstAmount,
  };
};

export const formatPrice = (amount) => {
  return amount ? `₹${amount.toLocaleString()}` : '₹0';
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
