/**
 * API utility functions for Ceylon Handicrafts
 */

import { getToken } from "./auth_utils.js";

// Fetch JSON data from API with authentication
export async function fetchJson(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail;
    try {
      const errorData = await response.json();
      errorDetail = errorData.detail || `HTTP error ${response.status}`;
    } catch (e) {
      errorDetail = `HTTP error ${response.status}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// Post data to API with authentication
export async function postJson(url, data, options = {}) {
  return fetchJson(url, {
    method: "POST",
    body: JSON.stringify(data),
    ...options,
  });
}

// Update data with PUT request
export async function putJson(url, data, options = {}) {
  return fetchJson(url, {
    method: "PUT",
    body: JSON.stringify(data),
    ...options,
  });
}

// Update data with PATCH request
export async function patchJson(url, data, options = {}) {
  return fetchJson(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    ...options,
  });
}

// Delete data
export async function deleteJson(url, options = {}) {
  return fetchJson(url, {
    method: "DELETE",
    ...options,
  });
}
