const FALLBACK_INCLUDED = [
  "Reserved seat for the outbound and return ride",
  "One coordinated pickup and event drop-off",
  "Post-event return to the listed pickup point",
];
const FALLBACK_NOT_INCLUDED = ["Event admission", "Food and drinks", "Additional pickup stops"];
const ALL_PASSENGER_SEATS = [
  "1A", "2A", "2B", "2C", "3A", "3B", "3C", "4A", "4B", "4C", "5A", "5B", "5C", "5D",
];

const FALLBACK_EVENTS = [
  {
    id: "preview-td-garden-concert",
    name: "Preview: TD Garden Concert Ride",
    type: "Concert",
    venue: "TD Garden, Boston",
    startsAt: "2026-10-17T19:30:00-04:00",
    archiveAt: "2026-10-18T03:00:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "TD Garden rideshare area",
    departure: "5:45 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 10000,
    maxSeatsPerBooking: 6,
    description:
      "A single coordinated round trip for guests attending the same event. This preview shows how a live event listing will explain the complete plan before seat selection.",
    included: FALLBACK_INCLUDED,
    notIncluded: FALLBACK_NOT_INCLUDED,
    status: "preview",
    featured: true,
    isExample: true,
    heldSeats: ["4C"],
    soldSeats: ["3B"],
    unavailableSeats: ["3B", "4C"],
    seatsRemaining: 12,
    checkoutEnabled: false,
  },
  {
    id: "preview-foxborough-event",
    name: "Preview: Foxborough Game-Day Ride",
    type: "Sports",
    venue: "Gillette Stadium, Foxborough",
    startsAt: "2026-10-25T16:25:00-04:00",
    archiveAt: "2026-10-26T01:30:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "Gillette Stadium transportation area",
    departure: "1:15 PM sharp",
    returnPlan: "Departs 45 minutes after the event ends",
    priceCents: 11000,
    maxSeatsPerBooking: 6,
    description: "A preview of a coordinated game-day round trip with one pickup and one return.",
    included: FALLBACK_INCLUDED,
    notIncluded: FALLBACK_NOT_INCLUDED,
    status: "preview",
    featured: true,
    isExample: true,
    heldSeats: [],
    soldSeats: ["2C", "3A", "5D"],
    unavailableSeats: ["2C", "3A", "5D"],
    seatsRemaining: 11,
    checkoutEnabled: false,
  },
  {
    id: "preview-mgm-music-hall",
    name: "Preview: MGM Music Hall Ride",
    type: "Concert",
    venue: "MGM Music Hall at Fenway, Boston",
    startsAt: "2026-11-14T19:30:00-05:00",
    archiveAt: "2026-11-15T03:00:00-05:00",
    pickup: "South Boston pickup point",
    dropoff: "Fenway event transportation area",
    departure: "5:45 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 9500,
    maxSeatsPerBooking: 6,
    description: "A preview of a shared concert ride with fixed pickup, drop-off, and return timing.",
    included: FALLBACK_INCLUDED,
    notIncluded: FALLBACK_NOT_INCLUDED,
    status: "preview",
    featured: true,
    isExample: true,
    heldSeats: [],
    soldSeats: ["1A", "3B", "4A", "4B"],
    unavailableSeats: ["1A", "3B", "4A", "4B"],
    seatsRemaining: 10,
    checkoutEnabled: false,
  },
  {
    id: "preview-waterfront-summer-show",
    name: "Preview: Waterfront Summer Show Ride",
    type: "Concert",
    venue: "Leader Bank Pavilion, Boston",
    startsAt: "2026-07-18T19:30:00-04:00",
    archiveAt: "2026-07-19T03:00:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "Waterfront event transportation area",
    departure: "5:45 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 9000,
    maxSeatsPerBooking: 6,
    description: "A sample archived summer ride used to preview the sold-out event list.",
    included: FALLBACK_INCLUDED,
    notIncluded: FALLBACK_NOT_INCLUDED,
    status: "archived",
    featured: false,
    isExample: true,
    heldSeats: [],
    soldSeats: ALL_PASSENGER_SEATS,
    unavailableSeats: ALL_PASSENGER_SEATS,
    seatsRemaining: 0,
    checkoutEnabled: false,
  },
  {
    id: "preview-fenway-summer-concert",
    name: "Preview: Fenway Summer Concert Ride",
    type: "Concert",
    venue: "Fenway Park, Boston",
    startsAt: "2026-08-08T19:00:00-04:00",
    archiveAt: "2026-08-09T03:00:00-04:00",
    pickup: "South Boston pickup point",
    dropoff: "Fenway event transportation area",
    departure: "5:15 PM sharp",
    returnPlan: "Departs 30 minutes after the show ends",
    priceCents: 10000,
    maxSeatsPerBooking: 6,
    description: "A sample archived summer ride used to preview the sold-out event list.",
    included: FALLBACK_INCLUDED,
    notIncluded: FALLBACK_NOT_INCLUDED,
    status: "archived",
    featured: false,
    isExample: true,
    heldSeats: [],
    soldSeats: ALL_PASSENGER_SEATS,
    unavailableSeats: ALL_PASSENGER_SEATS,
    seatsRemaining: 0,
    checkoutEnabled: false,
  },
];

