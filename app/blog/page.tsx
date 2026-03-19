import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Hikmet Gulsesli",
  description: "Thoughts, tutorials, and insights on web development.",
};

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Blog</h1>
      <p className="text-muted-foreground text-lg">
        Thoughts, tutorials, and insights on web development. Coming soon.
      </p>
    </div>
  );
}
