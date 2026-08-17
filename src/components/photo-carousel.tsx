"use client";

import { useEffect, useRef, useState } from "react";

const EASE = "cubic-bezier(.4,0,.2,1)";

export function PhotoCarousel({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [primary, setPrimary] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const count = photos.length;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const slides = Array.from(el.children);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(slides.indexOf(entry.target));
          }
        }
      },
      { root: el, threshold: 0.6 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [count]);

  function goTo(index: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * (el.clientWidth + 8), behavior: "smooth" });
  }

  const index = desktop ? primary : active;

  function step(delta: number) {
    const next = Math.max(0, Math.min(count - 1, index + delta));
    if (desktop) setPrimary(next);
    else goTo(next);
  }

  const secondary =
    count < 2 ? -1 : primary + 1 <= count - 1 ? primary + 1 : primary - 1;

  function cardStyle(cardIndex: number): React.CSSProperties {
    const grow = cardIndex === primary ? 2 : cardIndex === secondary ? 3 : 0;
    return {
      flexGrow: grow,
      flexBasis: grow ? "0%" : "90px",
      width: grow ? undefined : 90,
      transition: `flex-grow .52s ${EASE}, flex-basis .52s ${EASE}, width .52s ${EASE}`,
    };
  }

  return (
    <>
      {/* Mobile: swipeable snap carousel */}
      <div
        ref={trackRef}
        className="flex h-full snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((src, photoIndex) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={photoIndex === 0 ? name : ""}
            fetchPriority={photoIndex === 0 ? "high" : "auto"}
            className="h-full w-full flex-none snap-start rounded-lg object-cover object-center"
          />
        ))}
      </div>

      {/* Desktop: Faves-style deck — two large cards, the rest collapsed */}
      <div className="hidden h-full gap-2 sm:flex">
        {photos.map((src, photoIndex) => (
          <button
            key={src}
            type="button"
            aria-label={
              photoIndex === primary ? "Next photo" : `Show photo ${photoIndex + 1}`
            }
            disabled={count < 2}
            onClick={() =>
              photoIndex === primary
                ? setPrimary((primary + 1) % count)
                : setPrimary(photoIndex)
            }
            className="relative h-full min-w-0 overflow-hidden rounded-lg disabled:cursor-default"
            style={cardStyle(photoIndex)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={photoIndex === 0 ? name : ""}
              fetchPriority={photoIndex === 0 ? "high" : "auto"}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={index === 0}
            onClick={() => step(-1)}
            className="absolute left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-opacity hover:opacity-80 disabled:opacity-40 sm:grid"
          >
            <svg viewBox="0 0 9 14" className="h-3.5 w-auto -scale-x-100" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m1.5 1.5 5.5 5.5-5.5 5.5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next"
            disabled={index === count - 1}
            onClick={() => step(1)}
            className="absolute right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-opacity hover:opacity-80 disabled:opacity-40 sm:grid"
          >
            <svg viewBox="0 0 9 14" className="h-3.5 w-auto" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m1.5 1.5 5.5 5.5-5.5 5.5" />
            </svg>
          </button>
        </>
      ) : null}

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-1 z-10 flex justify-center sm:hidden">
          {photos.map((src, photoIndex) => (
            <button
              key={src}
              type="button"
              aria-label={`Go to photo ${photoIndex + 1}`}
              onClick={() => goTo(photoIndex)}
              className="grid h-8 w-6 place-items-center"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  photoIndex === active ? "bg-white" : "bg-white/45"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
