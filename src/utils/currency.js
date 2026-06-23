// src/utils/currency.js
// Smart USD -> INR conversion + Indian-market price tuning



export const convertUSDToINR = (usdAmount) => {
  return Number(usdAmount || 0);
};

export const computeMarketINR = (usdAmount, category) => {
  return Number(usdAmount || 0);
};

export const formatCurrencyINR = (amountInINR) => {
  const value = Number(amountInINR || 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const convertAdjustAndFormat = (usdAmount, category) => {
  // Direct pass-through of the amount from JSON
  const inr = computeMarketINR(usdAmount, category);
  return formatCurrencyINR(inr);
};

// Named export default to avoid anonymous default-export lint
const currencyUtils = {
  convertUSDToINR,
  computeMarketINR,
  formatCurrencyINR,
  convertAdjustAndFormat
};

export default currencyUtils;
