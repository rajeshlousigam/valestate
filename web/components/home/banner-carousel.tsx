"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Cover } from "@/components/ui/cover";
import { cn } from "@/lib/utils";

export type Slide = { id: number; title: string; body: string; image?: string };

const INTERVAL_MS = 5000;
const SWIPE_PX = 40;

/**
 * Auto-advancing, looping banner carousel. Seamless loop: the track is
 * [last, ...slides, first]; after animating onto a clone we jump (no
 * transition) to the real slide. Pauses on hover/focus, when the tab is
 * hidden, and never autoplays under prefers-reduced-motion.
 */
export function BannerCarousel({ slides }: { slides: Slide[] }) {
  const n = slides.length;
  const [pos, setPos] = useState(1); // index into the cloned track
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

  if (n === 0) return null;
  if (n === 1) return <SlideView slide={slides[0]} priority />;

  const onTransitionEnd = () => {
    if (pos === 0 || pos === n + 1) {
      setAnimate(false);
      setPos(pos === 0 ? n : 1);
    }
  };
  const active = (pos - 1 + n) % n;
  const track = [slides[n - 1], ...slides, slides[0]];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="group relative overflow-hidden rounded-4xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
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
        if (start == null || end == null) return;
        if (end - start > SWIPE_PX) go(-1);
        else if (start - end > SWIPE_PX) go(1);
      }}
    >
      <div
        className={cn("flex", animate && "transition-transform duration-700 ease-[cubic-bezier(.22,.8,.2,1)]")}
        style={{ transform: `translateX(-${pos * 100}%)` }}
        onTransitionEnd={onTransitionEnd}
      >
        {track.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            className="w-full shrink-0"
            aria-hidden={i !== pos}
            role="group"
            aria-roledescription="slide"
            aria-label={`${((i - 1 + n) % n) + 1} of ${n}`}
          >
            <SlideView slide={s} priority={i === 1} interactive={i === pos} />
          </div>
        ))}
      </div>

      <Arrow side="left" onClick={() => go(-1)} />
      <Arrow side="right" onClick={() => go(1)} />

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
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
              "h-2 rounded-full transition-all duration-300",
              i === active ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
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
        "absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/55 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40",
        "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
        side === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5",
      )}
    >
      <Icon className="h-6 w-6" />
    </button>
  );
}

function SlideView({ slide, priority = false, interactive = true }: { slide: Slide; priority?: boolean; interactive?: boolean }) {
  return (
    <Cover
      index={slide.id}
      src={slide.image}
      alt={slide.title}
      eager={priority}
      className="aspect-[4/3] w-full sm:aspect-[21/8]"
      rounded="rounded-none"
      overlay={false}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-y-0 left-0 flex max-w-xl flex-col justify-end px-16 pb-12 pt-6 sm:justify-center sm:p-12 sm:px-20">
        <h2 className="text-balance text-2xl font-bold leading-tight text-white sm:text-4xl">{slide.title}</h2>
        {slide.body && <p className="mt-2 line-clamp-2 text-sm text-white/85 sm:text-base">{slide.body}</p>}
        <Link
          href="/search"
          tabIndex={interactive ? 0 : -1}
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          Explore properties <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Cover>
  );
}
