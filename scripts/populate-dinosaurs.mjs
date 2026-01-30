#!/usr/bin/env node
/**
 * Populates library/dinosaurs.json and public/dinosaurs/ from dinosaurpictures.org.
 * Run: node scripts/populate-dinosaurs.mjs
 */

import { mkdir } from "fs";
import { writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_DINOS = join(ROOT, "public", "dinosaurs");
const LIBRARY = join(ROOT, "library");

const PERIOD_PAGES = [
  { url: "https://dinosaurpictures.org/triassic-dinosaurs", period: "Triassic" },
  { url: "https://dinosaurpictures.org/jurassic-dinosaurs", period: "Jurassic" },
  { url: "https://dinosaurpictures.org/cretaceous-dinosaurs", period: "Cretaceous" },
];
const MAIN_PAGE = "https://dinosaurpictures.org/";

const BASE = "https://dinosaurpictures.org";

function slugFromHref(href) {
  const m = href.match(/\/([^/]+)-pictures\/?$/);
  return m ? decodeURIComponent(m[1]) : null;
}

function safeFilename(slug) {
  return slug.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase() + ".jpg";
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "SeekhDinoBot/1.0 (educational project)" },
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

function extractCardEntries(html, period) {
  const entries = [];
  // Match <a href="...Name-pictures"> ... <img ... src="https://dinosaurs.imgix.net/..."
  const cardRe =
    /<a[^>]+href="(?:https:\/\/dinosaurpictures\.org)?\/([^"]+)-pictures"[^>]*>[\s\S]*?<img[^>]+src="(https:\/\/dinosaurs\.imgix\.net\/[^"]+)"/gi;
  let m;
  while ((m = cardRe.exec(html)) !== null) {
    const slug = decodeURIComponent(m[1]);
    const imgUrl = m[2].split("?")[0];
    entries.push({ slug, imgUrl, period });
  }
  return entries;
}

function extractAllSlugs(html) {
  const slugs = new Set();
  const linkRe = /href="(?:https:\/\/dinosaurpictures\.org)?\/([^"]+)-pictures"/g;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const slug = decodeURIComponent(m[1]);
    if (slug && !slug.includes("/")) slugs.add(slug);
  }
  return slugs;
}

async function getPeriodAndImageFromPage(slug) {
  const url = `${BASE}/${slug}-pictures`;
  const html = await fetchHtml(url);
  let period = null;
  const periodRe = /(?:lived in the|period and).*?\*\*(Triassic|Jurassic|Cretaceous)\*\*/i;
  const pm = html.match(periodRe);
  if (pm) period = pm[1];
  // First imgix image (card image)
  const imgRe = /src="(https:\/\/dinosaurs\.imgix\.net\/[^"]+)"/;
  const im = html.match(imgRe);
  let imgUrl = im ? im[1].split("?")[0] : null;
  if (!imgUrl) {
    const altRe = /(https:\/\/images\.dinosaurpictures\.org\/[^"'\s]+\.(?:jpg|jpeg|png|webp))/i;
    const am = html.match(altRe);
    if (am) imgUrl = am[1];
  }
  return { period, imgUrl };
}

async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: { "User-Agent": "SeekhDinoBot/1.0 (educational project)" },
  });
  if (!res.ok) return false;
  const buf = await res.arrayBuffer();
  await writeFile(filepath, Buffer.from(buf));
  return true;
}

async function main() {
  await new Promise((r, e) => mkdir(PUBLIC_DINOS, { recursive: true }, (err) => (err ? e(err) : r())));
  const bySlug = new Map(); // slug -> { period, imagePath }

  console.log("Fetching main and period pages...");
  const mainHtml = await fetchHtml(MAIN_PAGE);
  for (const slug of extractAllSlugs(mainHtml)) {
    if (!bySlug.has(slug)) bySlug.set(slug, { period: null, imgUrl: null });
  }
  for (const { url, period } of PERIOD_PAGES) {
    const html = await fetchHtml(url);
    const cards = extractCardEntries(html, period);
    const slugs = extractAllSlugs(html);
    for (const e of cards) {
      if (!bySlug.has(e.slug)) bySlug.set(e.slug, { period: e.period, imgUrl: e.imgUrl });
      else bySlug.get(e.slug).imgUrl ??= e.imgUrl;
    }
    for (const slug of slugs) {
      if (!bySlug.has(slug)) bySlug.set(slug, { period, imgUrl: null });
      else if (!bySlug.get(slug).period) bySlug.get(slug).period = period;
    }
  }

  const missing = [...bySlug.entries()].filter(([, v]) => !v.imgUrl);
  console.log(`Found ${bySlug.size} dinosaurs. Fetching ${missing.length} individual pages for image/period...`);
  for (let i = 0; i < missing.length; i++) {
    const [slug, rec] = missing[i];
    try {
      const { period, imgUrl } = await getPeriodAndImageFromPage(slug);
      if (period) rec.period = period;
      if (imgUrl) rec.imgUrl = imgUrl;
    } catch (err) {
      console.warn(`  ${slug}: ${err.message}`);
    }
    if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${missing.length}`);
  }

  const dinosaurs = [];
  const seenImages = new Set();
  let idx = 0;
  for (const [slug, rec] of bySlug.entries()) {
    const period = rec.period || "Cretaceous"; // default if not found on page
    let imagePath = null;
    if (rec.imgUrl) {
      const fname = safeFilename(slug);
      const filepath = join(PUBLIC_DINOS, fname);
      const key = rec.imgUrl;
      if (!seenImages.has(key)) {
        try {
          const ok = await downloadImage(rec.imgUrl, filepath);
          if (ok) seenImages.add(key);
        } catch (e) {
          console.warn(`  download ${slug}: ${e.message}`);
        }
      }
      imagePath = `/dinosaurs/${fname}`;
    }
    if (imagePath) {
      dinosaurs.push({ id: slug, period, image: imagePath });
      idx++;
      if (idx % 100 === 0) console.log(`  Downloaded ${idx} images...`);
    }
  }

  const jsonPath = join(LIBRARY, "dinosaurs.json");
  await writeFile(jsonPath, JSON.stringify(dinosaurs, null, 2), "utf8");
  console.log(`Wrote ${dinosaurs.length} dinosaurs to ${jsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
