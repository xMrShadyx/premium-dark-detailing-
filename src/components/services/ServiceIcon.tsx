/** Line icons from the mock-up: a headlight with beams, and a car seat. */
export function ServiceIcon({ id, size = 40, className }: { id: string; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  if (id === "headlight-restoration") {
    return (
      <svg {...common}>
        <path d="M20 12c9 0 16 5 16 12s-7 12-16 12c-2 0-3-1-3-3V15c0-2 1-3 3-3Z" />
        <circle cx="27" cy="24" r="4" />
        <path d="M3 16h10M2 24h11M3 32h10" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="18" y="3" width="11" height="7" rx="3" />
      <path d="M16 14c0-2 1.5-3 3.5-3h8c2.5 0 4 1.5 3.5 4l-3 17H17Z" />
      <path d="M12 32h22c2.5 0 4 2 3.4 4.3L36.5 40H11c-2 0-3-1.6-2.4-3.4l.6-2C9.6 33 10.6 32 12 32Z" />
      <path d="M15 40v5M33 40v5" />
    </svg>
  );
}
