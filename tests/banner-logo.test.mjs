import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const home = await readFile(new URL("index.html", root), "utf8");
const css = await readFile(new URL("style.css", root), "utf8");

test("the supplied banner artwork exists as a compact WebP asset", async () => {
  const file = new URL("assets/images/bpv-banner-logo.webp", root);
  const data = await readFile(file);
  assert.equal(data.toString("ascii", 0, 4), "RIFF");
  assert.equal(data.toString("ascii", 8, 12), "WEBP");
  assert.ok((await stat(file)).size < 250000);
});

test("main headers use the new banner mark and keep the original hero", async () => {
  for (const name of ["index.html", "photos.html", "shop.html", "events/index.html"]) {
    const html = await readFile(new URL(name, root), "utf8");
    assert.match(html, /assets\/images\/bpv-banner-logo\.webp/);
    assert.doesNotMatch(html, /bpv-header-mark\.png/);
    assert.match(html, /style\.css\?v=1\.6\.4-logo/);
  }
  assert.match(home, /boston-skyline-river-dusk\.webp/);
  assert.match(home, /<h1>Private Boston group transportation for up to 14\.<\/h1>/);
});

test("every guide header and its generator use the same banner artwork", async () => {
  for (const entry of await readdir(new URL("guides/", root), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const html = await readFile(new URL(`guides/${entry.name}/index.html`, root), "utf8");
    assert.match(html, /assets\/images\/bpv-banner-logo\.webp/, entry.name);
    assert.doesNotMatch(html, /bpv-header-mark\.png|PartyvanLogo\.jpeg/, entry.name);
  }
  const generator = await readFile(new URL("scripts/build-seasonal-pages.cjs", root), "utf8");
  assert.match(generator, /bpv-banner-logo\.webp/);
  assert.match(generator, /style\.css\?v=1\.6\.4-logo/);
});

test("header styles preserve artwork proportions and suppress duplicate lettering", () => {
  assert.match(css, /\.brand-logo\s*\{[^}]*aspect-ratio: 1633 \/ 963/);
  assert.match(css, /\.brand-wordmark\s*\{\s*display: none/);
  assert.match(css, /@media \(max-width: 1100px\)/);
});
