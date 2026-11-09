import { cn } from "@/lib/cn";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

/** Section heading. `id` is used by the parent <section aria-labelledby>. */
export function SectionHeading({ id, eyebrow, title, subtitle, align = "left", className }: Props) {
  return (
    <header className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className="mb-3 flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-gold uppercase">
        <span aria-hidden="true" className="h-px w-8 bg-gold/60" />
        {eyebrow}
      </p>
      <h2 id={id} className="text-section font-semibold text-fg">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-fg-muted sm:text-lg">{subtitle}</p>}
    </header>
  );
}
