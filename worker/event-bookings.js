import {
  EVENT_CATALOG,
  PASSENGER_SEATS,
  eventLifecycle,
  findEvent,
  toPublicEvent,
} from "./event-catalog.js";

const CHECKOUT_MINUTES = 31;
const HOLD_GRACE_MINUTES = 30;
const DEFAULT_FROM = "Boston Party Van <bookings@bostonpartyvan.com>";
const DEFAULT_REPLY_TO = "bostonpartyvan@gmail.com";
const PRODUCTION_ORIGINS = new Set([
  "https://www.bostonpartyvan.com",
  "https://bostonpartyvan.com",
]);

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatEventDate(startsAt) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
      timeZoneName: "short",
    }).format(new Date(startsAt));
  } catch {
    return String(startsAt || "To be confirmed");
  }
}

function bookingReference(bookingId) {
  const compactId = String(bookingId || "reservation").replace(/[^a-z0-9]/gi, "");
  return `BPV-${compactId.slice(0, 8).toUpperCase()}`;
}

function requestOriginAllowed(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  if (PRODUCTION_ORIGINS.has(origin)) return true;

  try {
    const hostname = new URL(origin).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function checkoutConfigured(env) {
  return Boolean(
    env.EVENTS_DB &&
      env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      env.PUBLIC_SITE_URL
  );
}

export function isInternalTestCheckout(request, env, lifecycle) {
  if (lifecycle !== "preview" || !env.EVENTS_TEST_TOKEN) return false;

  const suppliedToken = request.headers.get("X-BPV-Checkout-Test") || "";
  const configuredToken = String(env.EVENTS_TEST_TOKEN);
  return constantTimeEqual(suppliedToken, configuredToken);
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function clearExpiredHolds(db, nowIso) {
  await db.batch([
    db
      .prepare(
        `DELETE FROM event_seat_reservations
         WHERE status = 'held' AND hold_expires_at <= ?`
      )
      .bind(nowIso),
    db
      .prepare(
        `UPDATE event_bookings
         SET status = 'expired', updated_at = ?
         WHERE status = 'held' AND hold_expires_at <= ?`
      )
      .bind(nowIso, nowIso),
  ]);
}

async function loadInventory(db, nowIso) {
  if (!db) return new Map();

  await clearExpiredHolds(db, nowIso);
  const result = await db
    .prepare(
      `SELECT event_id, seat_id, status
       FROM event_seat_reservations
       WHERE status = 'sold' OR hold_expires_at > ?`
    )
    .bind(nowIso)
    .all();
  const inventory = new Map();

  for (const row of result.results || []) {
    if (!inventory.has(row.event_id)) {
      inventory.set(row.event_id, { heldSeats: [], soldSeats: [] });
    }
    const eventInventory = inventory.get(row.event_id);
    if (row.status === "sold") eventInventory.soldSeats.push(row.seat_id);
    if (row.status === "held") eventInventory.heldSeats.push(row.seat_id);
  }

  return inventory;
}

async function listEvents(env) {
  const now = new Date();
  let inventory = new Map();

  if (env.EVENTS_DB) {
    try {
      inventory = await loadInventory(env.EVENTS_DB, now.toISOString());
    } catch (error) {
      console.error("Event inventory could not be loaded", error);
    }
  }

  const configured = checkoutConfigured(env);
  return EVENT_CATALOG.map((event) =>
    toPublicEvent(event, inventory.get(event.id), configured, now)
  ).sort((left, right) => {
    const dateDifference = new Date(left.startsAt) - new Date(right.startsAt);
    return dateDifference || left.name.localeCompare(right.name);
  });
}

export function normalizeCheckoutRequest(payload, event) {
  const name = String(payload?.name || "").trim().replace(/\s+/g, " ");
  const email = String(payload?.email || "").trim().toLowerCase();
  const phone = String(payload?.phone || "").trim();
  const requestedSeats = Array.isArray(payload?.seats) ? payload.seats : [];
  const seats = [...new Set(requestedSeats.map((seat) => String(seat).toUpperCase()))].sort(
    (left, right) => PASSENGER_SEATS.indexOf(left) - PASSENGER_SEATS.indexOf(right)
  );

  if (name.length < 2 || name.length > 100) {
    return { error: "Enter the name for this reservation." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { error: "Enter a valid email address." };
  }
  if (phone.length > 30) {
    return { error: "Enter a valid phone number." };
  }
  if (!seats.length) {
    return { error: "Choose at least one seat." };
  }
  if (seats.length !== requestedSeats.length || seats.some((seat) => !PASSENGER_SEATS.includes(seat))) {
    return { error: "One or more selected seats are invalid. Refresh and choose again." };
  }
  if (seats.length > event.maxSeatsPerBooking) {
    return { error: `Choose no more than ${event.maxSeatsPerBooking} seats in one reservation.` };
  }

  return { name, email, phone, seats };
}

async function reserveSeats(db, booking) {
  const statements = [
    db
      .prepare(
        `INSERT INTO event_bookings (
           id, lookup_token, event_id, customer_name, customer_email, customer_phone,
           seat_ids, seat_count, unit_price_cents, total_cents, currency, status,
           hold_expires_at, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usd', 'held', ?, ?, ?)`
      )
      .bind(
        booking.id,
        booking.lookupToken,
        booking.eventId,
        booking.name,
        booking.email,
        booking.phone || null,
        JSON.stringify(booking.seats),
        booking.seats.length,
        booking.unitPriceCents,
        booking.totalCents,
        booking.holdExpiresAt,
        booking.createdAt,
        booking.createdAt
      ),
  ];

  for (const seatId of booking.seats) {
    statements.push(
      db
        .prepare(
          `INSERT INTO event_seat_reservations (
             event_id, seat_id, booking_id, status, hold_expires_at, created_at
           ) VALUES (?, ?, ?, 'held', ?, ?)`
        )
        .bind(
          booking.eventId,
          seatId,
          booking.id,
          booking.holdExpiresAt,
          booking.createdAt
        )
    );
  }

  await db.batch(statements);
}

async function cancelSeatHold(db, bookingId, nowIso) {
  await db.batch([
    db
      .prepare("DELETE FROM event_seat_reservations WHERE booking_id = ? AND status = 'held'")
      .bind(bookingId),
    db
      .prepare(
        `UPDATE event_bookings
         SET status = 'cancelled', updated_at = ?
         WHERE id = ? AND status = 'held'`
      )
      .bind(nowIso, bookingId),
  ]);
}

async function createStripeCheckout(env, event, booking, stripeExpiresAt) {
  const siteUrl = env.PUBLIC_SITE_URL.replace(/\/$/, "");
  const productImageUrl = new URL("/assets/images/bpv-checkout-mark.png", siteUrl).toString();
  const successUrl = new URL("/events/", siteUrl);
  successUrl.searchParams.set("checkout", "success");
  successUrl.searchParams.set("booking", booking.id);
  successUrl.searchParams.set("token", booking.lookupToken);

  const cancelUrl = new URL("/events/", siteUrl);
  cancelUrl.searchParams.set("checkout", "cancelled");
  cancelUrl.searchParams.set("event", event.id);
  cancelUrl.searchParams.set("booking", booking.id);
  cancelUrl.searchParams.set("token", booking.lookupToken);

  const params = new URLSearchParams({
    mode: "payment",
    submit_type: "book",
    "payment_method_types[0]": "card",
    customer_email: booking.email,
    client_reference_id: booking.id,
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    expires_at: String(stripeExpiresAt),
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(event.priceCents),
    "line_items[0][price_data][product_data][name]": event.name,
    "line_items[0][price_data][product_data][description]": `Seats ${booking.seats.join(", ")} | ${event.pickup} | ${event.departure}`,
    "line_items[0][quantity]": String(booking.seats.length),
    "payment_intent_data[receipt_email]": booking.email,
    "payment_intent_data[description]": `${event.name} | Seats ${booking.seats.join(", ")}`,
    "payment_intent_data[metadata][booking_id]": booking.id,
    "payment_intent_data[metadata][event_id]": event.id,
    "metadata[booking_id]": booking.id,
    "metadata[event_id]": event.id,
    "metadata[seat_ids]": booking.seats.join(","),
    "custom_text[submit][message]":
      "Your selected seats are confirmed after payment succeeds. Event admission is not included.",
  });
  if (productImageUrl.startsWith("https://")) {
    params.set("line_items[0][price_data][product_data][images][0]", productImageUrl);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": booking.id,
    },
    body: params,
  });

  const result = await response.json();
  if (!response.ok || !result?.id || !result?.url) {
    console.error("Stripe checkout creation failed", response.status, result?.error?.message);
    throw new Error("Stripe checkout could not be created.");
  }

  return result;
}

async function handleBookingCancellation(request, env, bookingId) {
  if (!requestOriginAllowed(request) || !env.EVENTS_DB || !env.STRIPE_SECRET_KEY) {
    return jsonResponse({ success: false, message: "Booking not found." }, 404);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, message: "Invalid cancellation request." }, 400);
  }
  const token = String(payload?.token || "");
  if (!token) return jsonResponse({ success: false, message: "Booking not found." }, 404);

  const booking = await env.EVENTS_DB
    .prepare(
      `SELECT id, stripe_session_id, status
       FROM event_bookings
       WHERE id = ? AND lookup_token = ?`
    )
    .bind(bookingId, token)
    .first();
  if (!booking) return jsonResponse({ success: false, message: "Booking not found." }, 404);
  if (booking.status !== "held") return jsonResponse({ success: true });
  if (!booking.stripe_session_id) {
    await cancelSeatHold(env.EVENTS_DB, bookingId, new Date().toISOString());
    return jsonResponse({ success: true });
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(
      booking.stripe_session_id
    )}/expire`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "",
    }
  );
  if (!response.ok) {
    console.warn("Stripe checkout could not be expired", response.status);
    return jsonResponse(
      {
        success: false,
        message: "That checkout is still active. The seats will release automatically if unpaid.",
      },
      409
    );
  }

  await cancelSeatHold(env.EVENTS_DB, bookingId, new Date().toISOString());
  return jsonResponse({ success: true });
}

async function handleCheckout(request, env, eventId) {
  if (!requestOriginAllowed(request)) {
    return jsonResponse({ success: false, message: "Invalid request origin." }, 403);
  }

  const event = findEvent(eventId);
  if (!event) return jsonResponse({ success: false, message: "Event not found." }, 404);

  const lifecycle = eventLifecycle(event);
  const internalTestCheckout = isInternalTestCheckout(request, env, lifecycle);
  if (lifecycle !== "on_sale" && !internalTestCheckout) {
    const message = lifecycle === "preview"
      ? "This is an interactive preview; ticket sales are not open."
      : "Seat sales for this event are closed.";
    return jsonResponse({ success: false, message }, 409);
  }

  if (!checkoutConfigured(env)) {
    return jsonResponse(
      { success: false, message: "Secure checkout is not configured yet." },
      503
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, message: "Invalid checkout request." }, 400);
  }

  const normalized = normalizeCheckoutRequest(payload, event);
  if (normalized.error) {
    return jsonResponse({ success: false, message: normalized.error }, 400);
  }

  const now = new Date();
  const stripeExpiresAt = Math.floor(now.getTime() / 1000) + CHECKOUT_MINUTES * 60;
  const holdExpiresAt = new Date(
    (stripeExpiresAt + HOLD_GRACE_MINUTES * 60) * 1000
  ).toISOString();
  const booking = {
    id: crypto.randomUUID(),
    lookupToken: randomToken(),
    eventId: event.id,
    name: normalized.name,
    email: normalized.email,
    phone: normalized.phone,
    seats: normalized.seats,
    unitPriceCents: event.priceCents,
    totalCents: event.priceCents * normalized.seats.length,
    createdAt: now.toISOString(),
    holdExpiresAt,
  };

  await clearExpiredHolds(env.EVENTS_DB, booking.createdAt);
  try {
    await reserveSeats(env.EVENTS_DB, booking);
  } catch (error) {
    console.warn("Seat reservation conflict", event.id, normalized.seats, error);
    return jsonResponse(
      {
        success: false,
        code: "seat_conflict",
        message: "One of those seats was just selected by someone else. Refresh and choose again.",
      },
      409
    );
  }

  try {
    const checkout = await createStripeCheckout(env, event, booking, stripeExpiresAt);
    await env.EVENTS_DB
      .prepare(
        `UPDATE event_bookings
         SET stripe_session_id = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(checkout.id, new Date().toISOString(), booking.id)
      .run();

    return jsonResponse({
      success: true,
      checkoutUrl: checkout.url,
      holdExpiresAt,
    });
  } catch (error) {
    await cancelSeatHold(env.EVENTS_DB, booking.id, new Date().toISOString());
    return jsonResponse(
      {
        success: false,
        message: "Checkout could not be opened. Your seats were released; please try again.",
      },
      502
    );
  }
}

