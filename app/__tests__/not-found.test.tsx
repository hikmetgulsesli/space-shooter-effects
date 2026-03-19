import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFoundPage from "../not-found";

describe("NotFoundPage", () => {
  it("renders 404 heading", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders page not found message", () => {
    render(<NotFoundPage />);

    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("renders helpful description", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByText(/Sorry, we couldn't find the page you're looking for/)
    ).toBeInTheDocument();
  });

  it("renders link back to home", () => {
    render(<NotFoundPage />);

    const homeLink = screen.getByRole("link", { name: /Back to Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("has correct container structure", () => {
    const { container } = render(<NotFoundPage />);

    expect(container.querySelector(".container")).toBeInTheDocument();
  });
});
