import React, { createContext, useContext, useState, useEffect } from "react";

const NetworkStatusContext = createContext();

export function useNetworkStatus() {
  return useContext(NetworkStatusContext);
}

export function NetworkStatusProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState("synced"); // 'synced', 'syncing', 'pending'
  const [pendingOperations, setPendingOperations] = useState(0);

  useEffect(() => {
    // Set up event listeners for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      // When coming back online, check for pending operations
      checkPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      // When going offline, check if there are pending operations
      checkPendingOperations();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check for pending operations
    checkPendingOperations();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check for pending operations in IndexedDB
  const checkPendingOperations = async () => {
    try {
      // Open IndexedDB
      const dbPromise = indexedDB.open("MistrzPromptowDB", 1);

      dbPromise.onsuccess = (event) => {
        const db = event.target.result;

        // Check if the pendingSync store exists
        if (!db.objectStoreNames.contains("pendingSync")) {
          setPendingOperations(0);
          setSyncStatus("synced");
          return;
        }

        const transaction = db.transaction(["pendingSync"], "readonly");
        const store = transaction.objectStore("pendingSync");
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          const count = countRequest.result;
          setPendingOperations(count);

          if (count > 0) {
            setSyncStatus(isOnline ? "syncing" : "pending");

            // If online, trigger sync
            if (
              isOnline &&
              "serviceWorker" in navigator &&
              "SyncManager" in window
            ) {
              navigator.serviceWorker.ready.then((registration) => {
                registration.sync.register("sync-user-progress");
              });
            }
          } else {
            setSyncStatus("synced");
          }
        };
      };

      dbPromise.onerror = () => {
        console.error("Error opening IndexedDB");
        setPendingOperations(0);
        setSyncStatus("synced");
      };
    } catch (error) {
      console.error("Error checking pending operations:", error);
      setPendingOperations(0);
      setSyncStatus("synced");
    }
  };

  const value = {
    isOnline,
    syncStatus,
    pendingOperations,
    checkPendingOperations,
  };

  return (
    <NetworkStatusContext.Provider value={value}>
      {children}
    </NetworkStatusContext.Provider>
  );
}
