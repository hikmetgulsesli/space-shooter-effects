import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Hikmet Gulsesli",
  description: "Browse through development projects and experiments.",
};

export default function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Projects</h1>
      <p className="text-muted-foreground text-lg">
        A collection of development projects and experiments. Coming soon.
      </p>
    </div>
  );
}