const state = {
  events: [],
  activeEventId: "",
  selectedSeats: new Set(),
  usingFallback: false,
};

const elements = {
  select: document.getElementById("eventSelect"),
  datePicker: document.getElementById("eventDatePicker"),
  dateStatus: document.getElementById("eventDateStatus"),
  featuredList: document.getElementById("featuredEventList"),
  emptyState: document.getElementById("eventEmptyState"),
  bookingLayout: document.getElementById("eventBookingLayout"),
  previewNotice: document.getElementById("previewNotice"),
  continueButton: document.getElementById("continueButton"),
  seatStatus: document.getElementById("seatStatus"),
  checkoutDialog: document.getElementById("checkoutDialog"),
  checkoutFormView: document.getElementById("checkoutFormView"),
  checkoutPreviewView: document.getElementById("checkoutPreviewView"),
  checkoutResultView: document.getElementById("checkoutResultView"),
  checkoutForm: document.getElementById("checkoutForm"),
  checkoutStatus: document.getElementById("checkoutStatus"),
  checkoutSubmit: document.getElementById("checkoutSubmit"),
  checkoutEventType: document.getElementById("checkoutEventType"),
  checkoutModeBadge: document.getElementById("checkoutModeBadge"),
  checkoutEventName: document.getElementById("checkoutEventName"),
  checkoutEventDate: document.getElementById("checkoutEventDate"),
  checkoutPickup: document.getElementById("checkoutPickup"),
  checkoutDeparture: document.getElementById("checkoutDeparture"),
  checkoutReturn: document.getElementById("checkoutReturn"),
  checkoutSeatChips: document.getElementById("checkoutSeatChips"),
  checkoutFareLabel: document.getElementById("checkoutFareLabel"),
  checkoutSubtotal: document.getElementById("checkoutSubtotal"),
  checkoutTotal: document.getElementById("checkoutTotal"),
  checkoutContactIntro: document.getElementById("checkoutContactIntro"),
  editSeatsButton: document.getElementById("editSeatsButton"),
  checkoutPreviewCopy: document.getElementById("checkoutPreviewCopy"),
  checkoutResultMark: document.getElementById("checkoutResultMark"),
  checkoutResultEyebrow: document.getElementById("checkoutResultEyebrow"),
  checkoutResultHeading: document.getElementById("checkoutResultHeading"),
  checkoutResultCopy: document.getElementById("checkoutResultCopy"),
  checkoutResultDetails: document.getElementById("checkoutResultDetails"),
  checkoutResultEvent: document.getElementById("checkoutResultEvent"),
  checkoutResultSeats: document.getElementById("checkoutResultSeats"),
  checkoutResultTotal: document.getElementById("checkoutResultTotal"),
  checkoutResultHelp: document.getElementById("checkoutResultHelp"),
  checkoutResultDone: document.getElementById("checkoutResultDone"),
};

const seats = Array.from(document.querySelectorAll(".seat[data-seat]"));
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const eventDateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
  timeZoneName: "short",
});
const shortDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "America/New_York",
});
const eventMonthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "America/New_York",
});
const eventDayFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: "America/New_York",
});

function activeEvent() {
  return state.events.find((event) => event.id === state.activeEventId) || null;
}

function setList(id, items) {
  const list = document.getElementById(id);
  list.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    })
  );
}

