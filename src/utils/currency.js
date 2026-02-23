// src/utils/currency.js
// Smart USD -> INR conversion + Indian-market price tuning

// Base conversion rate (keeps the explicit USD->INR rate for transparency)
// Base conversion rate (1:1 as per user request to match JSON exactly)
const USD_TO_INR = 1;

// Remove category factors - direct pass through
const CATEGORY_FACTORS = {
  default: 1.0
};

// Simple rounding or direct value
function toRetailPriceINR(amount) {
  return Math.round(amount);
}

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
