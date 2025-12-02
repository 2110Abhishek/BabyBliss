// src/utils/currency.js
// Smart USD -> INR conversion + Indian-market price tuning

// Base conversion rate (keeps the explicit USD->INR rate for transparency)
const USD_TO_INR = 89;

// Per-category market adjustment factors (tune these to taste)
const CATEGORY_FACTORS = {
  clothing: 0.35,
  toys: 0.45,
  feeding: 0.40,
  bath: 0.38,
  new: 0.75,
  nursery: 0.50,
  safety: 0.65,
  travel: 0.60,
  electronics: 0.85,
  default: 0.50
};

// Round computed INR to market-friendly price (nearest 10, then -1)
function toRetailPriceINR(amount) {
  const roundedTo10 = Math.round(amount / 10) * 10;
  let retail = Math.max(1, roundedTo10 - 1);
  if (retail < 1) retail = Math.ceil(amount);
  return retail;
}

export const convertUSDToINR = (usdAmount) => {
  const value = Number(usdAmount || 0);
  return value * USD_TO_INR;
};

function getCategoryFactor(category) {
  if (!category) return CATEGORY_FACTORS.default;
  const key = String(category).toLowerCase();
  return CATEGORY_FACTORS[key] ?? CATEGORY_FACTORS.default;
}

export const computeMarketINR = (usdAmount, category) => {
  const inr = convertUSDToINR(usdAmount);
  const factor = getCategoryFactor(category);
  const adjusted = inr * factor;
  const retail = toRetailPriceINR(adjusted);
  return retail;
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
    