function statusLabel(event) {
  if (event.status === "sold_out") return "Sold out";
  if (event.status === "sales_closed") return "Sales closed";
  if (event.status === "preview") return "Preview";
  return `${event.seatsRemaining} seats left`;
}

function shortEventName(event) {
  return event.name.replace(/^Preview:\s*/i, "");
}

function eventArtworkClass(event) {
  const eventLabel = `${event.id} ${event.venue}`.toLowerCase();
  if (eventLabel.includes("td-garden") || eventLabel.includes("td garden")) {
    return "artwork-garden";
  }
  if (eventLabel.includes("foxborough") || eventLabel.includes("gillette")) {
    return "artwork-van";
  }
  if (eventLabel.includes("mgm") || eventLabel.includes("fenway")) {
    return "artwork-nightlife";
  }
  return "artwork-city";
}

function eventDateValue(event) {
  return event.startsAt.slice(0, 10);
}

function updateFeaturedSelection() {
  elements.featuredList.querySelectorAll(".featured-event-tile").forEach((tile) => {
    const isActive = tile.dataset.eventId === state.activeEventId;
    tile.classList.toggle("is-active", isActive);
    tile.setAttribute("aria-pressed", String(isActive));
  });
}

function renderFeaturedEvents(events) {
  const section = document.querySelector(".featured-rides");
  const featuredEvents = events.filter((event) => event.featured !== false).slice(0, 3);
  section.hidden = !featuredEvents.length;

  const tiles = featuredEvents.map((event) => {
    const button = document.createElement("button");
    const date = new Date(event.startsAt);
    const dateBlock = document.createElement("span");
    const month = document.createElement("span");
    const day = document.createElement("strong");
    const copy = document.createElement("span");
    const type = document.createElement("span");
    const name = document.createElement("strong");
    const venue = document.createElement("span");
    const price = document.createElement("span");

    button.type = "button";
    button.className = `featured-event-tile ${eventArtworkClass(event)}`;
    button.dataset.eventId = event.id;
    button.setAttribute("aria-label", `Select ${event.name}`);
    button.setAttribute("aria-pressed", String(event.id === state.activeEventId));
    if (event.id === state.activeEventId) button.classList.add("is-active");

    dateBlock.className = "featured-event-date";
    month.textContent = eventMonthFormat.format(date);
    day.textContent = eventDayFormat.format(date);
    dateBlock.append(month, day);

    copy.className = "featured-event-copy";
    type.className = "featured-event-type";
    type.textContent = event.type;
    name.textContent = shortEventName(event);
    venue.textContent = event.venue;
    copy.append(type, name, venue);

    price.className = "featured-event-price";
    price.textContent = currency.format(event.priceCents / 100);
    button.append(dateBlock, copy, price);
    button.addEventListener("click", () => {
      renderEvent(event);
      trackEventRide("select_item", {
        item_list_name: "Featured event rides",
        items: [{ item_id: event.id, item_name: shortEventName(event), item_category: event.type }],
      });
    });
    return button;
  });

  elements.featuredList.replaceChildren(...tiles);
}

function updateSelectionSummary() {
  const event = activeEvent();
  const seatIds = Array.from(state.selectedSeats).sort();
  const count = seatIds.length;
  const total = count * (event?.priceCents || 0);
  const selectionAllowed = event && !["sold_out", "sales_closed", "archived"].includes(event.status);

  document.getElementById("selectionCount").textContent = count
    ? `${count} ${count === 1 ? "seat" : "seats"} selected`
    : "No seats selected";
  document.getElementById("selectionSeats").textContent = count
    ? seatIds.join(", ")
    : "Choose from the green seats";
  document.getElementById("selectionTotal").textContent = currency.format(total / 100);
  elements.continueButton.disabled = !count || !selectionAllowed;
  elements.continueButton.textContent = event?.checkoutEnabled
    ? "Continue"
    : "Preview checkout";
}

