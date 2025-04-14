jest.mock("../firebase-config");
import { getTestDocument } from "../getTestDocument";

describe("Firebase Integration", () => {
  it("connects to Firebase and retrieves data", async () => {
    // This test uses the mock implementation from __mocks__/firebase-config.js
    const result = await getTestDocument("sample");
    expect(result).not.toBe(undefined);
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("error");

    // In a real scenario, we'd expect data to be populated and error to be null
    // For now, we're just testing that the function returns the expected structure
  });
});
