import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/workbench", label: "Workbench" },
  { href: "/blog", label: "Blog" },
  { href: "/introduction", label: "Introduction" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="font-semibold hover:text-primary transition-colors">
              Hikmet Gulsesli
            </Link>
            <p className="text-sm text-muted-foreground">
              Developer Portal &copy; {currentYear}
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-4">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
