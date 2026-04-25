"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  kr: {
    heading: "신뢰할 수 있는 정확한 탐지",
    testimonials: [
      {
        image:  "/r1.png",
        quote:  "전혀 예상하지 못한 곳에서 발견 된 내 사진은 수익이 증가했고, 처리 시간이단축되어 결과가 폭발적으로 늘었습니다.",
        author: "김지현",
        role:   "설립자",
        rating: 4,
      },
      {
        image:  "/r2.png",
        quote:  "서비스를 도입한 이후로 저작권 침해 사례가 눈에 띄게 줄었습니다. 정말 믿을 수 있는 탐지 솔루션입니다.",
        author: "이민준",
        role:   "크리에이티브 디렉터",
        rating: 5,
      },
      {
        image:  "/r3.png",
        quote:  "정확성이 뛰어나고 처리 속도가 빠릅니다. 우리 팀의 업무 효율이 두 배 이상 향상되었어요.",
        author: "박서연",
        role:   "CTO",
        rating: 5,
      },
    ],
  },
  en: {
    heading: "Accurate Detection You Can Trust",
    testimonials: [
      {
        image:  "/r1.png",
        quote:  "My photos were found in completely unexpected places. Revenue increased and processing time was cut drastically — results grew explosively.",
        author: "Jihyeon Kim",
        role:   "Founder",
        rating: 4,
      },
      {
        image:  "/r2.png",
        quote:  "Since adopting the service, copyright infringement cases have decreased noticeably. It is a truly reliable detection solution.",
        author: "Minjun Lee",
        role:   "Creative Director",
        rating: 5,
      },
      {
        image:  "/r3.png",
        quote:  "Exceptional accuracy and fast processing speed. Our team's work efficiency has more than doubled.",
        author: "Seoyeon Park",
        role:   "CTO",
        rating: 5,
      },
    ],
  },
} as const;

type Locale = keyof typeof translations;

const TOTAL_DOTS        = 17;
const AUTO_PLAY_INTERVAL = 6000;

// ─── Dots component ───────────────────────────────────────────────────────────
function Dots({
  total, filled, position,
}: {
  total:    number;
  filled:   number;
  position: "top" | "bottom";
}) {
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-[6px] h-[6px] rounded-full transition-colors duration-300 ${
            i < filled
              ? position === "top"
                ? "bg-pink-400/70"
                : "bg-purple-400/70"
              : "border border-gray-400/60"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TestimonialSlider() {
  const params = useParams();
  const locale: Locale = (params?.locale as string) === "en" ? "en" : "kr";
  const t = translations[locale];

  const [current,     setCurrent]     = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction,   setDirection]   = useState<"next" | "prev">("next");
  const [displayed,   setDisplayed]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev" = "next") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayed(index);
        setCurrent(index);
        setIsAnimating(false);
      }, 500);
    },
    [isAnimating]
  );

  const next = useCallback(() => {
    const nextIndex = (current + 1) % t.testimonials.length;
    goTo(nextIndex, "next");
  }, [current, goTo, t.testimonials.length]);

  const prev = useCallback(() => {
    const prevIndex = (current - 1 + t.testimonials.length) % t.testimonials.length;
    goTo(prevIndex, "prev");
  }, [current, goTo, t.testimonials.length]);

  useEffect(() => {
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTO_PLAY_INTERVAL);
  }, [next]);

  const handleNext = () => { next(); resetTimer(); };
  const handlePrev = () => { prev(); resetTimer(); };

  const testimonial = t.testimonials[displayed];

  const slideClass = isAnimating
    ? direction === "next"
      ? "opacity-0 translate-x-4"
      : "opacity-0 -translate-x-4"
    : "opacity-100 translate-x-0";

  return (
    <section className="w-full py-16 font-[Pretendard,_'Noto_Sans_KR',_sans-serif]">
      {/* Title */}
      <h2 className="text-center text-2xl md:text-4xl font-black tracking-tight text-gray-900 mb-10">
        {t.heading}
      </h2>

      {/* Card */}
      <div
        className="w-full mx-auto overflow-hidden flow"
        style={{
          background: "linear-gradient(135deg, #ddc0fc 0%, #ffc0e3 30%, #fdf1bf 60%, #f8b6dc 90%, #ddc0fc 100%)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 ">

          {/* Left — Image + Nav */}
          <div className="relative flex flex-col items-center justify-center min-h-[360px] md:min-h-[460px] overflow-hidden">
            <div className={`transition-all duration-500 ease-in-out ${slideClass} w-full h-full md:w-full md:h-full`}>
              <div className="relative w-full h-full bg-white/30 flex items-center justify-center text-white/60 text-sm tracking-widest">
                <Image src={testimonial.image} alt={testimonial.author} fill className="object-cover" />
              </div>
            </div>

            <div className="absolute top-[300] md:top-[400] fc gap-3 mt-2">
              <button
                onClick={handlePrev}
                aria-label="Previous"
                className="w-9 h-9 rounded-full flow bg-[linear-gradient(135deg,#ddc0fc_0%,#ffc0e3_30%,#fdf1bf_60%,#f8b6dc_90%,#ddc0fc_100%)] flex items-center justify-center text-gray-700 hover:scale-105 active:scale-95"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next"
                className="w-9 h-9 rounded-full flow bg-[linear-gradient(135deg,#ddc0fc_0%,#ffc0e3_30%,#fdf1bf_60%,#f8b6dc_90%,#ddc0fc_100%)] flex items-center justify-center text-gray-700 hover:scale-105 active:scale-95"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* Right — Quote */}
          <div className="relative flex-1 flex flex-col justify-center p-8 md:p-10 bg-white/60">
            <Dots total={TOTAL_DOTS} filled={current + 1} position="top" />

            <div className=" text-2xl md:text-4xl font-gray-600 text-gray-700/80 leading-none mb-3 mt-4">
              ❝
            </div>

            <div className={`transition-all duration-500 ease-in-out ${slideClass}`}>
              <p className="text-gray-700 text-base md:text-2xl font-semibold leading-relaxed mb-6">
                {testimonial.quote}
              </p>
            </div>

            <Dots total={TOTAL_DOTS} filled={current + 1} position="bottom" />

            <div className={`mt-3 transition-all duration-500 ease-in-out ${slideClass}`}>
              <p className="text-md text-gray-600 font-semibold">{testimonial.author}</p>
              <p className="text-md text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide indicator dots */}
      <div className="flex justify-center gap-2 mt-6">
        {t.testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i, i > current ? "next" : "prev"); resetTimer(); }}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-2 bg-pink-400"
                : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
