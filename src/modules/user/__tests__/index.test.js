import { registerUser, getUser } from "../userManager";

describe("User Module", () => {
  it("registers a new user and retrieves user data", () => {
    const user = registerUser({
      id: "u1",
      name: "Jan Kowalski",
      email: "jan@example.com",
    });
    const retrieved = getUser("u1");
    expect(retrieved).toEqual(user);
    expect(retrieved.name).toBe("Jan Kowalski");
    expect(retrieved.email).toBe("jan@example.com");
  });
});
