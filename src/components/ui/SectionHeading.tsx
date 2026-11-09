import { cn } from "@/lib/cn";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

/** Section heading from the mock-up: spaced-out eyebrow between glowing lines, bold title. `id` labels the section. */
export function SectionHeading({ id, eyebrow, title, subtitle, align = "center", className }: Props) {
  const line = "h-0.5 w-12 rounded-full bg-accent shadow-[0_0_8px] shadow-accent sm:w-16";
  return (
    <header className={cn("max-w-4xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "mb-3 flex items-center gap-4 text-xs font-semibold tracking-[0.4em] text-fg uppercase",
          align === "center" && "justify-center",
        )}
      >
        <span aria-hidden="true" className={line} />
        {eyebrow}
        {align === "center" && <span aria-hidden="true" className={line} />}
      </p>
      <h2 id={id} className="text-[clamp(1.75rem,1.2rem+1.7vw,2.5rem)] leading-tight font-extrabold text-fg">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-base text-fg-muted sm:text-lg">{subtitle}</p>}
    </header>
  );
}