function renderSeatInventory(event) {
  const held = new Set(event.heldSeats || []);
  const sold = new Set(event.soldSeats || []);
  const unavailable = new Set(event.unavailableSeats || []);

  for (const selectedSeat of Array.from(state.selectedSeats)) {
    if (unavailable.has(selectedSeat)) state.selectedSeats.delete(selectedSeat);
  }

  seats.forEach((seat) => {
    const seatId = seat.dataset.seat;
    const isHeld = held.has(seatId);
    const isSold = sold.has(seatId) || (event.status === "preview" && unavailable.has(seatId) && !isHeld);
    const isUnavailable = isHeld || isSold;
    const isSelected = state.selectedSeats.has(seatId) && !isUnavailable;

    seat.disabled = isUnavailable || ["sold_out", "sales_closed", "archived"].includes(event.status);
    seat.classList.toggle("is-held", isHeld);
    seat.classList.toggle("is-unavailable", isSold);
    seat.classList.toggle("is-selected", isSelected);
    seat.setAttribute("aria-pressed", String(isSelected));

    let label = `Seat ${seatId}, available`;
    if (isHeld) label = `Seat ${seatId}, temporarily held`;
    if (isSold) label = `Seat ${seatId}, sold`;
    if (isSelected) label = `Seat ${seatId}, selected`;
    seat.setAttribute("aria-label", label);
  });
}

function renderEvent(event, preserveSelection = false) {
  state.activeEventId = event.id;
  if (!preserveSelection) state.selectedSeats.clear();

  document.getElementById("eventType").textContent = event.type;
  document.getElementById("eventDate").textContent = eventDateFormat.format(
    new Date(event.startsAt)
  );
  document.getElementById("eventName").textContent = shortEventName(event);
  document.getElementById("eventVenue").textContent = event.venue;
  document.getElementById("eventDescription").textContent = event.description;
  document.getElementById("eventPickup").textContent = event.pickup;
  document.getElementById("eventDeparture").textContent = event.departure;
  document.getElementById("eventDropoff").textContent = event.dropoff;
  document.getElementById("eventReturn").textContent = event.returnPlan;
  document.getElementById("eventPrice").textContent = `${currency.format(
    event.priceCents / 100
  )} per seat`;
  document.getElementById("seatRate").textContent = `${currency.format(
    event.priceCents / 100
  )} each`;

  setList("eventIncluded", event.included);
  setList("eventNotIncluded", event.notIncluded);

  const availability = document.getElementById("eventAvailability");
  availability.textContent = statusLabel(event);
  availability.className = `event-availability is-${event.status.replaceAll("_", "-")}`;
  elements.previewNotice.hidden = event.status !== "preview";
  elements.select.value = event.id;
  elements.datePicker.value = eventDateValue(event);
  elements.dateStatus.textContent = "";
  updateFeaturedSelection();
  renderSeatInventory(event);
  updateSelectionSummary();
}

function renderPastEvents() {
  const pastEvents = state.events.filter((event) => event.status === "archived");
  const section = document.querySelector(".past-events");
  const list = document.getElementById("pastEventList");
  section.hidden = !pastEvents.length;

  if (!pastEvents.length) {
    list.replaceChildren();
    return;
  }

  const ul = document.createElement("ul");
  const newestFirst = [...pastEvents].sort(
    (left, right) => new Date(right.startsAt) - new Date(left.startsAt)
  );

  for (const event of newestFirst) {
    const li = document.createElement("li");
    const copy = document.createElement("span");
    const name = document.createElement("strong");
    const venue = document.createElement("span");
    const meta = document.createElement("span");
    const date = document.createElement("span");
    const status = document.createElement("span");

    li.className = "past-event-item";
    copy.className = "past-event-copy";
    name.textContent = shortEventName(event);
    venue.textContent = event.venue;
    copy.append(name, venue);

    meta.className = "past-event-meta";
    date.textContent = shortDateFormat.format(new Date(event.startsAt));
    status.className = "past-event-status";
    status.textContent = event.isExample ? "Sold-out example" : "Sold out";
    meta.append(date, status);

    li.append(copy, meta);
    ul.append(li);
  }
  list.replaceChildren(ul);
}

