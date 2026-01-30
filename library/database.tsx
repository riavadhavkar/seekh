/**
 * Dinosaur database sourced from https://dinosaurpictures.org/
 * Chronological ordering from Paleobiology Database (https://paleobiodb.org).
 * To refresh: node scripts/populate-dinosaurs.mjs && node scripts/enrich-paleodb.mjs
 */

import dinosaursData from "./dinosaurs.json";

export type DinosaurPeriod = "Triassic" | "Jurassic" | "Cretaceous";

export interface Dinosaur {
  id: string;
  period: DinosaurPeriod;
  image: string;
  /** First appearance in million years ago (PaleoDB). Higher = older. */
  first_appearance_ma?: number;
  last_appearance_ma?: number;
}

const PERIOD_ORDER: Record<DinosaurPeriod, number> = {
  Triassic: 0,
  Jurassic: 1,
  Cretaceous: 2,
};

/** Dinosaurs sorted for timeline: earliest period left, latest right; within period, oldest first (by first_appearance_ma). */
export function getDinosaursForTimeline(): Dinosaur[] {
  const list = [...(dinosaursData as Dinosaur[])];
  return list.sort((a, b) => {
    const p = PERIOD_ORDER[a.period] - PERIOD_ORDER[b.period];
    if (p !== 0) return p;
    const faA = a.first_appearance_ma ?? -1;
    const faB = b.first_appearance_ma ?? -1;
    return faB - faA;
  });
}

export const dinosaurs: Dinosaur[] = dinosaursData as Dinosaur[];
