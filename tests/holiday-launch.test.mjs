import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const photos = await readFile(new URL("photos.html", root), "utf8");
const script = await readFile(new URL("script.js", root), "utf8");

test("homepage accepts inquiries without promising availability and states the seating capacity", () => {
  assert.match(html, /Now accepting inquiries/);
  assert.doesNotMatch(html, /Available now/);
  assert.match(html, /confirm availability and transportation arrangements before you book/);
  assert.match(html, /14 passenger seats plus a separate driver seat/);
  assert.match(html, /December 25, 2026 through January 4, 2027/);
  assert.doesNotMatch(html, /2500|MBenzSprinter14PAX|van-interior-rear\.jpg/);
});

test("seasonal promotion preserves the normal brand, cover, and inquiry flow", () => {
  assert.match(html, /<title>Boston Party Van \| Private Group Transportation for Up to 14<\/title>/);
  assert.match(html, /<h1 id="home-heading"><span>Boston<\/span> <span>Party Van<\/span><\/h1>/);
  assert.match(html, /class="seasonal-banner" href="#quote">Holiday parties and ski trips are booking now!/);
  assert.match(html, /<a href="#services">Trip Menu<\/a>/);
  assert.equal((html.match(/class="quick-action-card"/g) || []).length, 3);
  assert.equal((html.match(/class="winter-trip"/g) || []).length, 2);
  assert.ok(html.indexOf('class="section winter-highlight"') < html.indexOf('id="services"'));
  assert.doesNotMatch(html, /hero-van-photo|holiday-hero|seasonal-card|data-quote-trip="(?:holiday|christmas-party|ski|winter)"/);
  assert.doesNotMatch(script, /packageName: "(?:Holiday Transportation|Office Holiday Party|Christmas Party Transportation|Ski and Snowboard Trip|Winter Group Outing)"/);
  assert.match(photos, /href="index\.html#quote">Request a Quote/);
});

test("the gallery retains the first four van photos without visible captions", async () => {
  const sources = [...photos.matchAll(/<img src="(assets\/images\/van-2026\/[^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(sources, [
    "exterior-retouched.webp",
    "interior-retouched.webp",
    "cabin-original.webp",
    "rear-original.webp",
  ].map((name) => `assets/images/van-2026/${name}`));
  for (const source of sources) assert.ok((await stat(new URL(source, root))).size > 1000);
  assert.doesNotMatch(photos, /<figcaption\b/);
  assert.doesNotMatch(photos, /Coming soon|coming soon/);
});

test("winter cards use activity photos and link four dated events to their organizers", () => {
  const section = html.match(/<section id="winter"[\s\S]*?<\/section>/)?.[0];
  assert.ok(section);
  assert.match(section, /assets\/images\/nightlife\.jpg/);
  assert.match(section, /assets\/images\/mountain-apres-ski-party\.jpg/);
  assert.doesNotMatch(section, /van-2026|data-quote-trip|Christmas parties/);
  for (const [url, start, end] of [
    ["https://www.sowaboston.com/sowa-christmas-market/", "2026-11-20", "2026-12-27"],
    ["https://www.lasaletteattleboroshrine.org/christmas-festival", "2026-11-21", "2027-01-03"],
    ["https://thetrustees.org/program/winterlights-massachusetts/", "2026-11-27", "2027-01-02"],
    ["https://christmasprelude.com/schedule/", "2026-12-03", "2026-12-13"]
  ]) {
    assert.ok(section.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`));
    assert.ok(section.includes(`datetime="${start}"`));
    assert.ok(section.includes(`datetime="${end}"`));
  }
  assert.match(section, /Admission is separate/);
  assert.match(section, /BPV is unavailable December 25, 2026 through January 4, 2027/);
});

test("homepage structured data remains valid", () => {
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.ok(JSON.parse(json));
  }
});

test("seasonal pages have canonical URLs, matching FAQ schema, and sitemap entries", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
  for (const slug of ["boston-holiday-party-transportation", "boston-ski-trip-transportation", "boston-winter-group-transportation"]) {
    const page = await readFile(new URL(`guides/${slug}/index.html`, root), "utf8");
    const url = `https://www.bostonpartyvan.com/guides/${slug}/`;
    assert.ok(page.includes(`<link rel="canonical" href="${url}"`));
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
    assert.equal((page.match(/<h1>/g) || []).length, 1);
    const schema = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const faq = schema["@graph"].find((node) => node["@type"] === "FAQPage");
    assert.ok(faq.mainEntity.length >= 5);
    for (const item of faq.mainEntity) {
      const escape = (text) => text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      assert.ok(page.includes(`<summary>${escape(item.name)}</summary>`));
      assert.ok(page.includes(`<p>${escape(item.acceptedAnswer.text)}</p>`));
    }
    assert.match(page, /December 25, 2026 through January 4, 2027/);
    assert.match(page, /href="\.\.\/\.\.\/index\.html#quote">Request a Quote/);
    assert.doesNotMatch(page, /hero-van-photo|holiday-hero|\?trip=/);
  }
});
