// Mock Firebase
jest.mock("../firebase/firebase-config");

// Import crypto utilities
import { encrypt, decrypt } from "../utils/crypto";

// Skip this test for now
describe.skip("Security", () => {
  it("properly encrypts and decrypts sensitive data", () => {
    // Test data
    const sensitiveData = "user-password-123";

    // Encrypt the data
    const encryptedData = encrypt(sensitiveData);

    // Verify encryption changed the data
    expect(encryptedData).not.toBe(sensitiveData);

    // Verify decryption works correctly
    const decryptedData = decrypt(encryptedData);
    expect(decryptedData).toBe(sensitiveData);
  });
});
