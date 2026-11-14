import type { Offer } from "@/config/schema";

/** Line icons for the price list, in the style of the ad: car, van, headlight, headlight + shield, package. */
export function OfferIcon({ icon, size = 44, className }: { icon: Offer["icon"]; size?: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
  const headlight = (
    <>
      <path d="M6 30c0-8 8-15 22-17 6-1 10 1 10 4 0 6-7 15-20 17-7 1-12 0-12-4Z" />
      <ellipse cx="25" cy="23" rx="7" ry="5" transform="rotate(-18 25 23)" />
      <ellipse cx="15" cy="27" rx="4" ry="3" transform="rotate(-18 15 27)" />
    </>
  );
  switch (icon) {
    case "car":
      return (
        <svg {...common}>
          <path d="M6 30v-5c0-2 1-3 3-3.5L13 20l4-6c1-1.5 2.5-2 4-2h8c1.5 0 3 .5 4 2l4 6 3.5 1.5c2 .5 3.5 1.5 3.5 3.5V30" />
          <path d="M5 30h38v4c0 1-1 2-2 2h-4M11 36H7c-1 0-2-1-2-2" />
          <path d="M14 20h20" />
          <circle cx="12" cy="27" r="1.5" />
          <circle cx="36" cy="27" r="1.5" />
          <path d="M11 36v3M37 36v3M17 36h14" />
        </svg>
      );
    case "van":
      return (
        <svg {...common}>
          <path d="M8 34V14c0-2 1.5-3 3.5-3h25c2 0 3.5 1 3.5 3v20" />
          <path d="M8 22h32M24 11v11" />
          <path d="M6 34h36v3c0 1-1 2-2 2H8c-1 0-2-1-2-2Z" />
          <circle cx="13" cy="29" r="1.5" />
          <circle cx="35" cy="29" r="1.5" />
          <path d="M5 18h3M40 18h3" />
        </svg>
      );
    case "headlight":
      return <svg {...common}>{headlight}</svg>;
    case "headlight-coated":
      return (
        <svg {...common}>
          <g transform="translate(-3 3) scale(0.86)">{headlight}</g>
          <path d="M38 4l7 2.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5Z" />
          <path d="M35 12l2.2 2.2L41.5 10" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M8 18h32v22c0 1-1 2-2 2H10c-1 0-2-1-2-2Z" />
          <path d="M6 12h36v6H6Z" />
          <path d="M24 12v30" />
          <path d="M24 12c-3-6-10-7-10-3 0 3 6 3 10 3ZM24 12c3-6 10-7 10-3 0 3-6 3-10 3Z" />
        </svg>
      );
  }
}