function parseStripeSignature(signatureHeader) {
  const parts = String(signatureHeader || "").split(",");
  const timestamp = parts.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));
  return { timestamp, signatures };
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function verifyStripeSignature(payload, signatureHeader, secret) {
  const { timestamp, signatures } = parseStripeSignature(signatureHeader);
  const timestampNumber = Number(timestamp);
  if (!timestamp || !signatures.length || !Number.isFinite(timestampNumber)) return false;
  if (Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;

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
  const expected = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

export function buildBookingReceipt(booking, event) {
  const seats = JSON.parse(booking.seat_ids).join(", ");
  const total = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(booking.total_cents / 100);
  const firstName = booking.customer_name.trim().split(/\s+/)[0] || "there";
  const eventDate = formatEventDate(event.startsAt);
  const reference = bookingReference(booking.id);
  const subject = `Your seats are booked for ${event.name}`;
  const text = [
    `Hi ${firstName},`,
    "",
    `Payment received: ${total}`,
    `Booking reference: ${reference}`,
    `Event: ${event.name}`,
    `Event date: ${eventDate}`,
    `Venue: ${event.venue}`,
    `Seats: ${seats}`,
    `Pickup: ${event.pickup}`,
    `Departure: ${event.departure}`,
    `Drop-off: ${event.dropoff}`,
    `Return: ${event.returnPlan}`,
    "",
    "Your event ticket is not included. Please arrive before the listed departure time.",
    "",
    "Andrew",
    "Boston Party Van",
    "(617) 515-3702",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#edf3f7;color:#132232;font-family:Arial,sans-serif;"><div style="max-width:620px;margin:0 auto;padding:32px 16px;"><div style="padding:30px 28px;background:#061725;border-radius:8px 8px 0 0;"><p style="margin:0;color:#35d2c3;font-size:12px;font-weight:700;text-transform:uppercase;">Boston Party Van</p><h1 style="margin:12px 0 0;color:#fff;font-size:30px;line-height:1.1;">Your seats are booked.</h1><p style="margin:12px 0 0;color:#9fb3c3;font-size:13px;">${htmlEscape(reference)}</p></div><div style="padding:28px;background:#fff;border-radius:0 0 8px 8px;"><p style="margin-top:0;font-size:17px;line-height:1.6;">Hi ${htmlEscape(firstName)},</p><p style="font-size:17px;line-height:1.6;">You are confirmed for <strong>${htmlEscape(event.name)}</strong>.</p><div style="margin:22px 0;padding:18px;border:1px solid #d9e4eb;border-radius:7px;background:#f7fafc;"><table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;"><tr><td style="padding:9px 0;color:#587083;">Date</td><td style="padding:9px 0;text-align:right;font-weight:700;">${htmlEscape(eventDate)}</td></tr><tr><td style="padding:9px 0;color:#587083;">Venue</td><td style="padding:9px 0;text-align:right;">${htmlEscape(event.venue)}</td></tr><tr><td style="padding:9px 0;color:#587083;">Seats</td><td style="padding:9px 0;text-align:right;">${htmlEscape(seats)}</td></tr><tr><td style="padding:9px 0;color:#587083;">Pickup</td><td style="padding:9px 0;text-align:right;">${htmlEscape(event.pickup)}</td></tr><tr><td style="padding:9px 0;color:#587083;">Departure</td><td style="padding:9px 0;text-align:right;">${htmlEscape(event.departure)}</td></tr><tr><td style="padding:9px 0;color:#587083;">Drop-off</td><td style="padding:9px 0;text-align:right;">${htmlEscape(event.dropoff)}</td></tr><tr><td style="padding:9px 0;color:#587083;">Return</td><td style="padding:9px 0;text-align:right;">${htmlEscape(event.returnPlan)}</td></tr></table></div><div style="display:flex;padding:16px 18px;justify-content:space-between;border-radius:7px;background:#071d2c;color:#fff;font-size:18px;"><strong>Payment received</strong><strong style="color:#ffc149;">${htmlEscape(total)}</strong></div><p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #d9e1e8;color:#587083;font-size:14px;line-height:1.5;">Event admission is not included. Please arrive before the listed departure time.</p><p style="margin:24px 0 0;line-height:1.6;">Andrew<br><strong>Boston Party Van</strong><br><a href="tel:+16175153702" style="color:#087e79;">(617) 515-3702</a></p></div></div></body></html>`;

  return { subject, text, html };
}

async function sendBookingReceipt(env, booking, event) {
  if (!env.RESEND_API_KEY) {
    console.warn("Booking receipt skipped: RESEND_API_KEY is not configured.");
    return;
  }

  const receipt = buildBookingReceipt(booking, event);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [booking.customer_email],
      bcc: [env.BOOKING_NOTIFICATION_EMAIL || DEFAULT_REPLY_TO],
      reply_to: env.BOOKING_REPLY_TO_EMAIL || DEFAULT_REPLY_TO,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
    }),
  });

  if (!response.ok) {
    console.error("Booking receipt email failed", response.status, await response.text());
  }
}

