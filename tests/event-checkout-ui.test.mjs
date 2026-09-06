import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, script] = await Promise.all([
  readFile(new URL("../events/index.html", import.meta.url), "utf8"),
  readFile(new URL("../events/events.js", import.meta.url), "utf8"),
]);

test("event checkout markup has unique element IDs", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size);
});

test("every checkout script element lookup exists in the page", () => {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
  const lookups = [...script.matchAll(/getElementById\("([^"]+)"\)/g)].map(
    (match) => match[1]
  );
  const missing = [...new Set(lookups.filter((id) => !ids.has(id)))];
  assert.deepEqual(missing, []);
});

test("preview checkout stops before the booking API request", () => {
  const previewGuard = script.indexOf("if (!selectedEvent.checkoutEnabled)");
  const bookingRequest = script.indexOf(
    "`/api/events/${encodeURIComponent(selectedEvent.id)}/checkout`"
  );
  assert.ok(previewGuard > -1);
  assert.ok(bookingRequest > previewGuard);
  assert.match(script.slice(previewGuard, bookingRequest), /return;/);
});

test("checkout contains review, contact, payment, and result states", () => {
  for (const requiredId of [
    "checkoutFormView",
    "checkoutSeatChips",
    "checkoutForm",
    "checkoutSubmit",
    "checkoutPreviewView",
    "checkoutResultView",
  ]) {
    assert.match(html, new RegExp(`id="${requiredId}"`));
  }
  assert.doesNotMatch(script, /checkoutSelectionCopy/);
});