function renderCatalog({ preserveSelection = false } = {}) {
  const upcomingEvents = state.events.filter((event) => event.status !== "archived");
  renderPastEvents();
  renderFeaturedEvents(upcomingEvents);

  if (!upcomingEvents.length) {
    elements.select.replaceChildren(new Option("No upcoming events", ""));
    elements.select.disabled = true;
    elements.datePicker.disabled = true;
    elements.datePicker.value = "";
    elements.dateStatus.textContent = "";
    elements.emptyState.hidden = false;
    elements.bookingLayout.hidden = true;
    return;
  }

  const priorEventId = state.activeEventId;
  elements.select.replaceChildren(
    ...upcomingEvents.map((event) => {
      const statusSuffix = ["sold_out", "sales_closed"].includes(event.status)
        ? ` - ${statusLabel(event)}`
        : "";
      const option = new Option(
        `${shortDateFormat.format(new Date(event.startsAt))} - ${shortEventName(event)}${statusSuffix}`,
        event.id
      );
      option.className = event.status === "sold_out" ? "is-sold-out" : "";
      return option;
    })
  );
  elements.select.disabled = false;
  elements.datePicker.disabled = false;
  elements.emptyState.hidden = true;
  elements.bookingLayout.hidden = false;

  const requestedEventId = new URLSearchParams(window.location.search).get("event");
  const event = upcomingEvents.find((item) => item.id === priorEventId)
    || upcomingEvents.find((item) => item.id === requestedEventId)
    || upcomingEvents.find((item) => item.status !== "sold_out")
    || upcomingEvents[0];
  renderEvent(event, preserveSelection && event.id === priorEventId);
}

