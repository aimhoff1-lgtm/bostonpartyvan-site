import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("index.html", root), "utf8");
const photos = await readFile(new URL("photos.html", root), "utf8");
const script = await readFile(new URL("script.js", root), "utf8");

test("homepage advertises immediate availability and the actual seating capacity", () => {
  assert.match(html, /Available now/);
  assert.match(html, /14 passenger seats plus a separate driver seat/);
  assert.match(html, /December 25, 2026 through January 4, 2027/);
  assert.doesNotMatch(html, /2500|MBenzSprinter14PAX|van-interior-rear\.jpg/);
});

test("every holiday call to action has a matching inquiry preset", () => {
  for (const key of ["holiday", "holiday-party", "christmas-party", "ski", "winter"]) {
    assert.match(html, new RegExp(`data-quote-trip="${key}"`));
    assert.match(script, new RegExp(`(?:"${key}"|${key}): \\{ packageName:`));
  }
  assert.match(photos, /index\.html\?trip=holiday#quote/);
});

test("six new van images exist and retouched gallery photos are labeled", async () => {
  const sources = [...photos.matchAll(/<img src="(assets\/images\/van-2026\/[^"]+)"/g)].map((m) => m[1]);
  assert.equal(sources.length, 6);
  for (const source of sources) assert.ok((await stat(new URL(source, root))).size > 1000);
  assert.equal((photos.match(/Photo retouched for lighting/g) || []).length, 2);
  assert.doesNotMatch(photos, /Coming soon|coming soon/);
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
    assert.match(page, /\?trip=[a-z-]+#quote/);
  }
});
