"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getDinosaursForTimeline } from "@/library/database";
import type { Dinosaur } from "@/library/database";

const CAROUSEL_PX = 24; // horizontal padding
const CAROUSEL_PY = 20; // vertical padding
const GAP = 24; // gap between cells

const PERIOD_COLOR: Record<Dinosaur["period"], string> = {
  Triassic: "var(--triassic)",
  Jurassic: "var(--jurassic)",
  Cretaceous: "var(--cretaceous)",
};

function TimelineStrip({ sorted }: { sorted: Dinosaur[] }) {
  return (
    <div
      className="flex flex-col flex-1 w-full"
      style={{ width: "max-content" }}
    >
      <div
        className="flex flex-1 min-h-0 items-end"
        style={{ gap: GAP }}
      >
        {sorted.map((dino) => {
          const color = PERIOD_COLOR[dino.period];
          return (
            <div
              key={dino.id}
              className="group flex flex-col items-center shrink-0 h-full justify-end"
              style={{ minWidth: "320px", maxWidth: "400px", width: "28vw" }}
            >
              {/* Large Image displays full image, preserving original aspect ratio */}
              <div
                className="w-full grow flex items-center justify-center rounded-2xl overflow-hidden bg-white/10 shadow-2xl p-2 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-[1.03] group-hover:ring-white/30"
              >
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
              <span className="text-2xl font-extrabold text-white/95 whitespace-nowrap text-center pt-4">
                {dino.id}
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-center pt-1 pb-2 px-2 rounded-full"
                style={{ color, backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                {dino.period}
                {typeof dino.first_appearance_ma === "number"
                  ? ` · ${Math.round(dino.first_appearance_ma)} Ma`
                  : ""}
              </span>
              {/* The vertical marker sits directly atop the timeline bar */}
              <div className="w-full flex justify-center pb-0">
                <div
                  className="w-2.5 h-5 rounded-full shrink-0 ring-2 ring-white/40"
                  aria-hidden
                  style={{ backgroundColor: color, boxShadow: "0 2px 12px 1px rgba(0,0,0,0.25)" }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="h-1.5 w-full rounded-full -mt-1 shrink-0"
        style={{
          background:
            "linear-gradient(90deg, var(--triassic), var(--jurassic), var(--cretaceous))",
          boxShadow: "0 1px 8px rgba(0,0,0,0.3)",
        }}
        aria-hidden
      />
    </div>
  );
}

export default function Timeline() {
  const sorted = useMemo(() => getDinosaursForTimeline(), []);

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full items-center justify-center relative">
      {/* Edge fades hint that the strip scrolls horizontally */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10"
        style={{ background: "linear-gradient(90deg, var(--background), transparent)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
        style={{ background: "linear-gradient(270deg, var(--background), transparent)" }}
        aria-hidden
      />
      <div
        className="flex flex-col flex-1 w-full h-full min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
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