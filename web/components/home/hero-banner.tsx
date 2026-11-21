"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cover as coverGradient } from "@/lib/covers";
import { cn } from "@/lib/utils";

/** mobile: 16:9 (1600×900) · desktop: 2.34:1 (1920×820). Either may be missing. */
export type Slide = { id: number; title: string; mobile?: string; desktop?: string };

// Tablets (≥768px) and up get the wide desktop artwork; phones the 16:9 one.
const DESKTOP_MQ = "(min-width: 768px)";

const INTERVAL_MS = 5000;
const SWIPE_PX = 40;

/**
 * Full-bleed hero banner. The box takes the shape of the artwork it shows, so
 * nothing is cropped: 16:9 with the mobile image on phones, 1920:820 with the
 * desktop image from tablets up (capped at 65vh on very large screens, where a
 * small centred crop applies). <picture> means each device downloads one image.
 *
 * Seamless loop: the track is [last, ...slides, first]; after animating onto
 * a clone we jump (no transition) to the real slide. Pauses on hover/focus,
 * when the tab is hidden, and never autoplays under prefers-reduced-motion.
 */
export function HeroBanner({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((delta: number) => {
    setAnimate(true);
    setPos((p) => p + delta);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (n < 2 || paused || reduced) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") go(1);
    }, INTERVAL_MS);
    return () => clearInterval(t);
  }, [n, paused, reduced, go]);

  // Re-enable the transition on the frame after a silent clone→real jump.
  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  const multi = n > 1;
  const active = multi ? (pos - 1 + n) % n : 0;
  const track = multi ? [slides[n - 1], ...slides, slides[0]] : slides;
  const offset = multi ? pos : 0;

  const onTransitionEnd = () => {
    if (multi && (pos === 0 || pos === n + 1)) {
      setAnimate(false);
      setPos(pos === 0 ? n : 1);
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="group relative aspect-video w-full overflow-hidden md:aspect-[1920/820] md:max-h-[65vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (!multi) return;
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        touchX.current = null;
        setPaused(false);
        if (!multi || start == null || end == null) return;
        if (end - start > SWIPE_PX) go(-1);
        else if (start - end > SWIPE_PX) go(1);
      }}
      >
      {n === 0 ? (
        <div className="h-full w-full brand-gradient opacity-30" />
      ) : (
        <div
          className={cn("flex h-full", animate && "transition-transform duration-700 ease-[cubic-bezier(.22,.8,.2,1)]")}
          style={{ transform: `translateX(-${offset * 100}%)` }}
          onTransitionEnd={onTransitionEnd}
        >
          {track.map((s, i) => (
            <div
              key={`${s.id}-${i}`}
              className="relative h-full w-full shrink-0"
              aria-hidden={i !== offset}
              role="group"
              aria-roledescription="slide"
              aria-label={`${multi ? ((i - 1 + n) % n) + 1 : 1} of ${n}`}
            >
              <BannerPicture slide={s} />
            </div>
          ))}
        </div>
      )}


      {multi && (
        <>
          <Arrow side="left" onClick={() => go(-1)} />
          <Arrow side="right" onClick={() => go(1)} />
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-2.5 py-1.5 backdrop-blur-md sm:bottom-6">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === active}
                onClick={() => {
                  setAnimate(true);
                  setPos(i + 1);
                }}
                className={cn(
                  "h-2 rounded-full shadow transition-all duration-300",
                  i === active ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={cn(
        "absolute top-1/2 grid h-9 w-9 -translate-y-1/2 sm:h-11 sm:w-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/55 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40",
        side === "left" ? "left-3 sm:left-6" : "right-3 sm:right-6",
      )}
    >
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
}

// Every slide loads eagerly: off-screen slides in the translated track never
// count as "visible", so lazy-loading would flash the placeholder on each advance.
function BannerPicture({ slide }: { slide: Slide }) {
  const [failed, setFailed] = useState(false);
  const mobile = slide.mobile ?? slide.desktop;
  const desktop = slide.desktop ?? slide.mobile;
  return (
    <div className="absolute inset-0" style={{ backgroundImage: coverGradient(Math.abs(slide.id)) }}>
      {mobile && !failed && (
        <picture>
          {desktop && <source media={DESKTOP_MQ} srcSet={desktop} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mobile}
            alt={slide.title}
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        </picture>
      )}
    </div>
  );
}