async function webhookAlreadyProcessed(db, eventId) {
  return Boolean(
    await db
      .prepare("SELECT id FROM stripe_webhook_events WHERE id = ?")
      .bind(eventId)
      .first()
  );
}

async function completeBooking(env, stripeEvent, ctx) {
  const session = stripeEvent.data?.object;
  const bookingId = session?.metadata?.booking_id;
  if (!bookingId) throw new Error("Stripe session is missing booking metadata.");

  const booking = await env.EVENTS_DB
    .prepare("SELECT * FROM event_bookings WHERE id = ?")
    .bind(bookingId)
    .first();
  if (!booking) throw new Error("Stripe booking was not found.");
  if (booking.status === "paid") return;
  if (booking.status !== "held") {
    throw new Error(`Stripe confirmed a booking with status ${booking.status}.`);
  }
  if (Number(session.amount_total) !== Number(booking.total_cents)) {
    throw new Error("Stripe total does not match the reserved booking total.");
  }
  if (String(session.currency || "").toLowerCase() !== booking.currency) {
    throw new Error("Stripe currency does not match the reserved booking currency.");
  }

  const nowIso = new Date().toISOString();
  let results;
  try {
    results = await env.EVENTS_DB.batch([
      env.EVENTS_DB
        .prepare(
          `INSERT INTO stripe_webhook_events (id, event_type, received_at)
           VALUES (?, ?, ?)`
        )
        .bind(stripeEvent.id, stripeEvent.type, nowIso),
      env.EVENTS_DB
        .prepare(
          `UPDATE event_bookings
           SET status = 'paid', stripe_session_id = ?, stripe_payment_intent_id = ?,
               paid_at = ?, updated_at = ?
           WHERE id = ? AND status = 'held'`
        )
        .bind(session.id, session.payment_intent || null, nowIso, nowIso, bookingId),
      env.EVENTS_DB
        .prepare(
          `UPDATE event_seat_reservations
           SET status = 'sold', hold_expires_at = NULL, sold_at = ?
           WHERE booking_id = ? AND status = 'held'`
        )
        .bind(nowIso, bookingId),
    ]);
  } catch (error) {
    if (await webhookAlreadyProcessed(env.EVENTS_DB, stripeEvent.id)) return;
    throw error;
  }

  if (Number(results[1]?.meta?.changes || 0) < 1) {
    throw new Error("Paid booking was no longer held when Stripe confirmed payment.");
  }
  const event = findEvent(booking.event_id);
  if (event) ctx.waitUntil(sendBookingReceipt(env, booking, event));
}

