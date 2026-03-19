import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "../components/Footer";

describe("Footer", () => {
  it("renders site name", () => {
    render(<Footer />);

    expect(screen.getByText("Hikmet Gulsesli")).toBeInTheDocument();
  });

  it("renders copyright text with current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();

    expect(screen.getByText(new RegExp(`Developer Portal © ${currentYear}`))).toBeInTheDocument();
  });

  it("renders footer navigation links", () => {
    render(<Footer />);

    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Projects").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Workbench").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Blog").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Introduction").length).toBeGreaterThanOrEqual(1);
  });

  it("has semantic footer element", () => {
    const { container } = render(<Footer />);

    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
