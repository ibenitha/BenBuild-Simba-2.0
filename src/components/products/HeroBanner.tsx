'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export interface HeroSlide {
  id: string;
  badge?: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  /** focal point for object-position, e.g. "center", "top", "right center" */
  focus?: string;
  gradient?: string;
  badgeClass?: string;
}

interface HeroBannerProps {
  slides: HeroSlide[];
  interval?: number;
}

const TRANSITION_MS = 450;

export default function HeroBanner({ slides, interval = 5000 }: HeroBannerProps) {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (next: number, dir: 'left' | 'right' = 'right') => {
      if (animating || next === active) return;
      setDirection(dir);
      setPrev(active);
      setActive(next);
      setAnimating(true);
      setProgress(0);
      setTimeout(() => {
        setPrev(null);
        setAnimating(false);
      }, TRANSITION_MS);
    },
    [active, animating],
  );

  const goPrev = useCallback(
    () => goTo((active - 1 + slides.length) % slides.length, 'left'),
    [active, goTo, slides.length],
  );

  const goNext = useCallback(
    () => goTo((active + 1) % slides.length, 'right'),
    [active, goTo, slides.length],
  );

  // Progress bar + auto-advance
  useEffect(() => {
    if (paused || slides.length < 2) {
      if (progressRef.current) clearInterval(progressRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setProgress(0);
    const step = 100 / (interval / 50);
    progressRef.current = setInterval(() => {
      setProgress(p => Math.min(p + step, 100));
    }, 50);

    timerRef.current = setInterval(() => {
      goNext();
    }, interval);

    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, paused, interval, goNext, slides.length]);

  const slideStyle = (index: number): React.CSSProperties => {
    const isActive = index === active;
    const isPrev = index === prev;

    if (!isPrev && !isActive) return { opacity: 0, pointerEvents: 'none', position: 'absolute', inset: 0 };

    if (isActive) {
      return {
        position: animating ? 'absolute' : 'relative',
        inset: animating ? 0 : undefined,
        opacity: 1,
        transform: animating
          ? `translateX(0)`
          : 'translateX(0)',
        animation: animating
          ? `slideIn${direction === 'right' ? 'Right' : 'Left'} ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1) forwards`
          : 'none',
        zIndex: 2,
      };
    }

    // prev slide — exits
    return {
      position: 'absolute',
      inset: 0,
      opacity: 1,
      animation: `slideOut${direction === 'right' ? 'Left' : 'Right'} ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1) forwards`,
      zIndex: 1,
    };
  };

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes slideInRight  { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideInLeft   { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideOutLeft  { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes slideOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }
      `}</style>

      <section
        className="w-full px-3 sm:px-5 lg:px-8 pt-3 pb-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className="relative rounded-2xl overflow-hidden shadow-lg"
          style={{ height: 'clamp(220px, 42vw, 480px)' }}
        >
          {/* Slides */}
          {slides.map((slide, i) => (
            <div key={slide.id} style={slideStyle(i)} className="w-full h-full">
              {/* Full-bleed photo — no color overlay */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                {...(i === 0 ? { fetchPriority: 'high' } : {})}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 1280px"
                className="object-cover"
                style={{ objectPosition: slide.focus ?? 'center' }}
              />

              {/* Subtle text-legibility gradient — bottom-left only, not a color wash */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Text content */}
              <div className="absolute inset-0 flex flex-col justify-end sm:justify-center px-6 sm:px-10 pb-10 sm:pb-0 z-10">
                <div className="max-w-xs sm:max-w-sm lg:max-w-lg">
                  {slide.badge && (
                    <span className={`inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3 ${slide.badgeClass ?? 'bg-white/20 backdrop-blur-sm text-white border border-white/30'}`}>
                      {slide.badge}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow">
                    {slide.title}
                  </h2>
                  <p className="text-white/85 text-xs sm:text-sm lg:text-base mt-1.5 sm:mt-2 mb-4 sm:mb-5 leading-relaxed drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 bg-simba-orange hover:bg-simba-orange-dark text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl active:scale-95 transition-all shadow-lg"
                  >
                    {slide.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm text-white flex items-center justify-center transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm text-white flex items-center justify-center transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dot + progress indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, i > active ? 'right' : 'left')}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative flex items-center justify-center"
                >
                  {i === active ? (
                    /* Active — animated progress pill */
                    <span className="relative block w-8 h-2 rounded-full bg-white/30 overflow-hidden">
                      <span
                        className="absolute left-0 top-0 h-full bg-white rounded-full transition-none"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                  ) : (
                    <span className="block w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
