jest.mock("../../../firebase/firebase-config");
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../../App";

describe("UI Module", () => {
  it("renders the loading screen initially", async () => {
    render(<App />);
    // Check for loading screen
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
