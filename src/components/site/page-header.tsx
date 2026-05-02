import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/section";

type Crumb = { label: string; href?: string };

export function PageHeader({
  title,
  description,
  breadcrumbs,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
}) {
  return (
    <section className="relative overflow-hidden bg-brand-900 text-white">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
      <div className="absolute -left-32 -bottom-32 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
      <Container className="relative py-16 md:py-20">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="breadcrumb"
            className="text-xs text-white/60 flex items-center gap-1.5 mb-5 flex-wrap"
          >
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gold-300">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/85">{crumb.label}</span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-white/30" />
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-base md:text-lg text-white/75 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </Container>
    </section>
  );
}
