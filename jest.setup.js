// Import jest-dom for DOM element matchers
require("@testing-library/jest-dom");

global.fetch = require("node-fetch");

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock indexedDB
const indexedDB = {
  open: jest.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          getAll: jest.fn().mockReturnValue({
            onsuccess: null,
            onerror: null,
          }),
          add: jest.fn().mockReturnValue({
            onsuccess: null,
            onerror: null,
          }),
          delete: jest.fn().mockReturnValue({
            onsuccess: null,
            onerror: null,
          }),
        }),
        oncomplete: null,
        onerror: null,
      }),
    },
  }),
};

global.indexedDB = indexedDB;

// Mock Request object for service worker tests
global.Request = class Request {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || "GET";
    this.headers = options.headers || {};
    this.body = options.body || null;
    this.mode = options.mode || "cors";
    this.credentials = options.credentials || "same-origin";
  }
};

// Increase timeout for Firebase tests
jest.setTimeout(15000);
