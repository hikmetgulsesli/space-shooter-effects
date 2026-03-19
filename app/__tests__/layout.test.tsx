import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "../layout";

describe("RootLayout", () => {
  it("renders Header component", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Header contains a link with "Hikmet Gulsesli" and has sticky positioning
    const header = document.querySelector("header");
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass("sticky");
  });

  it("renders children content", () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("renders Footer component", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    expect(screen.getByText(/Developer Portal/)).toBeInTheDocument();
  });

  it("has correct semantic structure", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("main")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("applies flex layout classes", () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const body = container.querySelector("body");
    expect(body).toHaveClass("min-h-screen", "flex", "flex-col");
  });
});
