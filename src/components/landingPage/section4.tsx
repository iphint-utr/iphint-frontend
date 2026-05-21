"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

const SLIDES = [
  { key: "artist",    file: "/sec4_main.svg" },
  { key: "model",     file: "/sec4_model.svg" },
  { key: "creator",   file: "/sec4_creator.svg" },
  { key: "ecommerce", file: "/sec4_ecommerce.svg" },
];

// [clone-of-last, ...real slides, clone-of-first] for seamless infinite loop
const EXTENDED = [SLIDES[SLIDES.length - 1], ...SLIDES, SLIDES[0]];
const REAL_COUNT = SLIDES.length;
const SLIDE_STEP = 100 / EXTENDED.length;
const AUTO_SLIDE_INTERVAL = 4000;

export default function Section4() {
  const t = useTranslations("Landing.section4");

  // currentIdx 1 = first real slide, REAL_COUNT = last real
  const [currentIdx, setCurrentIdx] = useState(1);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);

  // 0-based real index for tabs / dots / progress bar
  const activeIndex =
    currentIdx === 0
      ? REAL_COUNT - 1
      : currentIdx >= EXTENDED.length - 1
      ? 0
      : currentIdx - 1;

  const goNext = useCallback(() => {
    setAnimated(true);
    setCurrentIdx((p) => p + 1);
  }, []);

  const goPrev = useCallback(() => {
    setAnimated(true);
    setCurrentIdx((p) => p - 1);
  }, []);

  const goToReal = useCallback((realIdx: number) => {
    setAnimated(true);
    setCurrentIdx(realIdx + 1);
    setPaused(true);
  }, []);

  // When strip lands on a clone, jump instantly to the real counterpart
  const handleTransitionEnd = useCallback(() => {
    if (currentIdx === 0) {
      setAnimated(false);
      setCurrentIdx(REAL_COUNT);
    } else if (currentIdx === EXTENDED.length - 1) {
      setAnimated(false);
      setCurrentIdx(1);
    }
  }, [currentIdx]);

  // Re-enable animation one frame after the instant jump
  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  // Auto-slide; resumes 8s after last manual interaction
  useEffect(() => {
    if (paused) {
      const timer = setTimeout(() => setPaused(false), AUTO_SLIDE_INTERVAL * 2);
      return () => clearTimeout(timer);
    }
    const id = setInterval(goNext, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [paused, goNext]);

  // Unified pointer tracking for touch + mouse drag
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);

  const onDragStart = (x: number, y: number) => {
    pointerStartX.current = x;
    pointerStartY.current = y;
    setPaused(true);
  };

  const onDragEnd = (x: number, y: number) => {
    if (pointerStartX.current === null) return;
    const dx = x - pointerStartX.current;
    const dy = Math.abs(y - (pointerStartY.current ?? y));
    pointerStartX.current = null;
    pointerStartY.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < dy) return;
    if (dx < 0) goNext(); else goPrev();
  };

  const stripStyle = {
    width: `${EXTENDED.length * 100}%`,
    transform: `translateX(-${currentIdx * SLIDE_STEP}%)`,
  };
  const stripClass = animated
    ? "flex transition-transform duration-500 ease-in-out"
    : "flex";

  return (
    <section className="min-h-[500px] w-full bg-[#fafafa] py-20 font-sans text-slate-900">
      <div className="w-full px-6 lg:px-16 xl:px-24 flex flex-col gap-12">

        {/* Header */}
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-700 max-w-3xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Swipeable content grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-0 items-stretch cursor-grab active:cursor-grabbing select-none touch-pan-y"
          onTouchStart={(e) => onDragStart(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
          onMouseUp={(e) => onDragEnd(e.clientX, e.clientY)}
          onMouseLeave={() => { pointerStartX.current = null; }}
        >
          {/* Image strip */}
          <div className="relative min-h-72 lg:min-h-0 rounded-2xl lg:rounded-none overflow-hidden lg:mr-10">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px] opacity-80" />
            <div className="relative z-10 h-full overflow-hidden">
              <div className={`h-full ${stripClass}`} style={stripStyle} onTransitionEnd={handleTransitionEnd}>
                {EXTENDED.map((item, i) => (
                  <div
                    key={`img-${i}`}
                    className="flex items-center justify-center p-8 flex-shrink-0"
                    style={{ width: `${SLIDE_STEP}%` }}
                  >
                    <div className="relative w-full lg:w-[55%] aspect-square">
                      <Image
                        src={item.file}
                        alt={t(`items.${item.key}.title`)}
                        fill
                        className="object-contain"
                        priority={i === 1}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Text column */}
          <div className="flex flex-col justify-center gap-5">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
              {SLIDES.map((item, idx) => (
                <button
                  key={item.key}
                  onClick={() => goToReal(idx)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors duration-200 ${
                    idx === activeIndex
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {t(`items.${item.key}.title`)}
                </button>
              ))}
            </div>

            {/* Text strip */}
            <div className="overflow-hidden">
              <div className={stripClass} style={stripStyle}>
                {EXTENDED.map((item, i) => (
                  <div
                    key={`txt-${i}`}
                    className="flex flex-col gap-3 pr-4 flex-shrink-0"
                    style={{ width: `${SLIDE_STEP}%` }}
                  >
                    <h3 className="text-2xl font-semibold leading-snug">
                      {t(`items.${item.key}.heading`)}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {t(`items.${item.key}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 h-[3px] w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((activeIndex + 1) / REAL_COUNT) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToReal(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-slate-900"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
