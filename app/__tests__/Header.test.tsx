import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "../components/Header";

describe("Header", () => {
  it("renders site name", () => {
    render(<Header />);

    expect(screen.getByText("Hikmet Gulsesli")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<Header />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Workbench")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
  });

  it("has correct navigation hrefs", () => {
    render(<Header />);

    expect(screen.getByText("Home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Projects").closest("a")).toHaveAttribute("href", "/projects");
    expect(screen.getByText("Workbench").closest("a")).toHaveAttribute("href", "/workbench");
    expect(screen.getByText("Blog").closest("a")).toHaveAttribute("href", "/blog");
    expect(screen.getByText("Introduction").closest("a")).toHaveAttribute("href", "/introduction");
  });

  it("renders mobile menu button", () => {
    render(<Header />);

    const menuButton = screen.getByLabelText(/menu/i);
    expect(menuButton).toBeInTheDocument();
  });
});