async function loadEvents({ silent = false, preserveSelection = false } = {}) {
  try {
    const response = await fetch("/api/events", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Event API is unavailable.");
    const result = await response.json();
    if (!result.success || !Array.isArray(result.events)) throw new Error("Invalid event response.");
    state.events = result.events;
    state.usingFallback = false;
  } catch (error) {
    if (silent && state.events.length) return;
    state.events = FALLBACK_EVENTS;
    state.usingFallback = true;
  }

  renderCatalog({ preserveSelection });
}

function selectSeat(seat) {
  const event = activeEvent();
  const seatId = seat.dataset.seat;
  if (!event || !seatId || seat.disabled) return;

  if (state.selectedSeats.has(seatId)) {
    state.selectedSeats.delete(seatId);
    elements.seatStatus.textContent = `Seat ${seatId} removed.`;
    trackEventRide("remove_from_cart", {
      currency: "USD",
      value: event.priceCents / 100,
      items: [{
        item_id: event.id,
        item_name: shortEventName(event),
        item_category: event.type,
        item_variant: seatId,
        price: event.priceCents / 100,
        quantity: 1,
      }],
    });
  } else if (state.selectedSeats.size >= event.maxSeatsPerBooking) {
    elements.seatStatus.textContent = `Choose up to ${event.maxSeatsPerBooking} seats per reservation.`;
    return;
  } else {
    state.selectedSeats.add(seatId);
    elements.seatStatus.textContent = `Seat ${seatId} selected.`;
    trackEventRide("add_to_cart", {
      currency: "USD",
      value: event.priceCents / 100,
      items: [{
        item_id: event.id,
        item_name: shortEventName(event),
        item_category: event.type,
        item_variant: seatId,
        price: event.priceCents / 100,
        quantity: 1,
      }],
    });
  }

  renderSeatInventory(event);
  updateSelectionSummary();
}

function showDialogView(view) {
  elements.checkoutFormView.hidden = view !== "form";
  elements.checkoutPreviewView.hidden = view !== "preview";
  elements.checkoutResultView.hidden = view !== "result";
  const labelledBy = {
    form: "checkoutDialogTitle",
    preview: "checkoutPreviewHeading",
    result: "checkoutResultHeading",
  };
  elements.checkoutDialog.setAttribute("aria-labelledby", labelledBy[view]);
}

function showCheckoutDialog() {
  if (!elements.checkoutDialog.open) elements.checkoutDialog.showModal();
}

function setCheckoutProgress(stage) {
  const order = ["review", "payment", "booked"];
  const activeIndex = order.indexOf(stage);
  document.querySelectorAll("[data-checkout-step]").forEach((step) => {
    const stepIndex = order.indexOf(step.dataset.checkoutStep);
    step.classList.toggle("is-active", stepIndex === activeIndex);
    step.classList.toggle(
      "is-complete",
      (activeIndex > -1 && stepIndex < activeIndex) ||
        (stage === "preview" && step.dataset.checkoutStep === "review")
    );
  });
}

function setCheckoutBusy(isBusy) {
  if (isBusy) {
    elements.checkoutDialog.setAttribute("aria-busy", "true");
  } else {
    elements.checkoutDialog.removeAttribute("aria-busy");
  }
  elements.checkoutSubmit.disabled = isBusy;
}

function trackEventRide(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

function renderCheckoutReview(event, seatIds) {
  const seatCount = seatIds.length;
  const totalCents = seatCount * event.priceCents;
  const eventName = shortEventName(event);

  elements.checkoutEventType.textContent = event.type;
  elements.checkoutModeBadge.hidden = event.checkoutEnabled;
  elements.checkoutEventName.textContent = eventName;
  elements.checkoutEventDate.textContent = eventDateFormat.format(new Date(event.startsAt));
  elements.checkoutPickup.textContent = event.pickup;
  elements.checkoutDeparture.textContent = event.departure;
  elements.checkoutReturn.textContent = event.returnPlan;
  elements.checkoutFareLabel.textContent = `${seatCount} ${
    seatCount === 1 ? "seat" : "seats"
  } x ${currency.format(event.priceCents / 100)}`;
  elements.checkoutSubtotal.textContent = currency.format(totalCents / 100);
  elements.checkoutTotal.textContent = currency.format(totalCents / 100);
  elements.checkoutSeatChips.replaceChildren(
    ...seatIds.map((seatId) => {
      const chip = document.createElement("span");
      chip.className = "checkout-seat-chip";
      chip.textContent = seatId;
      return chip;
    })
  );
  elements.checkoutSubmit.textContent = event.checkoutEnabled
    ? "Continue to secure payment"
    : "Preview secure payment";
  elements.checkoutContactIntro.textContent = event.checkoutEnabled
    ? "We will send the ride confirmation and receipt to this person."
    : "Use any test details. Nothing entered in this preview will be sent.";
}

function renderCheckoutOutcome(mode, options = {}) {
  const {
    eyebrow,
    heading,
    copy,
    eventName = "",
    seats: selectedSeats = [],
    totalCents = 0,
    help = "",
  } = options;

  showDialogView("result");
  setCheckoutBusy(false);
  elements.checkoutResultMark.className = `checkout-outcome-mark is-${mode}`;
  elements.checkoutResultMark.replaceChildren();

  if (mode === "pending") {
    elements.checkoutResultMark.append(document.createElement("span"));
    setCheckoutProgress("payment");
  } else {
    elements.checkoutResultMark.textContent = mode === "success" ? "\u2713" : "\u00d7";
    setCheckoutProgress(mode === "success" ? "booked" : "review");
  }

  elements.checkoutResultEyebrow.textContent = eyebrow;
  elements.checkoutResultHeading.textContent = heading;
  elements.checkoutResultCopy.textContent = copy;
  const showDetails = Boolean(eventName && selectedSeats.length);
  elements.checkoutResultDetails.hidden = !showDetails;
  if (showDetails) {
    elements.checkoutResultEvent.textContent = eventName;
    elements.checkoutResultSeats.textContent = selectedSeats.join(", ");
    elements.checkoutResultTotal.textContent = currency.format(totalCents / 100);
  }
  elements.checkoutResultHelp.textContent = help;
  elements.checkoutResultHelp.hidden = !help;
  elements.checkoutResultDone.textContent = mode === "success"
    ? "Done"
    : "Back to event rides";
  showCheckoutDialog();
}

function clearCheckoutQuery() {
  const url = new URL(window.location.href);
  ["checkout", "booking", "token"].forEach((key) => url.searchParams.delete(key));
  const query = url.searchParams.toString();
  window.history.replaceState({}, "", `${url.pathname}${query ? `?${query}` : ""}${url.hash}`);
}

function trackCompletedPurchase(bookingId, booking) {
  const storageKey = `bpv_event_purchase_${bookingId}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "true");
  } catch {
    // Stripe's transaction ID also protects reporting from duplicate refreshes.
  }

  trackEventRide("purchase", {
    transaction_id: bookingId,
    currency: "USD",
    value: booking.totalCents / 100,
    items: [
      {
        item_id: booking.eventId || "event_ride",
        item_name: booking.eventName,
        item_category: "Event Ride",
        price: booking.totalCents / Math.max(booking.seats.length, 1) / 100,
        quantity: booking.seats.length,
      },
    ],
  });
}

function openCheckout() {
  const event = activeEvent();
  const seatIds = Array.from(state.selectedSeats).sort();
  if (!event || !seatIds.length) return;

  renderCheckoutReview(event, seatIds);
  showDialogView("form");
  setCheckoutProgress("review");
  setCheckoutBusy(false);
  elements.checkoutStatus.className = "checkout-status";
  elements.checkoutStatus.textContent = "";
  showCheckoutDialog();
  elements.checkoutDialog.scrollTop = 0;
  elements.checkoutDialog
    .querySelector(".dialog-close")
    ?.focus({ preventScroll: true });

  if (event.checkoutEnabled) {
    trackEventRide("begin_checkout", {
      currency: "USD",
      value: (seatIds.length * event.priceCents) / 100,
      items: [
        {
          item_id: event.id,
          item_name: shortEventName(event),
          item_category: event.type,
          price: event.priceCents / 100,
          quantity: seatIds.length,
        },
      ],
    });
  }
}

async function submitCheckout(event) {
  event.preventDefault();
  const selectedEvent = activeEvent();
  if (!selectedEvent || !state.selectedSeats.size) return;
  if (!elements.checkoutForm.reportValidity()) return;

  const formData = new FormData(elements.checkoutForm);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    seats: Array.from(state.selectedSeats),
  };
  const seatIds = [...payload.seats].sort();
  const totalCents = seatIds.length * selectedEvent.priceCents;

  if (!selectedEvent.checkoutEnabled) {
    setCheckoutBusy(true);
    elements.checkoutSubmit.textContent = "Building preview...";
    elements.checkoutStatus.className = "checkout-status is-sending";
    elements.checkoutStatus.textContent = "Showing the handoff to secure payment.";
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    showDialogView("preview");
    setCheckoutProgress("preview");
    elements.checkoutPreviewCopy.textContent = `${shortEventName(
      selectedEvent
    )}: seats ${seatIds.join(", ")} for ${currency.format(totalCents / 100)}.`;
    trackEventRide("event_ride_checkout_preview", {
      event_id: selectedEvent.id,
      seat_count: seatIds.length,
      value: totalCents / 100,
      currency: "USD",
    });
    setCheckoutBusy(false);
    elements.checkoutSubmit.textContent = "Preview secure payment";
    return;
  }

  setCheckoutBusy(true);
  elements.checkoutSubmit.textContent = "Securing your seats...";
  elements.checkoutStatus.className = "checkout-status is-sending";
  elements.checkoutStatus.textContent = "Opening secure payment.";

  try {
    const response = await fetch(
      `/api/events/${encodeURIComponent(selectedEvent.id)}/checkout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!response.ok || !result.success || !result.checkoutUrl) {
      throw new Error(result.message || "Checkout could not be opened.");
    }
    trackEventRide("event_ride_checkout_redirect", {
      event_id: selectedEvent.id,
      seat_count: seatIds.length,
      value: totalCents / 100,
      currency: "USD",
    });
    window.location.assign(result.checkoutUrl);
  } catch (error) {
    elements.checkoutStatus.className = "checkout-status";
    elements.checkoutStatus.textContent = error.message;
    setCheckoutBusy(false);
    elements.checkoutSubmit.textContent = "Continue to secure payment";
    await loadEvents({ silent: true, preserveSelection: true });
  }
}

