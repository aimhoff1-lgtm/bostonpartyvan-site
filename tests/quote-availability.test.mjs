import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const script = await readFile(new URL("../script.js", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const helper = script.slice(
  script.indexOf("function getQuoteDateAvailability("),
  script.indexOf("if (quoteForm && quoteSuccess)")
);
const getAvailability = vm.runInNewContext(`${helper}\ngetQuoteDateAvailability`);
const now = new Date("2026-11-18T17:00:00Z");

test("same-day and short-notice trips are available without an affiliate warning", () => {
  for (const date of ["2026-11-18", "2026-11-19", "2026-11-25", "2026-12-17", "2026-12-18"]) {
    const availability = getAvailability(date, now);
    assert.equal(availability.unavailable, false, date);
    assert.equal("limitedAvailability" in availability, false);
  }
});

test("empty dates are not blocked and the minimum date remains today", () => {
  for (const date of ["", undefined]) {
    assert.equal(getAvailability(date, now).unavailable, false);
  }
  assert.equal(getAvailability("", now).minimumDate, "2026-11-18");
});

test("uses Boston's date when UTC is already on the next day", () => {
  const lateEvening = new Date("2026-11-19T04:30:00Z");
  assert.equal(getAvailability("2026-11-18", lateEvening).minimumDate, "2026-11-18");
});

test("Boston date remains correct across daylight saving and year boundaries", () => {
  for (const [instant, minimumDate] of [
    ["2026-03-08T06:30:00Z", "2026-03-08"],
    ["2026-11-01T06:30:00Z", "2026-11-01"],
    ["2027-01-01T04:30:00Z", "2026-12-31"],
  ]) {
    assert.equal(getAvailability("", new Date(instant)).minimumDate, minimumDate);
  }
});

test("holiday closure includes both endpoints and does not recur next year", () => {
  for (const date of ["2026-12-25", "2026-12-31", "2027-01-01", "2027-01-04"]) {
    assert.equal(getAvailability(date, now).unavailable, true, date);
  }
  for (const date of ["", "2026-12-24", "2027-01-05", "2027-12-25", "2028-01-04"]) {
    assert.equal(getAvailability(date, now).unavailable, false, date);
  }
});

test("multi-day trips cannot overlap or span the holiday closure", () => {
  for (const [start, end] of [
    ["2026-12-24", "2026-12-25"],
    ["2026-12-24", "2027-01-05"],
    ["2026-12-25", "2027-01-05"],
    ["2027-01-04", "2027-01-06"],
    ["2026-12-25", "2026-12-24"],
  ]) {
    assert.equal(getAvailability(start, now, end).unavailable, true);
  }
  for (const [start, end] of [["2026-12-23", "2026-12-24"], ["2027-01-05", "2027-01-06"]]) {
    assert.equal(getAvailability(start, now, end).unavailable, false);
  }
});

test("only the blackout notice remains associated with the date input", () => {
  assert.match(html, /name="pickupDate" aria-describedby="quoteUnavailableNotice" required/);
  assert.match(html, /role="status" aria-live="polite" aria-atomic="true"/);
  const notice = html.match(/<p id="quoteUnavailableNotice"[\s\S]*?<\/p>/)?.[0];
  assert.ok(notice);
  assert.match(notice, /hidden/);
  assert.match(notice, /December 25, 2026 through January 4, 2027/);
  assert.doesNotMatch(html, /quoteAvailabilityNotice|less than 30 days away|one of our affiliates/);
  assert.doesNotMatch(script, /limitedAvailability|quoteAvailabilityNotice/);
});
