"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { HeroSlideVM } from "@/payload/globals/home-types";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  slides: HeroSlideVM[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: slides.length > 1 });
  const [selected, setSelected] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay: cada slide avanza según su propio campo `duracion` del CMS,
  // no un intervalo fijo. Se pausa con hover/foco y respeta
  // prefers-reduced-motion (el usuario sigue pudiendo navegar a mano).
  useEffect(() => {
    if (!emblaApi || slides.length < 2 || isPaused) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const duracion = slides[selected]?.duracion ?? 5000;
    timerRef.current = setTimeout(() => emblaApi.scrollNext(), duracion);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [emblaApi, selected, slides, isPaused]);

  if (slides.length === 0) return null;

  const activeSlide = slides[selected];

  return (
    <section
      className="relative flex min-h-[80vh] items-end overflow-hidden bg-[#0A2540] text-white sm:min-h-[88vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="relative h-full min-w-0 flex-[0_0_100%]"
            >
              {slide.imagenUrl ? (
                <div
                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out motion-reduce:transition-none ${
                    i === selected ? "scale-110" : "scale-100"
                  }`}
                  style={{ backgroundImage: `url(${slide.imagenUrl})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#0B3B66] via-[#0A2540] to-[#061626]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061626]/95 via-[#061626]/45 to-[#061626]/10" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full px-6 pb-16 pt-28 sm:px-10 sm:pt-40 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div
            key={activeSlide.id}
            className="max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-500 motion-reduce:animate-none"
          >
            <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-sm text-white/90 backdrop-blur">
              {activeSlide.etiqueta}
            </span>
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              {activeSlide.titulo}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              {activeSlide.texto}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={activeSlide.ctaPrincipal.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#C9972E] text-[#1C1305] hover:bg-[#DDAC42]",
                )}
              >
                {activeSlide.ctaPrincipal.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {activeSlide.ctaSecundario && (
                <Link
                  href={activeSlide.ctaSecundario.href}
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: "lg",
                    }),
                    "border-white/30 bg-white/5 text-white backdrop-blur hover:bg-white/15",
                  )}
                >
                  {activeSlide.ctaSecundario.label}
                </Link>
              )}
            </div>
          </div>

          {slides.length > 1 && (
            <div className="mt-14 flex items-center gap-6">
              <div className="flex flex-1 gap-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={`Ir a "${slide.titulo}"`}
                    aria-current={i === selected}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9972E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A2540]"
                  >
                    <span
                      className={
                        i === selected
                          ? "block h-full w-full bg-[#C9972E] transition-[width] ease-linear motion-reduce:transition-none"
                          : i < selected
                            ? "block h-full w-full bg-[#C9972E]"
                            : "block h-full w-0 bg-[#C9972E]"
                      }
                      style={
                        i === selected
                          ? { transitionDuration: `${slide.duracion}ms` }
                          : undefined
                      }
                    />
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  aria-label="Slide anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9972E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A2540]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  aria-label="Siguiente slide"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9972E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A2540]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
