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
      className="flex flex-col shrink-0 h-full"
      style={{ width: "max-content" }}
    >
      <div
        className="flex flex-1 min-h-0 items-end"
        style={{ gap: GAP }}
      >
        {sorted.map((dino) => (
          <div
            key={dino.id}
            className="flex flex-col items-center shrink-0 h-full"
          >
            {/* Image fills most of cell; aspect-square keeps it square */}
            <div className="relative flex-1 min-h-0 w-full min-w-0 rounded-xl overflow-hidden bg-white/10 shadow-lg aspect-square">
              <Image
                src={dino.image}
                alt={dino.id}
                fill
                sizes="(min-height: 100vh) 80vh, 80vw"
                className="object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white/95 whitespace-nowrap text-center pt-2 pb-1">
              {dino.id}
            </span>
            <div className="w-full flex justify-center pb-0">
              <div
                className="w-1.5 h-3 rounded-full bg-white/90 shrink-0"
                aria-hidden
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