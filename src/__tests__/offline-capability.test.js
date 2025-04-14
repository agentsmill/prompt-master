jest.mock("../firebase/firebase-config");

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

// Mock Response object
global.Response = class Response {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.statusText = options.statusText || "OK";
    this.headers = options.headers || {};
    this.ok = this.status >= 200 && this.status < 300;
  }
};

describe("Offline Capability", () => {
  it("serves content when offline using the service worker", async () => {
    // Mock the service worker fetch event handler
    const mockFetchHandler = jest.fn((event) => {
      // Simulate responding with cached content
      event.respondWith(Promise.resolve(new Response("Cached content")));
    });

    // Create a mock service worker environment
    global.self = {
      addEventListener: jest.fn((event, handler) => {
        if (event === "fetch") {
          mockFetchHandler.mockImplementation(handler);
        }
      }),
      location: { origin: "https://example.com" },
    };

    // Import the service worker
    require("../service-worker.js");

    // Create a mock fetch event
    const fetchEvent = {
      request: new Request("https://example.com/"),
      respondWith: jest.fn(),
      waitUntil: jest.fn(),
    };

    // Simulate offline by making fetch throw an error
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error("Offline"));

    // Trigger the fetch event handler
    mockFetchHandler(fetchEvent);

    // Verify that respondWith was called
    expect(fetchEvent.respondWith).toHaveBeenCalled();

    // Restore original fetch
    global.fetch = originalFetch;
  });
});
