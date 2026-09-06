import test from "node:test";
import assert from "node:assert/strict";

import {
  buildBookingReceipt,
  isInternalTestCheckout,
  normalizeCheckoutRequest,
  verifyStripeSignature,
} from "../worker/event-bookings.js";
import {
  EVENT_CATALOG,
  PASSENGER_SEATS,
  eventLifecycle,
  toPublicEvent,
} from "../worker/event-catalog.js";

const previewEvent = EVENT_CATALOG[0];

test("the van exposes exactly 14 unique passenger seats", () => {
  assert.equal(PASSENGER_SEATS.length, 14);
  assert.equal(new Set(PASSENGER_SEATS).size, 14);
  assert.deepEqual(PASSENGER_SEATS.slice(0, 4), ["1A", "2A", "2B", "2C"]);
  assert.deepEqual(PASSENGER_SEATS.slice(-4), ["5A", "5B", "5C", "5D"]);
});

test("event lifecycle archives a completed trip", () => {
  assert.equal(eventLifecycle(previewEvent, new Date("2026-10-17T12:00:00-04:00")), "preview");
  assert.equal(eventLifecycle(previewEvent, new Date("2026-10-18T04:00:00-04:00")), "archived");
});

test("public inventory marks a live event sold out", () => {
  const liveEvent = { ...previewEvent, status: "on_sale", previewUnavailableSeats: [] };
  const publicEvent = toPublicEvent(
    liveEvent,
    { soldSeats: PASSENGER_SEATS, heldSeats: [] },
    true,
    new Date("2026-10-17T12:00:00-04:00")
  );
  assert.equal(publicEvent.status, "sold_out");
  assert.equal(publicEvent.seatsRemaining, 0);
  assert.equal(publicEvent.checkoutEnabled, false);
});

test("summer preview examples appear archived and fully unavailable", () => {
  const summerEvent = EVENT_CATALOG.find((event) => event.id === "preview-fenway-summer-concert");
  const publicEvent = toPublicEvent(
    summerEvent,
    {},
    false,
    new Date("2026-09-04T12:00:00-04:00")
  );
  assert.equal(publicEvent.status, "archived");
  assert.equal(publicEvent.seatsRemaining, 0);
  assert.equal(publicEvent.isExample, true);
});

test("checkout input accepts a valid group and rejects duplicate seats", () => {
  const valid = normalizeCheckoutRequest(
    { name: "Ada Lovelace", email: "ADA@example.com", phone: "617-555-0100", seats: ["2B", "2A"] },
    previewEvent
  );
  assert.deepEqual(valid.seats, ["2A", "2B"]);
  assert.equal(valid.email, "ada@example.com");

  const duplicate = normalizeCheckoutRequest(
    { name: "Ada Lovelace", email: "ada@example.com", seats: ["2A", "2A"] },
    previewEvent
  );
  assert.match(duplicate.error, /invalid/i);
});

test("checkout input enforces the per-reservation seat limit", () => {
  const result = normalizeCheckoutRequest(
    {
      name: "Grace Hopper",
      email: "grace@example.com",
      seats: ["2A", "2B", "2C", "3A", "3B", "3C", "4A"],
    },
    previewEvent
  );
  assert.match(result.error, /no more than 6/i);
});

test("preview checkout requires the private server test token", () => {
  const env = { EVENTS_TEST_TOKEN: "private-preview-token" };
  const validRequest = new Request("https://www.bostonpartyvan.com/api/events/test/checkout", {
    headers: { "X-BPV-Checkout-Test": "private-preview-token" },
  });
  const invalidRequest = new Request("https://www.bostonpartyvan.com/api/events/test/checkout", {
    headers: { "X-BPV-Checkout-Test": "wrong-token" },
  });

  assert.equal(isInternalTestCheckout(validRequest, env, "preview"), true);
  assert.equal(isInternalTestCheckout(invalidRequest, env, "preview"), false);
  assert.equal(isInternalTestCheckout(validRequest, env, "on_sale"), false);
  assert.equal(isInternalTestCheckout(validRequest, {}, "preview"), false);
});

test("Stripe signatures are checked against the raw body and timestamp", async () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ id: "evt_test", type: "checkout.session.completed" });
  const timestamp = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${payload}`)
  );
  const signature = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");

  assert.equal(
    await verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret),
    true
  );
  assert.equal(
    await verifyStripeSignature(`${payload} `, `t=${timestamp},v1=${signature}`, secret),
    false
  );
});

test("receipt content escapes customer-controlled HTML", () => {
  const receipt = buildBookingReceipt(
    {
      id: "12345678-abcd-efgh-ijkl-1234567890ab",
      customer_name: "<script>alert(1)</script>",
      customer_email: "safe@example.com",
      seat_ids: JSON.stringify(["2A"]),
      total_cents: 10000,
    },
    previewEvent
  );
  assert.doesNotMatch(receipt.html, /<script>/);
  assert.match(receipt.html, /&lt;script&gt;/);
  assert.match(receipt.text, /Booking reference: BPV-12345678/);
  assert.match(receipt.text, /October 17, 2026/);
  assert.match(receipt.html, /Payment received/);
});
