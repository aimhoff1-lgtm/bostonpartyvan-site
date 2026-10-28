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
const now = new Date("2026-10-28T16:00:00Z");

test("warns for today through D+29 but not D+30 or later", () => {
  for (const date of ["2026-10-28", "2026-10-29", "2026-11-04", "2026-11-26"]) {
    assert.equal(getAvailability(date, now).limitedAvailability, true, date);
  }
  for (const date of ["2026-11-27", "2026-11-28", "2027-01-05"]) {
    assert.equal(getAvailability(date, now).limitedAvailability, false, date);
  }
});

test("empty and past dates do not show a short-notice warning", () => {
  for (const date of ["", undefined, "2026-10-27"]) {
    assert.equal(getAvailability(date, now).limitedAvailability, false);
  }
  assert.equal(getAvailability("", now).minimumDate, "2026-10-28");
});

test("uses Boston's date when UTC is already on the next day", () => {
  const lateEvening = new Date("2026-10-29T03:30:00Z");
  assert.equal(getAvailability("2026-10-28", lateEvening).minimumDate, "2026-10-28");
  assert.equal(getAvailability("2026-11-26", lateEvening).limitedAvailability, true);
  assert.equal(getAvailability("2026-11-27", lateEvening).limitedAvailability, false);
});

test("calendar-day cutoff survives daylight saving, month and year boundaries", () => {
  for (const [instant, lastLimitedDate, firstRegularDate] of [
    ["2026-03-07T17:00:00Z", "2026-04-05", "2026-04-06"],
    ["2026-10-31T16:00:00Z", "2026-11-29", "2026-11-30"],
    ["2026-12-28T17:00:00Z", "2027-01-26", "2027-01-27"],
    ["2028-02-25T17:00:00Z", "2028-03-25", "2028-03-26"],
  ]) {
    const clock = new Date(instant);
    assert.equal(getAvailability(lastLimitedDate, clock).limitedAvailability, true);
    assert.equal(getAvailability(firstRegularDate, clock).limitedAvailability, false);
  }
});

test("holiday closure includes both endpoints and does not recur next year", () => {
  for (const date of ["2026-12-25", "2026-12-31", "2027-01-01", "2027-01-04"]) {
    assert.equal(getAvailability(date, now).unavailable, true, date);
  }
  for (const date of ["", "2026-12-24", "2027-01-05", "2027-12-25", "2028-01-04"]) {
    assert.equal(getAvailability(date, now).unavailable, false, date);
  }
  const december = new Date("2026-12-20T17:00:00Z");
  assert.equal(getAvailability("2026-12-25", december).limitedAvailability, false);
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

test("date warning has live status and invites affiliate inquiries without a call prompt", () => {
  assert.match(html, /name="pickupDate" aria-describedby="quoteAvailabilityNotice quoteUnavailableNotice" required/);
  assert.match(html, /role="status" aria-live="polite" aria-atomic="true"/);
  const notice = html.match(/<p id="quoteAvailabilityNotice"[\s\S]*?<\/p>/)?.[0];
  assert.ok(notice);
  assert.match(notice, /hidden/);
  assert.match(notice, /Limited availability/);
  assert.match(notice, /less than 30 days away/);
  assert.match(notice, /Please submit\s+your inquiry/);
  assert.match(notice, /If we are unable to accommodate your trip, we'll do our best to/);
  assert.match(notice, /do our best to\s+assist you through one of our affiliates/);
  assert.doesNotMatch(notice, /tel:|please call|515-3702/i);
});
