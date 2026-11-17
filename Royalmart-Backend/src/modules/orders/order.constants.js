// API status (upper-case, what clients send) -> stored DB status.
export const STATUS_MAP = {
  PENDING: 'pending',
  PROCESSING: 'confirmed',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};
export const CONVENIENCE_FEE = 99;
// Tolerance for client/server total mismatch caused by float rounding. Goal is
// to catch obvious price spoofing, not fight floats.
export const TOTAL_TOLERANCE = 1; // currency units
