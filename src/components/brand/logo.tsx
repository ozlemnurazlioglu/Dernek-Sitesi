import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  const textColor = variant === "dark" ? "text-brand-900" : "text-white";
  const subColor =
    variant === "dark" ? "text-muted-foreground" : "text-white/70";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-11 w-11 shrink-0">
        <svg
          viewBox="0 0 48 48"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0" stopColor="#163357" />
              <stop offset="1" stopColor="#0b1c33" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
          <path
            d="M14 30c0-5.523 4.477-10 10-10s10 4.477 10 10"
            stroke="#c9a35a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="24" cy="20" r="4" stroke="#c9a35a" strokeWidth="2.2" />
          <path
            d="M18 34h12"
            stroke="#ffffff"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={cn("text-base font-semibold tracking-tight", textColor)}>
          Umut Derneği
        </span>
        <span className={cn("text-[11px] uppercase tracking-[0.18em]", subColor)}>
          Eğitim · Dayanışma
        </span>
      </div>
    </div>
  );
}
