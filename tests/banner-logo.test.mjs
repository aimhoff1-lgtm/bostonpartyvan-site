import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const home = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("style.css", root), "utf8");

test("the web logo is a compact standalone vector without the card image", async () => {
  const logo = await readFile(new URL("assets/images/bpv-web-lockup.svg", root), "utf8");
  assert.match(logo, /<svg [^>]*viewBox="0 0 256 60"/);
  assert.doesNotMatch(logo, /<image\b|<rect\b/);
  assert.ok(Buffer.byteLength(logo) < 3000);
});

test("main headers use the new banner mark and keep the original hero", async () => {
  for (const name of ["index.html", "photos.html", "shop.html", "events/index.html"]) {
    const html = await readFile(new URL(name, root), "utf8");
    assert.match(html, /src="[^"]*assets\/images\/bpv-web-lockup\.svg"/);
    assert.doesNotMatch(html, /src="[^"]*(?:bpv-header-mark\.png|bpv-banner-logo\.webp)"/);
    assert.match(html, /style\.css\?v=[\w.-]+/);
    assert.match(html, /family=Archivo:ital,wght/);
  }
  assert.match(home, /boston-skyline-river-dusk\.webp/);
  assert.match(home, /<h1 id="home-heading"><span>Boston<\/span> <span>Party Van<\/span><\/h1>/);
  assert.doesNotMatch(home, /Boston's newest|hero-stats-card/);
});

test("every guide header and its generator use the same banner artwork", async () => {
  for (const entry of await readdir(new URL("guides/", root), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const html = await readFile(new URL(`guides/${entry.name}/index.html`, root), "utf8");
    assert.match(html, /src="[^"]*assets\/images\/bpv-web-lockup\.svg"/, entry.name);
    assert.doesNotMatch(html, /src="[^"]*(?:bpv-header-mark\.png|PartyvanLogo\.jpeg|bpv-banner-logo\.webp)"/, entry.name);
  }
  const generator = await readFile(new URL("scripts/build-seasonal-pages.cjs", root), "utf8");
  assert.match(generator, /bpv-web-lockup\.svg/);
  assert.match(generator, /style\.css\?v=1\.6\.5-brand/);
});

test("header styles preserve artwork proportions and suppress duplicate lettering", () => {
  assert.match(css, /\.brand-logo\s*\{[^}]*aspect-ratio: 256 \/ 60/);
  assert.match(css, /\.brand-wordmark\s*\{\s*display: none/);
  assert.match(css, /@media \(max-width: 1100px\)/);
});

test("homepage footer pairs the BPV credit with the wide GBV artwork", async () => {
  const footer = home.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer);
  assert.match(footer, /bpv-web-lockup\.svg[^>]*>[\s\S]*?<p class="footer-affiliation">A Greater Boston Ventures Company<\/p>/);
  assert.match(footer, /gbv-footer-lockup\.svg/);
  assert.doesNotMatch(footer, /gbv-logo\.png/);
  const logo = await readFile(new URL("assets/images/gbv-footer-lockup.svg", root), "utf8");
  assert.match(logo, /viewBox="0 0 584 112"/);
  assert.doesNotMatch(logo, /<image\b/);
});
