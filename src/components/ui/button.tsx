import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-800 text-white hover:bg-brand-700 active:bg-brand-900 shadow-sm",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100 border border-brand-100",
  outline:
    "bg-white text-brand-800 border border-brand-200 hover:bg-brand-50",
  ghost: "bg-transparent text-brand-800 hover:bg-brand-50",
  gold:
    "bg-gold-400 text-brand-900 hover:bg-gold-300 active:bg-gold-500 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  },
);

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  external?: boolean;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  leftIcon,
  rightIcon,
  children,
  external,
}: ButtonLinkProps) {
  const styles = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a
        href={href}
        className={styles}
        target="_blank"
        rel="noopener noreferrer"
      >
        {leftIcon}
        <span>{children}</span>
        {rightIcon}
      </a>
    );
  }
  return (
    <Link href={href} className={styles}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  );
}