async function showCheckoutResult() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") !== "success") return;
  const bookingId = params.get("booking");
  const token = params.get("token");
  if (!bookingId || !token) return;

  renderCheckoutOutcome("pending", {
    eyebrow: "Confirming payment",
    heading: "Checking your payment...",
    copy: "This usually takes only a moment.",
    help: "Keep this page open while we confirm your reservation.",
  });

  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const response = await fetch(
        `/api/event-bookings/${encodeURIComponent(bookingId)}?token=${encodeURIComponent(token)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const result = await response.json();
      if (result.success && result.booking?.status === "paid") {
        renderCheckoutOutcome("success", {
          eyebrow: "Reservation confirmed",
          heading: "You are on the ride.",
          copy: "Your confirmation and receipt are on the way by email.",
          eventName: result.booking.eventName,
          seats: result.booking.seats,
          totalCents: result.booking.totalCents,
          help: "Questions before the event? Reply to your confirmation email or call (617) 515-3702.",
        });
        trackCompletedPurchase(bookingId, result.booking);
        clearCheckoutQuery();
        await loadEvents({ silent: true });
        return;
      }
      if (result.success && ["expired", "cancelled"].includes(result.booking?.status)) {
        renderCheckoutOutcome("cancelled", {
          eyebrow: "Checkout ended",
          heading: "No payment was completed.",
          copy: "The seats were not booked. You can return to the seat map and choose again.",
        });
        clearCheckoutQuery();
        return;
      }
    } catch (error) {
      // The payment webhook can take a moment; retry below.
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
  }

  renderCheckoutOutcome("pending", {
    eyebrow: "Payment processing",
    heading: "Payment is still being confirmed.",
    copy: "Your seats remain protected while confirmation finishes.",
    help: "Keep this page open and refresh in a moment, or check your email for the confirmation.",
  });
}

async function releaseCancelledCheckout() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") !== "cancelled") return;
  const bookingId = params.get("booking");
  const token = params.get("token");
  const requestedEvent = params.get("event");
  const event = state.events.find((item) => item.id === requestedEvent);
  if (event) renderEvent(event);

  renderCheckoutOutcome("pending", {
    eyebrow: "Canceling checkout",
    heading: "Releasing your seats...",
    copy: "This should take only a moment.",
  });

  if (!bookingId || !token) {
    renderCheckoutOutcome("cancelled", {
      eyebrow: "Checkout canceled",
      heading: "No payment was completed.",
      copy: "Return to the seat map whenever you are ready to choose again.",
    });
    clearCheckoutQuery();
    return;
  }

  try {
    const response = await fetch(
      `/api/event-bookings/${encodeURIComponent(bookingId)}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ token }),
      }
    );
    const result = await response.json();
    renderCheckoutOutcome("cancelled", {
      eyebrow: "Checkout canceled",
      heading: "No payment was completed.",
      copy: result.success
        ? "Your seats were released and are available to select again."
        : result.message,
    });
    clearCheckoutQuery();
    await loadEvents({ silent: true });
  } catch {
    renderCheckoutOutcome("cancelled", {
      eyebrow: "Checkout canceled",
      heading: "No payment was completed.",
      copy: "Your unpaid seat hold will release automatically when it expires.",
    });
    clearCheckoutQuery();
  }
}

