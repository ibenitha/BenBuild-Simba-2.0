'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export interface PromoCard {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  image: string;
  cta?: string;
  href: string;
  bgColor?: string;
}

interface PromoRailProps {
  heading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  cards: PromoCard[];
}

export default function PromoRail({ heading, viewAllHref, viewAllLabel = 'See all', cards }: PromoRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener('scroll', updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect(); };
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('article')?.offsetWidth ?? 260;
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + 12) : cardWidth + 12, behavior: 'smooth' });
  };

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Header row */}
        {(heading || viewAllHref) && (
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {heading && (
              <h2 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {heading}
              </h2>
            )}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-simba-orange hover:text-simba-orange-dark transition-colors bg-orange-50/70 dark:bg-orange-950/20 px-2.5 sm:px-0 py-1.5 sm:py-0 rounded-lg sm:rounded-none"
              >
                {viewAllLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        {/* Scroll container + arrow buttons */}
        <div className="relative group/rail">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
              w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700
              flex items-center justify-center text-slate-700 dark:text-slate-200
              hover:bg-simba-orange hover:text-white hover:border-simba-orange
              transition-all duration-200
              ${canScrollLeft ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Cards track */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {cards.map((card) => (
              <article
                key={card.id}
                className="snap-start flex-shrink-0 w-[78vw] sm:w-[44%] md:w-[30%] lg:w-[22%] xl:w-[18%] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <Link href={card.href} className="block">
                  {/* Image */}
                  <div className={`relative h-[8.5rem] sm:h-40 ${card.bgColor ?? 'bg-slate-100 dark:bg-slate-700'}`}>
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 44vw, 22vw"
                      className="object-cover"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Badge */}
                    {card.badge && (
                      <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${card.badgeColor ?? 'bg-simba-orange text-white'}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-3 sm:p-3.5">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-[15px] leading-snug line-clamp-2">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {card.subtitle}
                      </p>
                    )}
                    {card.cta && (
                      <span className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-simba-orange group-hover:gap-2 transition-all">
                        {card.cta} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
              w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700
              flex items-center justify-center text-slate-700 dark:text-slate-200
              hover:bg-simba-orange hover:text-white hover:border-simba-orange
              transition-all duration-200
              ${canScrollRight ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
