const CACHE_NAME = "mistrz-promptow-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/static/js/main.js",
  "/static/css/main.css",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Claim clients so the service worker is in control immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests differently
  if (event.request.url.includes("/api/")) {
    return handleApiRequest(event);
  }

  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If fetch fails, try to return the offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
          return null;
        });
    })
  );
});

// Handle API requests with network-first strategy
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
}

// Background sync for offline operations
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-user-progress") {
    event.waitUntil(syncUserProgress());
  }
});

// Function to sync user progress from IndexedDB to Firebase
async function syncUserProgress() {
  try {
    const db = await openDatabase();
    const pendingOperations = await getPendingOperations(db);

    if (pendingOperations.length === 0) {
      return;
    }

    // Process each pending operation
    for (const operation of pendingOperations) {
      try {
        // Send to server
        const response = await fetch("/api/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(operation.data),
        });

        if (response.ok) {
          // If successful, remove from pending operations
          await deletePendingOperation(db, operation.id);
        }
      } catch (error) {
        console.error("Error syncing operation:", error);
      }
    }
  } catch (error) {
    console.error("Error in syncUserProgress:", error);
  }
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("MistrzPromptowDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pendingSync")) {
        db.createObjectStore("pendingSync", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Helper function to get pending operations
function getPendingOperations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pendingSync"], "readonly");
    const store = transaction.objectStore("pendingSync");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Helper function to delete a pending operation
function deletePendingOperation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pendingSync"], "readwrite");
    const store = transaction.objectStore("pendingSync");
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
