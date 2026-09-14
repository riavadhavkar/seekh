"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { getDinosaursForTimeline } from "@/library/database";
import type { Dinosaur } from "@/library/database";

const CAROUSEL_PX = 24; // horizontal padding
const CAROUSEL_PY = 12; // vertical padding
const GAP = 40; // gap between cells

const PERIOD_STYLE: Record<
  Dinosaur["period"],
  { color: string; soft: string; emoji: string }
> = {
  Triassic: { color: "var(--triassic)", soft: "var(--triassic-soft)", emoji: "🌋" },
  Jurassic: { color: "var(--jurassic)", soft: "var(--jurassic-soft)", emoji: "🌿" },
  Cretaceous: { color: "var(--cretaceous)", soft: "var(--cretaceous-soft)", emoji: "🌸" },
};

function speakName(name: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(name);
  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function DinoCard({
  dino,
  onOpen,
}: {
  dino: Dinosaur;
  onOpen: (dino: Dinosaur) => void;
}) {
  const { color, soft } = PERIOD_STYLE[dino.period];
  return (
    <motion.button
      type="button"
      data-dino-card
      onClick={() => onOpen(dino)}
      whileHover={{ y: -6, rotate: -1 }}
      whileTap={{ scale: 0.95, rotate: 1 }}
      className="group flex flex-col items-center shrink-0 h-full justify-end text-left cursor-pointer"
      style={{ minWidth: "340px", maxWidth: "520px", width: "34vw" }}
    >
      <div
        className="w-full grow flex items-center justify-center rounded-[28px] overflow-hidden shadow-xl p-3 border-4 transition-shadow duration-300 group-hover:shadow-2xl"
        style={{ backgroundColor: soft, borderColor: color }}
      >
        <Image
          src={dino.image}
          alt={dino.id}
          fill={false}
          width={480}
          height={600}
          sizes="(min-width: 1280px) 36vw, 85vw"
          className="object-contain object-center w-full max-h-full h-auto rounded-2xl"
          priority
        />
      </div>
      <span className="font-heading text-3xl font-bold text-foreground whitespace-nowrap text-center pt-5">
        {dino.id}
      </span>
      <span
        className="text-sm font-bold uppercase tracking-wide whitespace-nowrap text-center pt-2 pb-3 px-4 rounded-full"
        style={{ color: "#1f2a3d", backgroundColor: soft }}
      >
        {PERIOD_STYLE[dino.period].emoji} {dino.period}
        {typeof dino.first_appearance_ma === "number"
          ? ` · ${Math.round(dino.first_appearance_ma)} Ma`
          : ""}
      </span>
      <div className="w-full flex justify-center pb-0">
        <div
          className="w-4 h-8 rounded-full shrink-0 ring-4 ring-white"
          aria-hidden
          style={{ backgroundColor: color, boxShadow: "0 2px 12px 1px rgba(0,0,0,0.2)" }}
        />
      </div>
    </motion.button>
  );
}

function TimelineStrip({
  sorted,
  onOpen,
}: {
  sorted: Dinosaur[];
  onOpen: (dino: Dinosaur) => void;
}) {
  return (
    <div className="flex flex-col flex-1 w-full" style={{ width: "max-content" }}>
      <div className="flex flex-1 min-h-0 items-end" style={{ gap: GAP }}>
        {sorted.map((dino) => (
          <DinoCard key={dino.id} dino={dino} onOpen={onOpen} />
        ))}
      </div>
      <div
        className="h-3 w-full rounded-full -mt-1 shrink-0"
        style={{
          background:
            "linear-gradient(90deg, var(--triassic), var(--jurassic), var(--cretaceous))",
          boxShadow: "0 1px 8px rgba(0,0,0,0.15)",
        }}
        aria-hidden
      />
    </div>
  );
}

function EraLegend({ onJump }: { onJump: (period: Dinosaur["period"]) => void }) {
  const periods: Dinosaur["period"][] = ["Triassic", "Jurassic", "Cretaceous"];
  return (
    <div className="flex gap-3 px-2 pb-3 shrink-0 flex-wrap">
      {periods.map((period) => {
        const { color, soft, emoji } = PERIOD_STYLE[period];
        return (
          <button
            key={period}
            type="button"
            onClick={() => onJump(period)}
            className="font-heading flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-sm border-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: soft, borderColor: color, color: "#1f2a3d" }}
          >
            <span className="text-lg">{emoji}</span>
            {period}
          </button>
        );
      })}
    </div>
  );
}

function DinoModal({ dino, onClose }: { dino: Dinosaur; onClose: () => void }) {
  const { color, soft, emoji } = PERIOD_STYLE[dino.period];
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex flex-col items-center max-w-sm w-full rounded-4xl p-6 shadow-2xl border-4"
        style={{ backgroundColor: "var(--background)", borderColor: color }}
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-xl font-bold shadow cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
        <div
          className="w-48 h-48 rounded-3xl overflow-hidden flex items-center justify-center p-2 border-4"
          style={{ backgroundColor: soft, borderColor: color }}
        >
          <Image
            src={dino.image}
            alt={dino.id}
            width={200}
            height={200}
            className="object-contain w-full h-full rounded-2xl"
          />
        </div>
        <h2 className="font-heading text-4xl font-extrabold mt-5 text-center text-foreground">
          {dino.id}
        </h2>
        <span
          className="text-sm font-bold uppercase tracking-wide mt-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: soft, color: "#1f2a3d" }}
        >
          {emoji} {dino.period}
        </span>
        {typeof dino.first_appearance_ma === "number" && (
          <p className="text-sm text-foreground/70 mt-3 text-center">
            roamed the Earth about{" "}
            <strong>{Math.round(dino.first_appearance_ma)} million years ago</strong>!
          </p>
        )}
        <motion.button
          type="button"
          onClick={() => speakName(dino.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          className="font-heading mt-5 flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white shadow-lg cursor-pointer"
          style={{ backgroundColor: color }}
        >
          🔊 hear the name
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function Timeline() {
  const sorted = useMemo(() => getDinosaursForTimeline(), []);
  const [active, setActive] = useState<Dinosaur | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const jumpToPeriod = (period: Dinosaur["period"]) => {
    const el = scrollRef.current;
    if (!el) return;
    const index = sorted.findIndex((d) => d.period === period);
    if (index === -1) return;
    const card = el.querySelectorAll<HTMLElement>("[data-dino-card]")[index];
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full relative">
      <EraLegend onJump={jumpToPeriod} />
      <div className="flex flex-1 flex-col min-h-0 w-full items-center justify-center relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
          style={{ background: "linear-gradient(90deg, var(--background), transparent)" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
          style={{ background: "linear-gradient(270deg, var(--background), transparent)" }}
          aria-hidden
        />
        <div
          ref={scrollRef}
          className="flex flex-col flex-1 w-full h-full min-h-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{
            paddingLeft: CAROUSEL_PX,
            paddingRight: CAROUSEL_PX,
            paddingTop: CAROUSEL_PY,
            paddingBottom: CAROUSEL_PY,
          }}
        >
          <TimelineStrip sorted={sorted} onOpen={setActive} />
        </div>
      </div>
      <AnimatePresence>
        {active && <DinoModal dino={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}
