/**
 * Mock user manager for registration and retrieval.
 */

const mockUserStore = {};

export function registerUser({ id, name, email }) {
  const user = { id, name, email };
  mockUserStore[id] = user;
  return user;
}

export function getUser(id) {
  return mockUserStore[id] || null;
}
