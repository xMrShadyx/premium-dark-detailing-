import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  /** Accessible name for the slider, e.g. "Before and after comparison: …". */
  label: string;
  hint?: string;
  className?: string;
};

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/**
 * Before/after comparison (SRS §5.4): before image underneath, after image on
 * top clipped at the handle. Mouse and touch drag anywhere on the image,
 * keyboard on the handle (arrows ±5, PageUp/Down ±10, Home/End). Starts at 50%.
 * touch-action: pan-y keeps vertical page scrolling while horizontal drags compare.
 */
export function BeforeAfterSlider({ before, after, beforeLabel, afterLabel, label, hint, className }: Props) {
  const [position, setPosition] = useState(50);
  const [failed, setFailed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = useCallback((clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    setPosition(clamp(((clientX - box.left) / box.width) * 100));
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(e.clientX);
  };
  const stop = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -10, PageUp: 10 }[e.key];
    if (step !== undefined) {
      e.preventDefault();
      setPosition((p) => clamp(p + step));
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      setPosition(e.key === "Home" ? 0 : 100);
    }
  };

  if (failed) {
    return (
      <div className={cn("flex aspect-[2/1] items-center justify-center rounded-2xl bg-bg-2 text-fg-muted", className)}>
        <ImageOff aria-hidden="true" size={28} />
      </div>
    );
  }

  const round = Math.round(position);

  return (
    <div
      ref={boxRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      className={cn(
        "relative aspect-[2/1] cursor-ew-resize touch-pan-y overflow-hidden rounded-2xl border border-line bg-bg-2 select-none",
        className,
      )}
    >
      <img
        src={before}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={after}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <span className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-white/15 bg-black/70 px-3 py-1 text-sm font-semibold text-fg">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 bottom-3 rounded-lg bg-gradient-to-b from-[#3a9bff] to-[#0b5fd1] px-3 py-1 text-sm font-semibold text-white shadow-[0_0_12px] shadow-accent/70">
        {afterLabel}
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
        style={{ left: `${position}%` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={round}
        aria-valuetext={`${beforeLabel} ${round}%, ${afterLabel} ${100 - round}%`}
        title={hint}
        onKeyDown={onKeyDown}
        className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-accent shadow-[0_0_14px] shadow-accent"
        style={{ left: `${position}%` }}
      >
        <ChevronLeft aria-hidden="true" size={15} strokeWidth={3} className="-mr-1" />
        <ChevronRight aria-hidden="true" size={15} strokeWidth={3} className="-ml-1" />
      </div>
    </div>
  );
}
