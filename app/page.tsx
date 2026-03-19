import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="max-w-3xl mx-auto text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Welcome to Hikmet Gulsesli&apos;s Developer Portal
        </h1>
        <p className="text-lg text-muted-foreground">
          Explore projects, tools, and insights from a passionate developer.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/introduction"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-muted-foreground">
            Browse through a collection of development projects and experiments.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Workbench</h2>
          <p className="text-muted-foreground">
            Interactive tools and utilities for development and testing.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Blog</h2>
          <p className="text-muted-foreground">
            Thoughts, tutorials, and insights on web development.
          </p>
        </div>
      </section>
    </div>
  );
}
