/**
 * Dinosaur database sourced from https://dinosaurpictures.org/
 * Data: id, period, and reference to card image in public folder.
 * To refresh: node scripts/populate-dinosaurs.mjs
 */

import dinosaursData from "./dinosaurs.json";

export type DinosaurPeriod = "Triassic" | "Jurassic" | "Cretaceous";

export interface Dinosaur {
  id: string;
  period: DinosaurPeriod;
  image: string;
}

export const dinosaurs: Dinosaur[] = dinosaursData as Dinosaur[];
