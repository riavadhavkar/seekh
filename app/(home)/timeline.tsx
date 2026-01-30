"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getDinosaursForTimeline } from "@/library/database";
import type { Dinosaur } from "@/library/database";

const CAROUSEL_PX = 24; // horizontal padding
const CAROUSEL_PY = 20; // vertical padding
const GAP = 24; // gap between cells

function TimelineStrip({ sorted }: { sorted: Dinosaur[] }) {
  return (
    <div
      className="flex flex-col h-full w-full"
      style={{ width: "max-content" }}
    >
      <div
        className="flex flex-1 min-h-0 items-end"
        style={{ gap: GAP }}
      >
        {sorted.map((dino) => (
          <div
            key={dino.id}
            className="flex flex-col items-center shrink-0 h-full justify-end"
            style={{ minWidth: "320px", maxWidth: "400px", width: "28vw" }}
          >
            {/* Large Image displays full image, preserving original aspect ratio */}
            <div className="w-full grow flex items-center justify-center rounded-2xl overflow-hidden bg-white/10 shadow-2xl p-2">
              <Image
                src={dino.image}
                alt={dino.id}
                fill={false}
                width={320}
                height={400}
                sizes="(min-width: 1280px) 30vw, 80vw"
                className="object-contain object-center w-full max-h-full h-auto rounded-xl"
                priority
              />
            </div>
            <span className="text-2xl font-extrabold text-white/95 whitespace-nowrap text-center pt-4 pb-2">
              {dino.id}
            </span>
            {/* The vertical marker sits directly atop the timeline bar */}
            <div className="w-full flex justify-center pb-0">
              <div
                className="w-2 h-5 rounded-full bg-white/95 shrink-0"
                aria-hidden
                style={{ boxShadow: "0 2px 12px 1px rgba(0,0,0,0.14)" }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="h-1 w-full rounded-full bg-white/80 -mt-1 shrink-0" aria-hidden />
    </div>
  );
}

export default function Timeline() {
  const sorted = useMemo(() => getDinosaursForTimeline(), []);

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full items-center justify-center">
      <div
        className="flex-1 w-full h-full min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{
          paddingLeft: CAROUSEL_PX,
          paddingRight: CAROUSEL_PX,
          paddingTop: CAROUSEL_PY,
          paddingBottom: CAROUSEL_PY,
        }}
      >
        <TimelineStrip sorted={sorted} />
      </div>
    </div>
  );
}