import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Introduction — Hikmet Gulsesli",
  description: "Learn more about Hikmet Gulsesli and background.",
};

export default function IntroductionPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Introduction</h1>
      <p className="text-muted-foreground text-lg">
        Learn more about my background and experience. Coming soon.
      </p>
    </div>
  );
}
