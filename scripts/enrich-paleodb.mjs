#!/usr/bin/env node
/**
 * Enriches library/dinosaurs.json with first_appearance_ma from PaleoDB
 * (https://paleobiodb.org) for chronological ordering.
 * Run: node scripts/enrich-paleodb.mjs
 */

import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LIBRARY = join(ROOT, "library");
const JSON_PATH = join(LIBRARY, "dinosaurs.json");

const PALEODB = "https://paleobiodb.org/data1.2/taxa/single.json";

async function fetchPaleoDB(name) {
  const url = `${PALEODB}?name=${encodeURIComponent(name)}&show=attr,app`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const rec = data?.records?.[0];
  if (!rec || rec.fea == null) return null;
  return { fea: rec.fea, lea: rec.lea };
}

function periodOrder(p) {
  const o = { Triassic: 0, Jurassic: 1, Cretaceous: 2 };
  return o[p] ?? 3;
}

async function main() {
  const raw = await readFile(JSON_PATH, "utf8");
  const list = JSON.parse(raw);
  console.log(`Enriching ${list.length} dinosaurs with PaleoDB first appearance (Ma)...`);
  for (let i = 0; i < list.length; i++) {
    const d = list[i];
    try {
      const app = await fetchPaleoDB(d.id);
      if (app) {
        d.first_appearance_ma = app.fea;
        d.last_appearance_ma = app.lea;
      }
    } catch (e) {
      console.warn(`  ${d.id}: ${e.message}`);
    }
    if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${list.length}`);
    await new Promise((r) => setTimeout(r, 150));
  }
  list.sort((a, b) => {
    const p = periodOrder(a.period) - periodOrder(b.period);
    if (p !== 0) return p;
    const faA = a.first_appearance_ma ?? -1;
    const faB = b.first_appearance_ma ?? -1;
    return faB - faA;
  });
  await writeFile(JSON_PATH, JSON.stringify(list, null, 2), "utf8");
  const withMa = list.filter((d) => d.first_appearance_ma != null).length;
  console.log(`Done. ${withMa}/${list.length} have first_appearance_ma. Sorted by period then oldest first.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
