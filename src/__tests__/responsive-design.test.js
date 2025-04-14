jest.mock("../firebase/firebase-config");
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("Responsive Design", () => {
  describe("Viewport Rendering", () => {
    // Mock different viewport sizes
    const viewports = [
      { width: 375, height: 667, label: "mobile" },
      { width: 768, height: 1024, label: "tablet" },
      { width: 1280, height: 800, label: "desktop" },
    ];

    // Test each viewport size
    viewports.forEach(({ width, height, label }) => {
      it(`renders correctly on ${label} viewport`, async () => {
        // Set viewport size
        Object.defineProperty(window, "innerWidth", { value: width });
        Object.defineProperty(window, "innerHeight", { value: height });
        window.dispatchEvent(new Event("resize"));
        render(<App />);

        // Check for loading screen
        expect(screen.getByText("Loading...")).toBeInTheDocument();

        // We would check for responsive classes or styles here
        // but for now we're just verifying the app renders without crashing
      });
    });
  });
});