seats.forEach((seat) => seat.addEventListener("click", () => selectSeat(seat)));
elements.select.addEventListener("change", () => {
  const event = state.events.find((item) => item.id === elements.select.value);
  if (event) {
    renderEvent(event);
    trackEventRide("select_item", {
      item_list_name: "All event rides",
      items: [{ item_id: event.id, item_name: shortEventName(event), item_category: event.type }],
    });
  }
});
elements.datePicker.addEventListener("change", () => {
  const selectedDate = elements.datePicker.value;
  if (!selectedDate) {
    elements.dateStatus.textContent = "";
    return;
  }

  const event = state.events.find(
    (item) => item.status !== "archived" && eventDateValue(item) === selectedDate
  );
  if (event) {
    renderEvent(event);
    trackEventRide("select_item", {
      item_list_name: "Event ride calendar",
      items: [{ item_id: event.id, item_name: shortEventName(event), item_category: event.type }],
    });
    return;
  }

  elements.dateStatus.textContent = "No ride is listed on this date.";
});
elements.continueButton.addEventListener("click", openCheckout);
elements.checkoutForm.addEventListener("submit", submitCheckout);
elements.editSeatsButton.addEventListener("click", () => {
  elements.checkoutDialog.close();
  const selectedSeat = document.querySelector(".seat.is-selected");
  (selectedSeat || document.querySelector(".seat:not(:disabled)"))?.focus();
});

document.querySelectorAll(".dialog-close, .dialog-done").forEach((button) => {
  button.addEventListener("click", () => {
    if (!elements.checkoutDialog.hasAttribute("aria-busy")) {
      elements.checkoutDialog.close();
    }
  });
});
elements.checkoutDialog.addEventListener("click", (event) => {
  if (
    event.target === elements.checkoutDialog &&
    !elements.checkoutDialog.hasAttribute("aria-busy")
  ) {
    elements.checkoutDialog.close();
  }
});
elements.checkoutDialog.addEventListener("cancel", (event) => {
  if (elements.checkoutDialog.hasAttribute("aria-busy")) event.preventDefault();
});

loadEvents().then(async () => {
  await releaseCancelledCheckout();
  await showCheckoutResult();
});
window.setInterval(() => {
  if (!state.usingFallback && !document.hidden) {
    loadEvents({ silent: true, preserveSelection: true });
  }
}, 15000);
