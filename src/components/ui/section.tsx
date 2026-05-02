import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 max-w-3xl",
        align === "center" && "items-center text-center mx-auto",
      )}
    >
      {eyebrow && (
        <div className="flex items-center gap-3">
          <span className="gold-divider" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
            {eyebrow}
          </span>
          <span className="gold-divider" />
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-brand-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}
