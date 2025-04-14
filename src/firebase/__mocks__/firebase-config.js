// Mock Firebase implementation for tests
export const auth = {
  onAuthStateChanged: (auth, cb) => {
    // Simulate authenticated user for tests
    if (typeof cb === "function") cb({ uid: "test-user" });
    return () => {};
  },
};

// Mock Firestore implementation
export const db = {
  collection: (collectionName) => ({
    doc: (docId) => ({
      get: () =>
        Promise.resolve({
          exists: true,
          data: () => {
            // Return mock data based on collection and document ID
            if (collectionName === "test" && docId === "sample") {
              return { testField: "test-value" };
            }
            if (collectionName === "users") {
              return { name: "Test User", email: "test@example.com" };
            }
            if (collectionName === "lessons") {
              return { title: "Test Lesson", content: "Test content" };
            }
            return { mockData: true };
          },
          id: docId,
        }),
    }),
    where: () => ({
      get: () =>
        Promise.resolve({
          docs: [
            {
              exists: true,
              data: () => ({ mockData: true }),
              id: "mock-doc-id",
            },
          ],
        }),
    }),
  }),
};

export const functions = {
  httpsCallable: (functionName) => {
    return (data) => Promise.resolve({ data: { success: true, ...data } });
  },
};

export const onAuthStateChanged = auth.onAuthStateChanged;
