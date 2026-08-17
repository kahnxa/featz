"use client";

import { useEffect, useRef, useState } from "react";

export function PhotoCarousel({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const stride = el.clientWidth + 8; // slide width + gap-2
      setActive(
        Math.max(
          0,
          Math.min(photos.length - 1, Math.round(el.scrollLeft / stride)),
        ),
      );
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [photos.length]);

  function goTo(index: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * (el.clientWidth + 8), behavior: "smooth" });
  }

  return (
    <>
      <div
        ref={trackRef}
        className="flex h-full snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((src, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={index === 0 ? name : ""}
            fetchPriority={index === 0 ? "high" : "auto"}
            className="h-full w-full flex-none snap-start rounded-lg object-cover object-center sm:w-auto sm:max-w-[min(80vw,640px)]"
          />
        ))}
      </div>
      {photos.length > 1 ? (
        <div className="absolute inset-x-0 bottom-1 z-10 flex justify-center sm:hidden">
          {photos.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={`Go to photo ${index + 1}`}
              onClick={() => goTo(index)}
              className="grid h-8 w-6 place-items-center"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === active ? "bg-white" : "bg-white/45"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
