export const calculatePrice = (durationHours, pricePerHour) => {
  if (durationHours <= 0 || pricePerHour <= 0) return 0;
  
  // Basic calculation
  let total = durationHours * pricePerHour;
  
  // Could add complex logic here like:
  // - peak hour surcharges
  // - long-duration discounts
  // - tax calculations
  
  return parseFloat(total.toFixed(2));
};