async function expireBooking(env, stripeEvent) {
  const bookingId = stripeEvent.data?.object?.metadata?.booking_id;
  if (!bookingId) return;
  const booking = await env.EVENTS_DB
    .prepare("SELECT status FROM event_bookings WHERE id = ?")
    .bind(bookingId)
    .first();
  if (!booking || booking.status !== "held") return;
  const nowIso = new Date().toISOString();
  try {
    await env.EVENTS_DB.batch([
      env.EVENTS_DB
        .prepare(
          `INSERT INTO stripe_webhook_events (id, event_type, received_at)
           VALUES (?, ?, ?)`
        )
        .bind(stripeEvent.id, stripeEvent.type, nowIso),
      env.EVENTS_DB
        .prepare("DELETE FROM event_seat_reservations WHERE booking_id = ? AND status = 'held'")
        .bind(bookingId),
      env.EVENTS_DB
        .prepare(
          `UPDATE event_bookings
           SET status = 'expired', updated_at = ?
           WHERE id = ? AND status = 'held'`
        )
        .bind(nowIso, bookingId),
    ]);
  } catch (error) {
    if (await webhookAlreadyProcessed(env.EVENTS_DB, stripeEvent.id)) return;
    throw error;
  }
}

async function handleStripeWebhook(request, env, ctx) {
  if (!env.EVENTS_DB || !env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse({ success: false, message: "Webhook is not configured." }, 503);
  }

  const payload = await request.text();
  const signature = request.headers.get("Stripe-Signature");
  if (!(await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET))) {
    return jsonResponse({ success: false, message: "Invalid webhook signature." }, 400);
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(payload);
  } catch {
    return jsonResponse({ success: false, message: "Invalid webhook payload." }, 400);
  }

  try {
    if (
      stripeEvent.type === "checkout.session.completed" ||
      stripeEvent.type === "checkout.session.async_payment_succeeded"
    ) {
      const paymentStatus = stripeEvent.data?.object?.payment_status;
      if (paymentStatus === "paid" || paymentStatus === "no_payment_required") {
        await completeBooking(env, stripeEvent, ctx);
      }
    } else if (
      stripeEvent.type === "checkout.session.expired" ||
      stripeEvent.type === "checkout.session.async_payment_failed"
    ) {
      await expireBooking(env, stripeEvent);
    }
  } catch (error) {
    console.error("Stripe webhook processing failed", stripeEvent.id, error);
    return jsonResponse({ success: false, message: "Webhook processing failed." }, 500);
  }

  return jsonResponse({ received: true });
}

