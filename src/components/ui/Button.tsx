import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap " +
  "transition-[background-color,border-color,color,transform] duration-200 ease-(--ease-premium) " +
  "active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-[#12a092] to-[#086157] text-white glow-accent hover:from-[#18b2a2] hover:to-[#0a6f64]",
  secondary: "border border-line bg-surface/60 text-fg hover:border-accent/60 hover:bg-accent/10",
  /** White outline from the site mock-up (hero "Виж резултати", "Изпрати имейл"). */
  outline: "border border-fg/80 text-fg hover:border-accent hover:bg-accent/10",
  ghost: "text-fg-muted hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "px-4 text-sm",
  md: "h-13 px-7 text-[0.95rem]",
};

type StyleProps = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "primary", size = "md" }: StyleProps = {}, extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps) {
  return <a className={buttonClasses({ variant, size }, className)} {...props} />;
}
