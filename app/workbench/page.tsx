import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workbench — Hikmet Gulsesli",
  description: "Interactive tools and utilities for development.",
};

export default function WorkbenchPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Workbench</h1>
      <p className="text-muted-foreground text-lg">
        Interactive tools and utilities for development and testing. Coming soon.
      </p>
    </div>
  );
}
