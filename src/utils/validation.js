/**
 * Input validation utilities for user data.
 * Use these functions to validate user input before processing or storing.
 */

export function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
  // At least 8 characters, one uppercase, one lowercase, one number
  return (
    typeof password === "string" &&
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password)
  );
}

export function validateUsername(username) {
  // 3-32 chars, alphanumeric and underscores only
  return typeof username === "string" && /^[a-zA-Z0-9_]{3,32}$/.test(username);
}
