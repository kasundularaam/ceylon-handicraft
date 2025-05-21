/**
 * Authentication utilities for Ceylon Handicrafts
 */

// Store token in localStorage
export function saveToken(token) {
  localStorage.setItem("auth_token", token);
}

// Retrieve token from localStorage
export function getToken() {
  return localStorage.getItem("auth_token");
}

// Check if user is signed in
export function isSignedIn() {
  return !!getToken() && !!getUser();
}

// Sign in user
export async function signIn(email, password) {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Login failed");
    }

    const data = await response.json();
    saveToken(data.access_token);
    saveUser(data.user);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Sign out user
export function signOut() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("user");
  window.location.href = "/";
}

// Store user data in localStorage
export function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

// Get user data from localStorage
export function getUser() {
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

// Get user role
export function getRole() {
  const user = getUser();
  return user ? user.role : null;
}

// Redirect based on user role
export function redirectBasedOnRole() {
  if (!isSignedIn()) return;

  const role = getRole();

  if (role === "Admin") {
    window.location.href = "/admin";
  } else if (role === "Craftsman") {
    window.location.href = "/craftsman";
  }
}
