/**
 * Date utility functions for Ceylon Handicrafts
 */

/**
 * Format a date as a string
 * @param {Date|string} date - Date object or ISO string
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat("en-US", mergedOptions).format(dateObj);
}

/**
 * Format a date and time as a string
 * @param {Date|string} date - Date object or ISO string
 * @param {object} options - Formatting options
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date, options = {}) {
  const dateObj = date instanceof Date ? date : new Date(date);

  const defaultOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat("en-US", mergedOptions).format(dateObj);
}

/**
 * Get the time remaining between now and a future date
 * @param {Date|string} endDate - The end date (Date object or ISO string)
 * @returns {object} Object with days, hours, minutes, seconds, and total milliseconds
 */
export function getTimeRemaining(endDate) {
  const total = new Date(endDate) - new Date();

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { total, days, hours, minutes, seconds };
}

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if the date is in the past
 */
export function isDatePassed(date) {
  return new Date() > new Date(date);
}

/**
 * Format a relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now - dateObj;

  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) {
    return diffSec < 10 ? "just now" : `${diffSec} seconds ago`;
  }

  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);

  if (diffMin < 60) {
    return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  }

  // Convert to hours
  const diffHour = Math.floor(diffMin / 60);

  if (diffHour < 24) {
    return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  }

  // Convert to days
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay < 7) {
    return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  }

  // Convert to weeks
  const diffWeek = Math.floor(diffDay / 7);

  if (diffWeek < 4) {
    return `${diffWeek} week${diffWeek === 1 ? "" : "s"} ago`;
  }

  // Convert to months
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMonth < 12) {
    return `${diffMonth} month${diffMonth === 1 ? "" : "s"} ago`;
  }

  // Convert to years
  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} year${diffYear === 1 ? "" : "s"} ago`;
}
