"use client";



import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Bell } from "@/components/ui/platform-icons";

const SURFACE = "bg-transparent";
const GLYPH = "text-stone-700 hover:text-brand-600";

const COLORS = {
  red: "bg-[#FF3B30] dark:bg-[#FF453A]",
  orange: "bg-[#FF9500] dark:bg-[#FF9F0A]",
  green: "bg-[#22643e]",
  blue: "bg-[#007AFF] dark:bg-[#0A84FF]",
  violet: "bg-[#AF52DE] dark:bg-[#BF5AF2]",
} as const;

const ICON = 0.56;
const BADGE = 0.38;
const DOT = 0.22;
const FONT = 0.21;
const PAD = 0.09;
const ORBIT = 0.9;

const SWING_SPRING = {
  type: "spring",
  stiffness: 220,
  damping: 10,
  mass: 1,
  restDelta: 0.01,
} as const;
const COLUMN_SPRING = { stiffness: 400, damping: 30, mass: 0.9 };
const ENTER_SPRING = { type: "spring", stiffness: 600, damping: 20 } as const;
const FADE = { duration: 0.15 } as const;

const IMPULSE = 500;
const MAX_VELOCITY = 900;
const BURST = 5;

const WINDOW = 3;
const LAG = 2;

const ROLL_FADE = 34;
const ROLL_VELOCITY = 9;

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

const digitOf = (value: number) => ((value % 10) + 10) % 10;

function badgeMetrics(size: number, dot: boolean) {
  const side = size * (dot ? DOT : BADGE);
  return {
    side,
    inset: size / 2 - (ORBIT * size * Math.SQRT1_2) / 2 - side / 2,
  };
}

function useBellRing(total: number, reduced: boolean) {
  const swing = useMotionValue(0);
  const previous = useRef(total);
  const ringing = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const delta = total - previous.current;
    previous.current = total;
    if (delta <= 0 || reduced) return;

    const weight = 0.7 + (0.6 * Math.min(delta, BURST)) / BURST;
    const moving = swing.getVelocity();
    const along = moving > 1 ? 1 : -1;

    ringing.current = animate(swing, 0, {
      ...SWING_SPRING,
      velocity: clamp(moving + along * IMPULSE * weight, MAX_VELOCITY),
    });
  }, [total, reduced, swing]);

  useEffect(() => () => ringing.current?.stop(), []);

  return swing;
}

function BellIcon({ side, swing }: { side: number; swing: MotionValue<number> }) {
  return (
    <motion.span className="inline-flex" style={{ rotate: swing, transformOrigin: "50% 12%" }}>
      <Bell aria-hidden="true" size={side} strokeWidth={1.75} />
    </motion.span>
  );
}

function DigitColumn({ value, reduced }: { value: number; reduced: boolean }) {
  const position = useSpring(value, COLUMN_SPRING);
  const y = useTransform(position, (p) => `${-p * 100}%`);
  const velocity = useVelocity(position);
  const mask = useTransform(velocity, (v) => {
    const fade = Math.min(ROLL_FADE, (Math.abs(v) / ROLL_VELOCITY) * ROLL_FADE);
    return `linear-gradient(to bottom, transparent 0%, #000 ${fade}%, #000 ${100 - fade}%, transparent 100%)`;
  });

  useEffect(() => {
    const gap = value - position.get();
    if (Math.abs(gap) > LAG) position.jump(value - Math.sign(gap) * LAG);
    if (reduced) position.jump(value);
    else position.set(value);
  }, [value, reduced, position]);

  return (
    <motion.span
      className="relative inline-block h-[1em] overflow-hidden"
      style={{
        width: "1ch",
        maskImage: reduced ? undefined : mask,
        WebkitMaskImage: reduced ? undefined : mask,
      }}
    >
      <motion.span className="absolute inset-0" style={{ y }}>
        {Array.from({ length: WINDOW * 2 + 1 }, (_, i) => {
          const tile = value - WINDOW + i;
          return (
            <span
              key={tile}
              className="absolute inset-x-0 flex justify-center"
              style={{ top: `${tile * 100}%` }}
            >
              {digitOf(tile)}
            </span>
          );
        })}
      </motion.span>
    </motion.span>
  );
}

function CountBadge({
  total,
  max,
  size,
  color,
  dot,
  reduced,
}: {
  total: number;
  max: number;
  size: number;
  color: keyof typeof COLORS;
  dot: boolean;
  reduced: boolean;
}) {
  const { side, inset } = badgeMetrics(size, dot);
  const clamped = total > max;
  const places = clamped ? 0 : String(total).length;

  return (
    <AnimatePresence initial={false}>
      {total > 0 && (
        <motion.span
          key="badge"
          layout={!reduced}
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-10 grid place-items-center rounded-full",
            COLORS[color],
          )}
          style={{
            top: inset,
            right: inset,
            height: side,
            minWidth: side,
            paddingInline: dot ? 0 : size * PAD,
            fontSize: size * FONT,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={reduced ? FADE : ENTER_SPRING}
        >
          {!dot && (
            <span
              className="flex font-semibold leading-none tracking-tight text-white"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {clamped
                ? `${max}+`
                : Array.from({ length: places }, (_, i) => {
                    const place = places - 1 - i;
                    return (
                      <DigitColumn
                        key={place}
                        value={Math.floor(total / 10 ** place)}
                        reduced={reduced}
                      />
                    );
                  })}
            </span>
          )}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export type NotificationBellProps = Omit<
  ComponentProps<"button">,
  | "children"
  | "color"
  | "onAnimationStart"
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
> & {
  count?: number;
  max?: number;
  variant?: "count" | "dot";
  size?: number;
  color?: keyof typeof COLORS;
};

export function NotificationBell({
  count = 0,
  max = 99,
  variant = "count",
  size = 48,
  color = "red",
  className,
  style,
  ...props
}: NotificationBellProps) {
  const reduced = useReducedMotion() ?? false;
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const swing = useBellRing(total, reduced);

  const badge = (
    <CountBadge
      total={total}
      max={max}
      size={size}
      color={color}
      dot={variant === "dot"}
      reduced={reduced}
    />
  );

  const label = (
    <span role="status" className="sr-only">
      {total > 0 ? `Notifications, ${total} unread` : "Notifications"}
    </span>
  );


  return (
    <button
      type="button"
      data-slot="notification-bell"
      className={cn(
        "relative grid place-items-center rounded-full outline-none transition-[color,transform] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#22643e] motion-reduce:active:scale-100",
        SURFACE,
        GLYPH,
        className,
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {label}
      <BellIcon side={size * ICON} swing={swing} />
      {badge}
    </button>
  );
}

export default NotificationBell;