async function handleBookingStatus(request, env, bookingId) {
  if (!requestOriginAllowed(request) || !env.EVENTS_DB) {
    return jsonResponse({ success: false, message: "Booking not found." }, 404);
  }
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!token) return jsonResponse({ success: false, message: "Booking not found." }, 404);

  const booking = await env.EVENTS_DB
    .prepare(
      `SELECT event_id, seat_ids, total_cents, status
       FROM event_bookings
       WHERE id = ? AND lookup_token = ?`
    )
    .bind(bookingId, token)
    .first();
  if (!booking) return jsonResponse({ success: false, message: "Booking not found." }, 404);

  const event = findEvent(booking.event_id);
  return jsonResponse({
    success: true,
    booking: {
      status: booking.status,
      eventId: booking.event_id,
      seats: JSON.parse(booking.seat_ids),
      totalCents: booking.total_cents,
      eventName: event?.name || "Event Ride",
    },
  });
}

export async function handleEventApi(request, env, ctx, url) {
  if (url.pathname === "/api/events" && request.method === "GET") {
    return jsonResponse({ success: true, events: await listEvents(env) });
  }

  const checkoutMatch = url.pathname.match(/^\/api\/events\/([^/]+)\/checkout$/);
  if (checkoutMatch && request.method === "POST") {
    return handleCheckout(request, env, decodeURIComponent(checkoutMatch[1]));
  }

  const bookingMatch = url.pathname.match(/^\/api\/event-bookings\/([^/]+)$/);
  if (bookingMatch && request.method === "GET") {
    return handleBookingStatus(request, env, decodeURIComponent(bookingMatch[1]));
  }

  const cancellationMatch = url.pathname.match(
    /^\/api\/event-bookings\/([^/]+)\/cancel$/
  );
  if (cancellationMatch && request.method === "POST") {
    return handleBookingCancellation(
      request,
      env,
      decodeURIComponent(cancellationMatch[1])
    );
  }

  if (url.pathname === "/api/stripe-webhook" && request.method === "POST") {
    return handleStripeWebhook(request, env, ctx);
  }

  return null;
}
