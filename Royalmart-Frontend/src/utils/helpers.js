import { CURRENCY } from './constants';

export function pluralise(count, noun) {
  return `${count} ${noun}${count !== 1 ? 's' : ''}`;
}

export function formatPrice(amount) {
  return CURRENCY + Number.parseFloat(amount).toFixed(2);
}

export function calcSalePrice(originalPrice, discountPct) {
  return Number.parseFloat((originalPrice * (1 - discountPct / 100)).toFixed(2));
}

export function formatRatingCount(count) {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}

export function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = [1];

  if (current > 3) pages.push('...');

  const rangeStart = Math.max(2, current - 1);
  const rangeEnd = Math.min(total - 1, current + 1);

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}

export function formatShortDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatLongDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatMonthYear(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
}

export function getEmailJsConfig() {
  const config = window.EMAILJS_CONFIG || {};
  const { publicKey, serviceId, templateId } = config;

  if (!publicKey || !serviceId || !templateId) return null;
  if ([publicKey, serviceId, templateId].some((value) => value.startsWith('YOUR_EMAILJS_'))) {
    return null;
  }

  return { publicKey, serviceId, templateId };
}
