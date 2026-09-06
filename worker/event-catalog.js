export const PASSENGER_SEATS = [
  "1A",
  "2A",
  "2B",
  "2C",
  "3A",
  "3B",
  "3C",
  "4A",
  "4B",
  "4C",
  "5A",
  "5B",
  "5C",
  "5D",
];

const STANDARD_INCLUDED = [
  "Reserved seat for the outbound and return ride",
  "One coordinated pickup and event drop-off",
  "Post-event return to the listed pickup point",
];

const STANDARD_NOT_INCLUDED = ["Event admission", "Food and drinks", "Additional pickup stops"];

// Add new trips here. Use status "preview" while reviewing and "on_sale" only
// after the trip, payment account, insurance, and operating authority are ready.
export const EVENT_CATALOG = [
  {
    id: "preview-td-garden-concert",
    name: "Preview: TD Garden Concert Ride",
    type: "Concert",
    venue: "TD Garden, Boston",
    startsAt: "2026-10-17T19:30:00-04:00",
    archiveAt: "2026-10-18T03:00:00-04:00",
    salesCloseAt: "2026-10-17T16:30:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "TD Garden rideshare area",
    departure: "5:45 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 10000,
    maxSeatsPerBooking: 6,
    description:
      "A single coordinated round trip for guests attending the same event. This preview shows how a live event listing will explain the complete plan before seat selection.",
    included: STANDARD_INCLUDED,
    notIncluded: STANDARD_NOT_INCLUDED,
    status: "preview",
    featured: true,
    isExample: true,
    previewUnavailableSeats: ["3B", "4C"],
  },
  {
    id: "preview-foxborough-event",
    name: "Preview: Foxborough Game-Day Ride",
    type: "Sports",
    venue: "Gillette Stadium, Foxborough",
    startsAt: "2026-10-25T16:25:00-04:00",
    archiveAt: "2026-10-26T01:30:00-04:00",
    salesCloseAt: "2026-10-25T12:30:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "Gillette Stadium transportation area",
    departure: "1:15 PM sharp",
    returnPlan: "Departs 45 minutes after the event ends",
    priceCents: 11000,
    maxSeatsPerBooking: 6,
    description: "A preview of a coordinated game-day round trip with one pickup and one return.",
    included: STANDARD_INCLUDED,
    notIncluded: STANDARD_NOT_INCLUDED,
    status: "preview",
    featured: true,
    isExample: true,
    previewUnavailableSeats: ["2C", "3A", "5D"],
  },
  {
    id: "preview-mgm-music-hall",
    name: "Preview: MGM Music Hall Ride",
    type: "Concert",
    venue: "MGM Music Hall at Fenway, Boston",
    startsAt: "2026-11-14T19:30:00-05:00",
    archiveAt: "2026-11-15T03:00:00-05:00",
    salesCloseAt: "2026-11-14T16:30:00-05:00",
    pickup: "South Boston pickup point",
    dropoff: "Fenway event transportation area",
    departure: "5:45 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 9500,
    maxSeatsPerBooking: 6,
    description: "A preview of a shared concert ride with fixed pickup, drop-off, and return timing.",
    included: STANDARD_INCLUDED,
    notIncluded: STANDARD_NOT_INCLUDED,
    status: "preview",
    featured: true,
    isExample: true,
    previewUnavailableSeats: ["1A", "3B", "4A", "4B"],
  },
  {
    id: "preview-waterfront-summer-show",
    name: "Preview: Waterfront Summer Show Ride",
    type: "Concert",
    venue: "Leader Bank Pavilion, Boston",
    startsAt: "2026-07-18T19:30:00-04:00",
    archiveAt: "2026-07-19T03:00:00-04:00",
    salesCloseAt: "2026-07-18T16:30:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "Waterfront event transportation area",
    departure: "5:45 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 9000,
    maxSeatsPerBooking: 6,
    description: "A sample archived summer ride used to preview the sold-out event list.",
    included: STANDARD_INCLUDED,
    notIncluded: STANDARD_NOT_INCLUDED,
    status: "preview",
    featured: false,
    isExample: true,
    previewUnavailableSeats: PASSENGER_SEATS,
  },
  {
    id: "preview-fenway-summer-concert",
    name: "Preview: Fenway Summer Concert Ride",
    type: "Concert",
    venue: "Fenway Park, Boston",
    startsAt: "2026-08-08T19:00:00-04:00",
    archiveAt: "2026-08-09T03:00:00-04:00",
    salesCloseAt: "2026-08-08T16:00:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "Fenway event transportation area",
    departure: "5:15 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 10000,
    maxSeatsPerBooking: 6,
    description: "A sample archived summer ride used to preview the sold-out event list.",
    included: STANDARD_INCLUDED,
    notIncluded: STANDARD_NOT_INCLUDED,
    status: "preview",
    featured: false,
    isExample: true,
    previewUnavailableSeats: PASSENGER_SEATS,
  },
];

export function findEvent(eventId) {
  return EVENT_CATALOG.find((event) => event.id === eventId) || null;
}

export function eventLifecycle(event, now = new Date()) {
  const nowTime = now.getTime();
  if (nowTime >= new Date(event.archiveAt).getTime()) return "archived";
  if (nowTime >= new Date(event.salesCloseAt).getTime()) return "sales_closed";
  return event.status;
}

export function toPublicEvent(event, inventory = {}, checkoutConfigured = false, now = new Date()) {
  const lifecycle = eventLifecycle(event, now);
  const heldSeats = inventory.heldSeats || [];
  const soldSeats = inventory.soldSeats || [];
  const unavailableSeats = event.status === "preview"
    ? event.previewUnavailableSeats || []
    : [...new Set([...heldSeats, ...soldSeats])];
  const seatsRemaining = Math.max(0, PASSENGER_SEATS.length - unavailableSeats.length);
  const status = lifecycle === "on_sale" && seatsRemaining === 0 ? "sold_out" : lifecycle;

  return {
    id: event.id,
    name: event.name,
    type: event.type,
    venue: event.venue,
    startsAt: event.startsAt,
    archiveAt: event.archiveAt,
    salesCloseAt: event.salesCloseAt,
    pickup: event.pickup,
    dropoff: event.dropoff,
    departure: event.departure,
    returnPlan: event.returnPlan,
    priceCents: event.priceCents,
    maxSeatsPerBooking: event.maxSeatsPerBooking,
    description: event.description,
    included: event.included,
    notIncluded: event.notIncluded,
    featured: event.featured !== false,
    isExample: Boolean(event.isExample),
    status,
    heldSeats,
    soldSeats,
    unavailableSeats,
    seatsRemaining,
    checkoutEnabled: checkoutConfigured && status === "on_sale",
  };
}
