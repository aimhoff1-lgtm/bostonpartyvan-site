const SITE_CONFIG = {
  // Analytics reporting for estimate and quote demand by trip type.
  ga4MeasurementId: "G-3Q3CBMKWZP",
  // Google Ads tag for the Boston Party Van account.
  googleAdsId: "AW-18371382829",
  googleAdsQuoteConversionLabel: "wuR8CJecitwcEK2clLhE",
  googleAdsEstimateConversionLabel: "2VhmCPb11dwcEK2clLhE",
};

const GA4_MEASUREMENT_ID = (
  window.BPV_GA4_MEASUREMENT_ID ||
  SITE_CONFIG.ga4MeasurementId ||
  ""
)
  .toString()
  .trim();

const GOOGLE_ADS_ID = (
  window.BPV_GOOGLE_ADS_ID ||
  SITE_CONFIG.googleAdsId ||
  ""
)
  .toString()
  .trim();

const GOOGLE_ADS_QUOTE_CONVERSION_LABEL = (
  window.BPV_GOOGLE_ADS_QUOTE_CONVERSION_LABEL ||
  SITE_CONFIG.googleAdsQuoteConversionLabel ||
  ""
)
  .toString()
  .trim();

const GOOGLE_ADS_ESTIMATE_CONVERSION_LABEL = (
  window.BPV_GOOGLE_ADS_ESTIMATE_CONVERSION_LABEL ||
  SITE_CONFIG.googleAdsEstimateConversionLabel ||
  ""
)
  .toString()
  .trim();

const GOOGLE_TAG_ID = GA4_MEASUREMENT_ID || GOOGLE_ADS_ID;
const isOwnerTestingMode = window.BPV_DISABLE_ANALYTICS === true;

function initGoogleTag() {
  if (
    isOwnerTestingMode ||
    !GOOGLE_TAG_ID ||
    typeof window.gtag !== "function"
  ) {
    return false;
  }

  if (GA4_MEASUREMENT_ID) {
    window.gtag("config", GA4_MEASUREMENT_ID, {
      anonymize_ip: true,
    });
  }

  return true;
}

const isGoogleTagEnabled = initGoogleTag();

function trackGa4Event(eventName, params = {}) {
  if (!isGoogleTagEnabled || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

function trackGoogleAdsQuoteConversion() {
  if (
    !isGoogleTagEnabled ||
    !GOOGLE_ADS_ID ||
    !GOOGLE_ADS_QUOTE_CONVERSION_LABEL ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_QUOTE_CONVERSION_LABEL}`,
    value: 1,
    currency: "USD",
  });
}

function trackGoogleAdsEstimateConversion() {
  if (
    !isGoogleTagEnabled ||
    !GOOGLE_ADS_ID ||
    !GOOGLE_ADS_ESTIMATE_CONVERSION_LABEL ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_ESTIMATE_CONVERSION_LABEL}`,
  });
}

function normalizeTripType(value) {
  const tripType = normalizeValue(value).toLowerCase();
  const tripTypeMap = {
    airport: "airport",
    sports: "sporting_event",
    "sporting-event": "sporting_event",
    wedding: "wedding",
    nightlife: "night_out",
    family: "family_outing",
    golf: "golf_outing",
    cape: "cape_cod",
    islandferry: "island_ferry",
    "island-ferry": "island_ferry",
    whitemountains: "white_mountains",
    "white-mountains": "white_mountains",
    bach: "bachelor_bachelorette",
    bachelor: "bachelor_bachelorette",
    bachelorette: "bachelor_bachelorette",
    barcrawl: "bar_crawl",
    "bar-crawl": "bar_crawl",
    local: "local_day_route",
    corporate: "corporate_outing",
    concert: "concert",
    birthday: "birthday",
    "multi-day": "multi_day",
    other: "custom_trip",
  };

  return tripTypeMap[tripType] || tripType || "unspecified";
}

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  document.addEventListener("click", (event) => {
    const clickedInside =
      mainNav.contains(event.target) || menuToggle.contains(event.target);
    if (!clickedInside) {
      mainNav.classList.remove("open");
    }
  });
}

const fleetSection = document.querySelector("#fleet");
const bookingMapSection = document.querySelector(".process");
const whyUsSection = document.querySelector("#why-us");
const coverageSection = document.querySelector("#coverage");
const faqSection = document.querySelector("#faq");
const quoteSection = document.querySelector("#quote");

if (fleetSection && whyUsSection) {
  fleetSection.after(whyUsSection);
}

if (quoteSection && bookingMapSection && coverageSection && faqSection) {
  quoteSection.after(bookingMapSection, coverageSection, faqSection);
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => io.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

const packageCards = document.querySelectorAll("[data-package-card]");

const estimateHelpPanels = document.querySelectorAll(".estimate-help");

function closeEstimateHelpPanel(panel, returnFocus = false) {
  if (!panel?.open) return;
  panel.open = false;
  if (returnFocus) {
    panel.querySelector("summary")?.focus();
  }
}

estimateHelpPanels.forEach((panel) => {
  panel.querySelector(".estimate-help-close")?.addEventListener("click", () => {
    closeEstimateHelpPanel(panel, true);
  });

  panel.addEventListener("toggle", () => {
    if (!panel.open) return;
    estimateHelpPanels.forEach((otherPanel) => {
      if (otherPanel !== panel) closeEstimateHelpPanel(otherPanel);
    });
  });
});

document.addEventListener("pointerdown", (event) => {
  estimateHelpPanels.forEach((panel) => {
    if (panel.open && !panel.contains(event.target)) {
      closeEstimateHelpPanel(panel);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openPanel = Array.from(estimateHelpPanels).find((panel) => panel.open);
  estimateHelpPanels.forEach((panel) => closeEstimateHelpPanel(panel));
  openPanel?.querySelector("summary")?.focus();
});

function setPackageCardExpanded(card, expanded) {
  const toggle = card.querySelector("[data-package-toggle]");
  const cta = card.querySelector("[data-package-cta]");
  card.classList.toggle("is-active", expanded);
  if (toggle) {
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  if (cta) {
    cta.textContent = expanded
      ? cta.dataset.expandedCta || "Click to collapse"
      : cta.dataset.collapsedCta || "Click for route details";
  }
}

if (packageCards.length) {
  const compactTripMenu = window.matchMedia("(max-width: 620px)");
  const packageCardGroups = new Map();

  packageCards.forEach((card) => {
    const group = card.closest("[data-card-group]") || document.body;
    const cardsInGroup = packageCardGroups.get(group) || [];
    cardsInGroup.push(card);
    packageCardGroups.set(group, cardsInGroup);
  });

  const togglePackageCard = (card) => {
    const isExpanded = card.classList.contains("is-active");
    const group = card.closest("[data-card-group]") || document.body;
    const cardsInGroup = packageCardGroups.get(group) || [];
    cardsInGroup.forEach((eachCard) => setPackageCardExpanded(eachCard, false));
    setPackageCardExpanded(card, !isExpanded);
  };

  packageCards.forEach((card) => {
    const toggle = card.querySelector("[data-package-toggle]");
    card.addEventListener("click", (event) => {
      if (event.target.closest(".package-guide-link")) return;
      togglePackageCard(card);
    });

    if (toggle) {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePackageCard(card);
      });
    }
  });

  const resetPackageCardsForViewport = () => {
    packageCardGroups.forEach((cardsInGroup, group) => {
      const shouldOpenFirstCard =
        !compactTripMenu.matches && group.dataset.cardGroup !== "offers";
      const firstCard = cardsInGroup[0];
      const activeCard =
        shouldOpenFirstCard && !firstCard?.hasAttribute("data-default-collapsed")
          ? firstCard
          : null;
      cardsInGroup.forEach((card) => setPackageCardExpanded(card, card === activeCard));
    });
  };

  resetPackageCardsForViewport();
  if (compactTripMenu.addEventListener) {
    compactTripMenu.addEventListener("change", resetPackageCardsForViewport);
  } else {
    compactTripMenu.addListener(resetPackageCardsForViewport);
  }
}

const estimateForm = document.getElementById("estimateForm");
const estimateResult = document.getElementById("estimateResult");

function formatUsd(value) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const SPORTS_VENUE_LABELS = {
  "td-garden": "TD Garden",
  "fenway-park": "Fenway Park",
  "gillette-stadium": "Gillette Stadium",
  "white-stadium": "White Stadium",
  other: "Other",
};

const SPORTS_SPECIAL_VENUES = new Set([
  "td-garden",
  "fenway-park",
  "white-stadium",
]);

const SPORTS_PLAN_LABELS = {
  dropoff: "$400 game-day drop-off special",
  roundTrip: "$600 game-day drop + pickup special",
  custom: "Custom sporting-event route",
};

const DURATION_TRIP_TYPES = new Set([
  "birthday",
  "nightlife",
  "bach",
  "barcrawl",
  "local",
]);

function isDurationTrip(type) {
  return DURATION_TRIP_TYPES.has(type);
}

function isSportsSpecialVenue(venue) {
  return SPORTS_SPECIAL_VENUES.has(venue);
}

function getSportsPlanOptions(venue, tripDirection = "") {
  if (isSportsSpecialVenue(venue)) {
    const options = [{ value: "", label: "Select one" }];
    if (!tripDirection || tripDirection === "oneWay") {
      options.push({ value: "dropoff", label: SPORTS_PLAN_LABELS.dropoff });
    }
    if (!tripDirection || tripDirection === "roundTrip") {
      options.push({ value: "roundTrip", label: SPORTS_PLAN_LABELS.roundTrip });
    }
    options.push({ value: "custom", label: SPORTS_PLAN_LABELS.custom });
    return options;
  }

  return [
    { value: "", label: "Select one" },
    { value: "custom", label: SPORTS_PLAN_LABELS.custom },
  ];
}

function setSelectOptions(select, options) {
  if (!select) return;
  select.replaceChildren(
    ...options.map((option) => {
      const element = document.createElement("option");
      element.value = option.value;
      element.textContent = option.label;
      return element;
    })
  );
}

function getDurationHourOptions(type) {
  const maximumHours = type === "barcrawl" ? 7 : 14;
  return [
    { value: "", label: "Select hours" },
    ...Array.from({ length: maximumHours - 2 }, (_, index) => {
      const hours = index + 3;
      return { value: String(hours), label: `${hours} hours` };
    }),
  ];
}

function formatTimeOption(value) {
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${period}`;
}

function populateTimeSelects(form) {
  if (!form) return;

  const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hour = Math.floor(index / 2);
    const minute = index % 2 === 0 ? "00" : "30";
    const value = `${String(hour).padStart(2, "0")}:${minute}`;
    return { value, label: formatTimeOption(value) };
  });

  form.querySelectorAll("[data-time-select]").forEach((select) => {
    const selectedValue = select.value;
    setSelectOptions(select, [
      { value: "", label: "Select a time" },
      ...timeOptions,
    ]);
    if (timeOptions.some((option) => option.value === selectedValue)) {
      select.value = selectedValue;
    }
  });
}

if (estimateForm && estimateResult) {
  const tripTypeInput = estimateForm.querySelector('[name="tripType"]');
  const hoursInput = estimateForm.querySelector('[name="hours"]');
  const tripDirectionInputs = estimateForm.querySelectorAll(
    '[name="tripDirection"]'
  );
  const activityLevelInput = estimateForm.querySelector(
    '[name="activityLevel"]'
  );
  const paceValue = estimateForm.querySelector("[data-pace-value]");
  const stayOnIslandInput = estimateForm.querySelector('[name="stayOnIsland"]');
  const stayOnIslandLabel = estimateForm.querySelector("[data-stay-on-island]");
  const estimateSpecial = document.getElementById("estimateSpecial");
  const estimateSpecialLabel = estimateResult.querySelector(
    "[data-estimate-special-label]"
  );
  const estimateSpecialTitle = estimateResult.querySelector(
    "[data-estimate-special-title]"
  );
  const estimateSpecialCopy = estimateResult.querySelector(
    "[data-estimate-special-copy]"
  );
  const estimateSportsPlanField = estimateForm.querySelector(
    "[data-estimate-sports-plan]"
  );
  const estimateSportsPlanInput = estimateForm.querySelector(
    '[name="sportsPlan"]'
  );
  const estimateSportsVenueField = estimateForm.querySelector(
    "[data-estimate-sports-venue]"
  );
  const estimateSportsVenueInput = estimateForm.querySelector(
    '[name="sportsVenue"]'
  );
  const estimateOtherSportsVenueField = estimateForm.querySelector(
    "[data-estimate-other-sports-venue]"
  );
  const estimateOtherSportsVenueInput = estimateForm.querySelector(
    '[name="otherSportsVenue"]'
  );
  const estimateSportsPlanHint = estimateForm.querySelector(
    "[data-estimate-sports-plan-hint]"
  );

  const paceLabels = {
    25: "Mostly idle: 25% driving",
    50: "Balanced: 50% driving",
    75: "On the move: 75% driving",
    100: "Long leg / shuttle: 100% driving",
  };

  const tripTypePaceDefaults = {
    airport: { oneWay: 100, roundTrip: 75 },
    bach: { oneWay: 75, roundTrip: 50 },
    barcrawl: { oneWay: 75, roundTrip: 50 },
    birthday: { oneWay: 75, roundTrip: 50 },
    cape: { oneWay: 100, roundTrip: 75 },
    concert: { oneWay: 75, roundTrip: 25 },
    corporate: { oneWay: 75, roundTrip: 50 },
    family: { oneWay: 75, roundTrip: 50 },
    golf: { oneWay: 75, roundTrip: 50 },
    islandferry: { oneWay: 100, roundTrip: 75 },
    local: { oneWay: 75, roundTrip: 50 },
    nightlife: { oneWay: 75, roundTrip: 50 },
    sports: { oneWay: 100, roundTrip: 25 },
    wedding: { oneWay: 75, roundTrip: 25 },
    whitemountains: { oneWay: 100, roundTrip: 75 },
    other: { oneWay: 75, roundTrip: 50 },
  };

  function getTripDirection() {
    return (
      Array.from(tripDirectionInputs).find((input) => input.checked)?.value ||
      "oneWay"
    );
  }

  function syncPaceValue() {
    if (!activityLevelInput || !paceValue) return;
    const level = Number(activityLevelInput.value);
    paceValue.textContent = paceLabels[level] || paceLabels[50];
  }

  function applyTripTypePaceDefault() {
    if (!tripTypeInput || !activityLevelInput) return;
    const tripDefaults = tripTypePaceDefaults[tripTypeInput.value];
    activityLevelInput.value = String(
      tripDefaults?.[getTripDirection()] || tripDefaults?.oneWay || 50
    );
    syncPaceValue();
  }

  function syncEstimateHoursLimit() {
    if (!hoursInput) return;

    const maximumHours = tripTypeInput?.value === "barcrawl" ? 7 : 14;
    hoursInput.max = String(maximumHours);
    if (Number(hoursInput.value) > maximumHours) {
      hoursInput.value = String(maximumHours);
    }
  }

  function applyAirportTransferDefault() {
    if (tripTypeInput?.value !== "airport" || !hoursInput) return;
    selectTripDirection("oneWay");
    hoursInput.value = "3";
  }

  function clearEstimateSpecial() {
    if (!estimateSpecial) return;
    estimateSpecial.hidden = true;
  }

  function showEstimateSpecial({ label, title, copy }) {
    if (!estimateSpecial || !estimateSpecialLabel || !estimateSpecialTitle || !estimateSpecialCopy) {
      return;
    }

    estimateSpecialLabel.textContent = label;
    estimateSpecialTitle.textContent = title;
    estimateSpecialCopy.textContent = copy;
    estimateSpecial.hidden = false;
  }

  function syncSportsPlanAvailability() {
    if (
      !tripTypeInput ||
      !estimateSportsPlanField ||
      !estimateSportsPlanInput ||
      !estimateSportsVenueField ||
      !estimateSportsVenueInput ||
      !estimateOtherSportsVenueField ||
      !estimateOtherSportsVenueInput
    ) {
      return;
    }

    const isSportsTrip = tripTypeInput.value === "sports";
    const sportsVenue = estimateSportsVenueInput.value;
    estimateSportsVenueField.hidden = !isSportsTrip;
    estimateSportsPlanField.hidden = !isSportsTrip || !sportsVenue;
    estimateOtherSportsVenueField.hidden = !isSportsTrip || sportsVenue !== "other";
    estimateSportsVenueInput.required = isSportsTrip;
    estimateSportsPlanInput.required = isSportsTrip && Boolean(sportsVenue);
    if (!isSportsTrip) {
      estimateSportsPlanInput.value = "";
      estimateSportsVenueInput.value = "";
      estimateOtherSportsVenueInput.value = "";
      estimateOtherSportsVenueInput.required = false;
      setSelectOptions(estimateSportsPlanInput, [
        { value: "", label: "Select a venue first" },
      ]);
      return;
    }

    if (sportsVenue === "other") {
      estimateOtherSportsVenueInput.required = true;
    } else {
      estimateOtherSportsVenueInput.required = false;
      estimateOtherSportsVenueInput.value = "";
    }

    if (!sportsVenue) {
      setSelectOptions(estimateSportsPlanInput, [
        { value: "", label: "Select a venue first" },
      ]);
      return;
    }

    const selectedPlan = estimateSportsPlanInput.value;
    setSelectOptions(
      estimateSportsPlanInput,
      getSportsPlanOptions(sportsVenue, getTripDirection())
    );
    if (
      [...estimateSportsPlanInput.options].some(
        (option) => option.value === selectedPlan
      )
    ) {
      estimateSportsPlanInput.value = selectedPlan;
    }
    if (estimateSportsPlanHint) {
      estimateSportsPlanHint.textContent = isSportsSpecialVenue(sportsVenue)
        ? "TD Garden, Fenway Park, and White Stadium are eligible for the game-day specials when the selected plan fits."
        : "Game-day specials are available for TD Garden, Fenway Park, and White Stadium. We will build a custom route for this venue.";
    }
  }

  function selectTripDirection(value) {
    const option = Array.from(tripDirectionInputs).find(
      (input) => input.value === value
    );
    if (option) {
      option.checked = true;
    }
  }

  function syncSportsPlanDefaults() {
    if (!estimateSportsPlanInput) return;

    if (estimateSportsPlanInput.value === "dropoff") {
      selectTripDirection("oneWay");
      const hoursInput = estimateForm.querySelector('[name="hours"]');
      if (hoursInput) hoursInput.value = "3";
      applyTripTypePaceDefault();
    }

    if (estimateSportsPlanInput.value === "roundTrip") {
      selectTripDirection("roundTrip");
      applyTripTypePaceDefault();
    }
  }

  function syncStayOnIslandAvailability() {
    if (!tripTypeInput || !stayOnIslandInput || !stayOnIslandLabel) return;

    const isIslandFerryTransfer = tripTypeInput.value === "islandferry";
    stayOnIslandInput.disabled = !isIslandFerryTransfer;
    if (!isIslandFerryTransfer) {
      stayOnIslandInput.checked = false;
    }
    stayOnIslandLabel.classList.toggle("is-disabled", !isIslandFerryTransfer);
    stayOnIslandLabel.setAttribute("aria-disabled", String(!isIslandFerryTransfer));
  }

  tripTypeInput?.addEventListener("change", () => {
    if (tripTypeInput.value === "airport") {
      applyAirportTransferDefault();
    }
    syncStayOnIslandAvailability();
    syncEstimateHoursLimit();
    syncSportsPlanAvailability();
    applyTripTypePaceDefault();
    clearEstimateSpecial();
  });
  tripDirectionInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncSportsPlanAvailability();
      applyTripTypePaceDefault();
      clearEstimateSpecial();
    });
  });
  activityLevelInput?.addEventListener("input", () => {
    syncPaceValue();
    clearEstimateSpecial();
  });
  estimateSportsPlanInput?.addEventListener("change", () => {
    syncSportsPlanDefaults();
    clearEstimateSpecial();
  });
  estimateSportsVenueInput?.addEventListener("change", () => {
    estimateSportsPlanInput.value = "";
    syncSportsPlanAvailability();
    clearEstimateSpecial();
  });
  estimateForm.addEventListener("input", clearEstimateSpecial);
  estimateForm.addEventListener("change", clearEstimateSpecial);
  syncStayOnIslandAvailability();
  syncEstimateHoursLimit();
  syncSportsPlanAvailability();
  applyAirportTransferDefault();
  applyTripTypePaceDefault();
  syncPaceValue();
  clearEstimateSpecial();

  estimateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(estimateForm);
    const tripType = data.get("tripType");
    const analyticsTripType = normalizeTripType(tripType);
    const hours = Number(data.get("hours"));
    const miles = Number(data.get("miles"));
    const tripDirection = data.get("tripDirection") || "oneWay";
    const enteredTotalMiles = tripDirection === "roundTrip" ? miles * 2 : miles;
    const estimatedMileageBand = Math.ceil(enteredTotalMiles / 5) * 5;
    const activityLevel = Number(data.get("activityLevel")) || 50;
    const isMultiDay = data.get("multiDay") === "on";
    const hasStayOnIsland = data.get("stayOnIsland") === "on";
    const hasMultiStop = data.get("multiStop") === "on";
    const sportsPlan = data.get("sportsPlan") || "";
    const sportsVenue = data.get("sportsVenue") || "";

    const price = estimateResult.querySelector(".estimate-price");
    const breakdown = estimateResult.querySelector("#estimateBreakdown");
    const note = estimateResult.querySelector(".estimate-note");
    const guestCap = estimateResult.querySelector("[data-estimate-guest-cap]");
    const quoteLink = estimateResult.querySelector(".estimate-quote-link");
    const needsCustomQuote =
      isMultiDay || (tripType === "islandferry" && hasStayOnIsland);

    if (needsCustomQuote && price && breakdown && note && quoteLink) {
      clearEstimateSpecial();
      price.textContent = "Custom quote";
      breakdown.textContent = "This service deserves a tailored route and availability review.";
      note.textContent = isMultiDay
        ? "Tell us your travel dates, overnight location, stops, and the times you would like the van available."
        : "Tell us your ferry schedule, on-island plans, accommodations, and return timing for a tailored service plan.";
      if (guestCap) guestCap.hidden = true;
      quoteLink.dataset.quoteService = isMultiDay ? "multi_day" : "stay_on_island";
      if (hasStayOnIsland) {
        quoteLink.dataset.quoteEventType = "islandferry";
      } else {
        delete quoteLink.dataset.quoteEventType;
      }
      quoteLink.hidden = false;
      trackGa4Event("estimate_calculated", {
        trip_type: analyticsTripType,
        hours,
        miles,
        estimated_mileage_band: estimatedMileageBand,
        multi_stop: hasMultiStop ? "true" : "false",
        trip_direction: tripDirection,
        activity_level: activityLevel,
        sports_plan: sportsPlan || "n/a",
        sports_venue: sportsVenue || "n/a",
        multi_day: isMultiDay ? "true" : "false",
        stay_on_island: hasStayOnIsland ? "true" : "false",
        estimate_outcome: "custom_quote",
        page_path: window.location.pathname,
      });
      trackGoogleAdsEstimateConversion();
      return;
    }

    const activityHourlyRates = {
      25: 110,
      50: 125,
      75: 150,
      100: 175,
    };
    const hourlyRate = activityHourlyRates[activityLevel] || 125;
    const includedMiles = 40;
    const additionalMileRate = 2.25;
    const reservedHours = Math.max(hours, 3);
    const totalMiles = estimatedMileageBand;
    const additionalMiles = Math.max(totalMiles - includedMiles, 0);
    const hourlyCost = reservedHours * hourlyRate;
    const mileageCost = additionalMiles * additionalMileRate;
    const multiStopAllowance = hasMultiStop ? 35 : 0;
    const subtotal = Math.max(375, hourlyCost + mileageCost + multiStopAllowance);
    const low = subtotal * 0.94;
    const high = subtotal * 1.04;
    const qualifiesForSportsDropoff =
      tripType === "sports" &&
      isSportsSpecialVenue(sportsVenue) &&
      sportsPlan === "dropoff" &&
      tripDirection === "oneWay" &&
      reservedHours === 3;
    const qualifiesForSportsRoundTrip =
      tripType === "sports" &&
      isSportsSpecialVenue(sportsVenue) &&
      sportsPlan === "roundTrip" &&
      tripDirection === "roundTrip";
    const qualifiesForAirportTransfer =
      tripType === "airport" &&
      tripDirection === "oneWay" &&
      reservedHours === 3 &&
      miles <= 50 &&
      !hasMultiStop;

    if (price && breakdown && note && quoteLink) {
      if (guestCap) guestCap.hidden = false;
      if (qualifiesForSportsDropoff) {
        price.textContent = "$400 flat";
        breakdown.textContent =
          "Three hours for up to 14 guests: one local pickup, one predetermined bar stop, and a timed Boston sporting-event drop-off.";
        note.textContent =
          "Available for pickups within 40 miles of Boston. Final route and availability are confirmed before booking.";
      } else if (qualifiesForSportsRoundTrip) {
        price.textContent = "$600 flat";
        breakdown.textContent =
          "For up to 14 guests: one group pickup, Boston sporting-event drop-off, and a coordinated post-event return.";
        note.textContent =
          "This special is built for a fixed event route. Final timing and availability are confirmed before booking.";
      } else if (qualifiesForAirportTransfer) {
        price.textContent = "$300 flat";
        breakdown.textContent =
          "Three hours for one direct, no-stop transfer between Logan Airport and one destination, for up to 14 guests.";
        note.textContent =
          "Available within 50 estimated miles of Logan. Add time or stops to see a standard planning range.";
      } else {
        price.textContent = `${formatUsd(low)} - ${formatUsd(high)}`;
        breakdown.textContent =
          activityLevel <= 25
            ? "Your planning range reflects a route with substantial standby time between driving."
            : activityLevel <= 50
              ? "Your planning range reflects a balanced mix of driving and standby time."
              : "Your planning range reflects a more active, shuttle-style ride.";
        note.textContent =
          tripType === "sports" && sportsPlan === "dropoff"
            ? "The $400 special applies to a three-hour, one-way local game-day drop-off. This range reflects the route details entered."
            : "This is a planning estimate for a single-day route. Final pricing is confirmed after your exact itinerary and availability are reviewed.";
      }
      delete quoteLink.dataset.quoteService;
      delete quoteLink.dataset.quoteEventType;
      quoteLink.hidden = true;
    }

    if (qualifiesForSportsDropoff) {
      showEstimateSpecial({
        label: "Eligible special",
        title: "Your game-day drop-off plan qualifies.",
        copy: "Your estimate includes the $400 flat special. We will confirm the local pickup, bar stop, and venue timing with you before booking.",
      });
    } else if (qualifiesForSportsRoundTrip) {
      showEstimateSpecial({
        label: "Eligible special",
        title: "Your game-day plan qualifies.",
        copy: "Your estimate includes the $600 flat drop + pickup special. We will confirm the fixed event route and timing with you before booking.",
      });
    } else if (qualifiesForAirportTransfer) {
      showEstimateSpecial({
        label: "Eligible special",
        title: "Your Logan airport transfer qualifies.",
        copy: "Your estimate includes the $300 flat three-hour, one-way airport transfer with no stops between Logan and one destination. We will confirm flight timing and availability before booking.",
      });
    } else if (tripType === "wedding" && reservedHours >= 5) {
      showEstimateSpecial({
        label: "Eligible special",
        title: "Congratulations, your wedding plan qualifies.",
        copy: "Book 5+ hours and get an extra hour free. We will include it in your personalized quote.",
      });
    } else {
      clearEstimateSpecial();
    }

    trackGa4Event("estimate_calculated", {
      trip_type: analyticsTripType,
      hours,
      miles,
      estimated_mileage_band: estimatedMileageBand,
      multi_stop: hasMultiStop ? "true" : "false",
      trip_direction: tripDirection,
      activity_level: activityLevel,
      sports_plan: sportsPlan || "n/a",
      sports_venue: sportsVenue || "n/a",
      multi_day: isMultiDay ? "true" : "false",
      stay_on_island: hasStayOnIsland ? "true" : "false",
      estimate_outcome: qualifiesForSportsDropoff
        ? "sports_dropoff_special"
        : qualifiesForSportsRoundTrip
          ? "sports_roundtrip_special"
          : qualifiesForAirportTransfer
            ? "airport_transfer_special"
          : "planning_range",
      estimated_low: qualifiesForSportsDropoff
        ? 400
        : qualifiesForSportsRoundTrip
          ? 600
          : qualifiesForAirportTransfer
            ? 300
          : Math.round(low),
      estimated_high: qualifiesForSportsDropoff
        ? 400
        : qualifiesForSportsRoundTrip
          ? 600
          : qualifiesForAirportTransfer
            ? 300
          : Math.round(high),
      page_path: window.location.pathname,
    });
    trackGoogleAdsEstimateConversion();
  });
}

const quoteForm = document.getElementById("quoteForm");
const quoteSuccess = document.getElementById("quoteSuccess");
const INTAKE_ENDPOINT =
  "https://formsubmit.co/ajax/902c76a22ec98900ac487ed64bc69c35";
const QUOTE_RECEIPT_ENDPOINT = "/api/quote-receipt";
const ATTRIBUTION_STORAGE_KEY = "bpv_attribution_v1";
const TRACKED_ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
];

function toTitleCase(value) {
  if (!value || typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function setupContactClickTracking() {
  const links = document.querySelectorAll("a[href]");
  links.forEach((link) => {
    const href = (link.getAttribute("href") || "").trim().toLowerCase();
    if (!href.includes("#quote")) return;

    link.addEventListener("click", () => {
      const label = normalizeValue(link.textContent).replace(/\s+/g, " ");
      trackGa4Event("contact_click", {
        contact_type: "quote",
        link_url: href,
        link_label: label || "n/a",
        page_path: window.location.pathname,
      });
    });
  });
}

setupContactClickTracking();

function readAttributionStorage() {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writeAttributionStorage(data) {
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Non-blocking: if storage fails, we still submit lead data.
  }
}

function buildLeadSourceSummary(attribution) {
  const source = normalizeValue(attribution.utm_source) || "direct";
  const medium = normalizeValue(attribution.utm_medium) || "none";
  const campaign = normalizeValue(attribution.utm_campaign);
  return campaign ? `${source} / ${medium} | ${campaign}` : `${source} / ${medium}`;
}

function buildAttributionSnapshot() {
  const now = new Date().toISOString();
  const params = new URLSearchParams(window.location.search);
  const stored = readAttributionStorage();
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const snapshot = { ...stored };

  if (!normalizeValue(snapshot.first_landing_page)) {
    snapshot.first_landing_page = currentPath;
    snapshot.first_seen_at = now;
    snapshot.first_referrer = document.referrer || "";
  }

  let foundAttributionParam = false;
  TRACKED_ATTRIBUTION_KEYS.forEach((key) => {
    const value = normalizeValue(params.get(key));
    if (value) {
      snapshot[key] = value;
      foundAttributionParam = true;
    }
  });

  if (foundAttributionParam || !normalizeValue(snapshot.last_touch_at)) {
    snapshot.last_touch_at = now;
  }

  const hasGoogleAdsClickId = Boolean(snapshot.gclid || snapshot.gbraid || snapshot.wbraid);
  if (!normalizeValue(snapshot.utm_source)) {
    snapshot.utm_source = hasGoogleAdsClickId
      ? "google"
      : document.referrer
        ? "referral"
        : "direct";
  }
  if (!normalizeValue(snapshot.utm_medium)) {
    snapshot.utm_medium = hasGoogleAdsClickId
      ? "cpc"
      : document.referrer
        ? "referral"
        : "none";
  }
  if (!normalizeValue(snapshot.utm_campaign)) {
    snapshot.utm_campaign = hasGoogleAdsClickId ? "google-ads" : "organic-or-direct";
  }

  snapshot.last_referrer = document.referrer || normalizeValue(snapshot.first_referrer);
  snapshot.last_submit_page = currentPath;
  snapshot.lead_source_summary = buildLeadSourceSummary(snapshot);

  writeAttributionStorage(snapshot);
  return snapshot;
}

function populateAttributionFields(form, attribution) {
  if (!form) return;
  const fieldMap = {
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_term: attribution.utm_term,
    utm_content: attribution.utm_content,
    gclid: attribution.gclid,
    gbraid: attribution.gbraid,
    wbraid: attribution.wbraid,
    lead_landing_page: attribution.first_landing_page,
    lead_referrer: attribution.last_referrer || attribution.first_referrer,
    lead_submit_page: attribution.last_submit_page,
    lead_first_seen_at: attribution.first_seen_at,
    lead_last_touch_at: attribution.last_touch_at,
    lead_source_summary: attribution.lead_source_summary,
  };

  Object.entries(fieldMap).forEach(([name, value]) => {
    const input = form.querySelector(`input[name="${name}"]`);
    if (input) {
      input.value = normalizeValue(value);
    }
  });
}

function buildIntakePayload(data) {
  const name = data.get("name") || "New Lead";
  const eventType = data.get("eventType") || "";
  const eventTypeLabels = {
    airport: "Airport Transfer",
    sports: "Sporting Event / Game Day",
    wedding: "Wedding",
    birthday: "Birthday Celebration",
    nightlife: "Night Out",
    family: "Family Outing / Field Trip",
    golf: "Golf Outing",
    cape: "Cape Cod Trip",
    islandferry: "Island Ferry Transfer",
    whitemountains: "White Mountains / Northern NH",
    bach: "Bachelor/Bachelorette",
    barcrawl: "Boston Bar Crawl",
    local: "Local Day Route",
    concert: "Concert Night",
    corporate: "Corporate Outing",
    other: "Custom Trip",
  };
  const directionLabels = {
    oneWay: "One way",
    roundTrip: "Round trip",
  };
  const addIfPresent = (payload, label, value) => {
    const normalizedValue = (value || "").toString().trim();
    if (normalizedValue) payload[label] = normalizedValue;
  };
  const formatDateForEmail = (value) => {
    const dateParts = (value || "").toString().split("-").map(Number);
    if (dateParts.length !== 3 || dateParts.some((part) => !Number.isFinite(part))) {
      return value || "";
    }

    const [year, month, day] = dateParts;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  };
  const formatTimeForEmail = (value) => {
    const timeParts = (value || "").toString().split(":").map(Number);
    if (timeParts.length < 2 || timeParts.some((part) => !Number.isFinite(part))) {
      return value || "";
    }

    const [hours, minutes] = timeParts;
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };
  const eventTypeLabel = eventTypeLabels[eventType] || toTitleCase(eventType);
  const source = normalizeValue(data.get("utm_source")).toLowerCase();
  const medium = normalizeValue(data.get("utm_medium")).toLowerCase();
  const campaign = normalizeValue(data.get("utm_campaign"));
  const leadSource =
    source === "google" && medium === "cpc"
      ? campaign
        ? `Google Ads (${campaign})`
        : "Google Ads"
      : data.get("lead_source_summary") || "Direct website visit";
  const usesDuration = isDurationTrip(eventType);
  const payload = {
    Name: data.get("name") || "",
    Email: data.get("email") || "",
    Phone: data.get("phone") || "",
    "Preferred contact method": toTitleCase(data.get("contactPreference") || ""),
    "Best time to reach them": toTitleCase(data.get("contactTime") || ""),
    "Trip type": eventTypeLabel,
    "Guest count": data.get("guestCount") || "",
    "Event date": formatDateForEmail(data.get("pickupDate")),
    "Pickup time": formatTimeForEmail(data.get("pickupTime")),
    "Pickup location": data.get("pickup") || "",
  };

  if (usesDuration) {
    addIfPresent(
      payload,
      "Duration",
      data.get("durationHours") && `${data.get("durationHours")} hours`
    );
  } else {
    const isRoundTrip = data.get("tripDirection") === "roundTrip";
    addIfPresent(
      payload,
      "Direction",
      directionLabels[data.get("tripDirection")] || ""
    );
    addIfPresent(
      payload,
      isRoundTrip ? "Event drop-off time" : "Destination drop-off time",
      formatTimeForEmail(data.get("destinationDropoffTime"))
    );
    addIfPresent(
      payload,
      isRoundTrip ? "Event location" : "Destination location",
      data.get("dropoff")
    );
  }

  if (!usesDuration && data.get("tripDirection") === "roundTrip") {
    addIfPresent(
      payload,
      "Return pickup time",
      formatTimeForEmail(data.get("destinationPickupTime"))
    );
    addIfPresent(
      payload,
      "Final drop-off location",
      data.get("finalLocationSameAsPickup") === "on"
        ? "Same as pickup location"
        : data.get("finalDropoff")
    );
  }

  addIfPresent(payload, "Trip menu selection", data.get("tripPackage"));
  const customServiceLabels = {
    multi_day: "Multi-day or overnight service",
    on_demand: "On-demand or on-call service",
    stay_on_island: "Stay-on-island service",
    multi_stop: "Multi-stop itinerary",
  };
  const customServices = data
    .getAll("customServices")
    .map((service) => customServiceLabels[service] || service)
    .filter(Boolean);
  addIfPresent(payload, "Custom service requests", customServices.join(", "));
  addIfPresent(payload, "Service end date", formatDateForEmail(data.get("serviceEndDate")));
  addIfPresent(payload, "Island", data.get("islandDestination"));
  addIfPresent(payload, "On-call availability window", data.get("onDemandWindow"));
  if (eventType === "sports") {
    addIfPresent(
      payload,
      "Game-day plan",
      SPORTS_PLAN_LABELS[data.get("sportsPlan")] || data.get("sportsPlan")
    );
    addIfPresent(
      payload,
      "Sports venue",
      SPORTS_VENUE_LABELS[data.get("sportsVenue")] || data.get("sportsVenue")
    );
    if (data.get("sportsVenue") === "other") {
      addIfPresent(payload, "Other venue", data.get("otherSportsVenue"));
    }
  }
  addIfPresent(payload, "Route and service details", data.get("notes"));
  addIfPresent(payload, "Lead source", leadSource);
  addIfPresent(
    payload,
    "Google Ads click ID",
    data.get("gclid") || data.get("gbraid") || data.get("wbraid")
  );

  return {
    ...payload,
    _subject: `New Quote Request - ${name} - ${eventTypeLabel}`,
    _template: "table",
    _captcha: "false",
    _replyto: data.get("email") || "",
  };
}

function buildQuoteReceiptData(data) {
  const eventType = normalizeValue(data.get("eventType"));
  const eventTypeLabels = {
    airport: "Airport Transfer",
    sports: "Sporting Event / Game Day",
    wedding: "Wedding",
    birthday: "Birthday Celebration",
    nightlife: "Night Out",
    family: "Family Outing / Field Trip",
    golf: "Golf Outing",
    cape: "Cape Cod Trip",
    islandferry: "Island Ferry Transfer",
    whitemountains: "White Mountains / Northern NH",
    bach: "Bachelor/Bachelorette",
    barcrawl: "Boston Bar Crawl",
    local: "Local Day Route",
    concert: "Concert Night",
    corporate: "Corporate Outing",
    other: "Custom Trip",
  };

  return {
    name: normalizeValue(data.get("name")),
    email: normalizeValue(data.get("email")),
    eventType,
    eventTypeLabel: eventTypeLabels[eventType] || "Custom Trip",
    contactPreference: normalizeValue(data.get("contactPreference")),
  };
}

async function sendQuoteReceipt(receipt) {
  if (window.location.protocol === "file:") return;

  const response = await fetch(QUOTE_RECEIPT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(receipt),
  });

  if (!response.ok) {
    throw new Error("Quote confirmation could not be sent.");
  }
}

function buildLeadEventParams(data) {
  const passengerCount = Number(data.get("guestCount"));
  const eventType = data.get("eventType");
  const isDurationQuote = isDurationTrip(eventType);
  const eventParams = {
    form_name: "quote_form",
    lead_type: "quote_request",
    contact_preference: normalizeValue(data.get("contactPreference")),
    trip_type: normalizeTripType(eventType),
    trip_direction: isDurationQuote
      ? "duration"
      : data.get("tripDirection") || "unspecified",
    page_path: window.location.pathname,
  };

  if (Number.isFinite(passengerCount) && passengerCount > 0) {
    eventParams.passenger_count = passengerCount;
  }

  const durationHours = Number(data.get("durationHours"));
  if (isDurationQuote && Number.isFinite(durationHours) && durationHours > 0) {
    eventParams.duration_hours = durationHours;
  }

  const sportsPlan = normalizeValue(data.get("sportsPlan"));
  if (sportsPlan) {
    eventParams.sports_plan = sportsPlan;
  }

  const tripPackage = normalizeValue(data.get("tripPackage"));
  if (tripPackage) {
    eventParams.trip_package = tripPackage;
  }

  const sportsVenue = normalizeValue(data.get("sportsVenue"));
  if (sportsVenue) {
    eventParams.sports_venue = sportsVenue;
  }

  const customServices = data.getAll("customServices").filter(Boolean);
  if (customServices.length) {
    eventParams.custom_services = customServices.join("|");
  }

  return eventParams;
}

if (quoteForm && quoteSuccess) {
  const pickupDateInput = quoteForm.querySelector('[name="pickupDate"]');
  const pickupTimeInput = quoteForm.querySelector('[name="pickupTime"]');
  const routeNotesInput = quoteForm.querySelector('[name="notes"]');
  const customServiceInputs = quoteForm.querySelectorAll('[name="customServices"]');
  const customServiceOptions = quoteForm.querySelector("[data-custom-service-options]");
  const customServiceFields = quoteForm.querySelectorAll("[data-custom-service-field]");
  const serviceEndDateInput = quoteForm.querySelector('[name="serviceEndDate"]');
  const customServiceNotesHint = quoteForm.querySelector(
    "[data-custom-service-notes-hint]"
  );
  const destinationDropoffTimeInput = quoteForm.querySelector(
    '[name="destinationDropoffTime"]'
  );
  const destinationPickupTimeInput = quoteForm.querySelector(
    '[name="destinationPickupTime"]'
  );
  const quoteRoundTripTimeFields = quoteForm.querySelectorAll(
    "[data-quote-roundtrip-time]"
  );
  const destinationLocationLabel = quoteForm.querySelector(
    "[data-destination-location-label]"
  );
  const dropoffTimeLabel = quoteForm.querySelector("[data-dropoff-time-label]");
  const quoteFinalLocationField = quoteForm.querySelector(
    "[data-quote-final-location]"
  );
  const quoteFinalLocationInput = quoteForm.querySelector(
    '[name="finalLocationSameAsPickup"]'
  );
  const quoteFinalDropoffField = quoteForm.querySelector(
    "[data-quote-final-location-field]"
  );
  const finalDropoffInput = quoteForm.querySelector('[name="finalDropoff"]');
  const quoteDirectionField = quoteForm.querySelector(
    "[data-quote-direction-field]"
  );
  const quoteScheduledFields = quoteForm.querySelectorAll(
    "[data-quote-scheduled-field]"
  );
  const quoteDurationField = quoteForm.querySelector(
    "[data-quote-duration-field]"
  );
  const durationHoursInput = quoteForm.querySelector('[name="durationHours"]');
  const pickupLocationInput = quoteForm.querySelector('[name="pickup"]');
  const quoteDestinationLocationField = quoteForm.querySelector(
    "[data-quote-destination-location-field]"
  );
  const quoteDirectionInputs = quoteForm.querySelectorAll('[name="tripDirection"]');
  const contactPreferenceInput = quoteForm.querySelector(
    'select[name="contactPreference"]'
  );
  const phoneInput = quoteForm.querySelector('input[name="phone"]');
  const phoneHint = quoteForm.querySelector("[data-phone-hint]");
  const eventTypeInput = quoteForm.querySelector('select[name="eventType"]');
  const quoteSportsPlanField = quoteForm.querySelector(
    "[data-quote-sports-plan]"
  );
  const quoteSportsPlanInput = quoteForm.querySelector('[name="sportsPlan"]');
  const quoteSportsVenueField = quoteForm.querySelector(
    "[data-quote-sports-venue]"
  );
  const quoteSportsVenueInput = quoteForm.querySelector('[name="sportsVenue"]');
  const quoteOtherVenueField = quoteForm.querySelector(
    "[data-quote-other-venue]"
  );
  const quoteOtherVenueInput = quoteForm.querySelector(
    '[name="otherSportsVenue"]'
  );
  const quoteSportsPlanHint = quoteForm.querySelector(
    "[data-quote-sports-plan-hint]"
  );
  const quoteTripPackageInput = quoteForm.querySelector('[name="tripPackage"]');
  const quoteTripSelection = quoteForm.querySelector("[data-quote-trip-selection]");
  const quoteTripName = quoteForm.querySelector("[data-quote-trip-name]");
  let isApplyingQuoteTripPrefill = false;
  let previousEventType = eventTypeInput?.value || "";
  let hasTrackedQuoteFormStart = false;
  const quoteTripPrefills = {
    "early-booking": { packageName: "Early booking offer" },
    "airport-transfer": {
      packageName: "$300 Logan Airport Transfer",
      eventType: "airport",
      tripDirection: "oneWay",
    },
    "sports-dropoff": {
      packageName: "$400 Game-Day Drop-Off",
      eventType: "sports",
      tripDirection: "oneWay",
    },
    "sports-roundtrip": {
      packageName: "$600 Game-Day Drop + Pickup",
      eventType: "sports",
      tripDirection: "roundTrip",
    },
    sports: {
      packageName: "Game Night Express",
      eventType: "sports",
    },
    family: { packageName: "Family Day Out", eventType: "family" },
    golf: { packageName: "Tee Time Takeoff", eventType: "golf" },
    cape: { packageName: "Cape Escape Route", eventType: "cape" },
    "island-ferry": {
      packageName: "Martha's Vineyard + Nantucket",
      eventType: "islandferry",
    },
    "white-mountains": {
      packageName: "Mountain Weekend Run",
      eventType: "whitemountains",
    },
    wedding: {
      packageName: "Ceremony + Reception Shuttle",
      eventType: "wedding",
    },
    "wedding-offer": {
      packageName: "Wedding 5+ Hour Special",
      eventType: "wedding",
    },
    corporate: { packageName: "Team Offsite Transit", eventType: "corporate" },
    bach: { packageName: "Weekend Party Circuit", eventType: "bach" },
    "bar-crawl": { packageName: "Boston Bar Crawl", eventType: "barcrawl" },
    concert: { packageName: "Showtime Shuttle", eventType: "concert" },
    local: { packageName: "Boston Night Loop", eventType: "local" },
  };
  const setQuoteMessage = (message, stateClass = "") => {
    quoteSuccess.classList.remove("error", "success", "sending");
    if (stateClass) {
      quoteSuccess.classList.add(stateClass);
    }
    quoteSuccess.textContent = message;
  };

  function trackQuoteFormStart(source) {
    const eventType = eventTypeInput?.value || "";
    if (hasTrackedQuoteFormStart || !eventType) return;

    hasTrackedQuoteFormStart = true;
    trackGa4Event("quote_form_started", {
      form_name: "quote_form",
      trip_type: normalizeTripType(eventType),
      quote_start_source: source,
      page_path: window.location.pathname,
    });
  }

  const initialAttribution = buildAttributionSnapshot();
  populateAttributionFields(quoteForm, initialAttribution);

  function syncPhoneRequirement() {
    if (!contactPreferenceInput || !phoneInput) return;
    const requiresPhone = contactPreferenceInput.value === "text";
    phoneInput.required = requiresPhone;
    phoneInput.setAttribute("aria-required", requiresPhone ? "true" : "false");
    if (phoneHint) {
      phoneHint.textContent = requiresPhone
        ? " (required for text)"
        : " (optional)";
    }
    phoneInput.setCustomValidity("");
  }

  function syncCustomServiceDetails() {
    const selectedCustomServices = Array.from(customServiceInputs)
      .filter((input) => input.checked)
      .map((input) => input.value);
    const hasCustomService = selectedCustomServices.length > 0;
    if (customServiceOptions) {
      customServiceOptions.open = hasCustomService;
    }
    customServiceFields.forEach((field) => {
      const service = field.dataset.customServiceField;
      const input = field.querySelector("input, select");
      const isRelevant = selectedCustomServices.includes(service);
      field.hidden = !isRelevant;
      if (input) {
        input.required = isRelevant;
        input.disabled = !isRelevant;
      }
    });
    if (serviceEndDateInput) {
      serviceEndDateInput.min = pickupDateInput?.value || "";
    }
    const hasDetailedRouteService = selectedCustomServices.some(
      (service) => ["multi_day", "on_demand", "stay_on_island", "multi_stop"].includes(service)
    );
    if (routeNotesInput) {
      routeNotesInput.required = hasDetailedRouteService;
      routeNotesInput.setAttribute("aria-required", hasDetailedRouteService ? "true" : "false");
      routeNotesInput.placeholder = hasDetailedRouteService
        ? "Include dates, route stops, service windows, overnight or ferry details, and when you would like the van on call..."
        : "Include your stop list, timing, special requests, ferry or overnight details, and any times you would like the van on call...";
    }
    if (customServiceNotesHint) {
      customServiceNotesHint.hidden = !hasCustomService;
    }
  }

  function syncQuoteSportsPlanAvailability() {
    if (
      !eventTypeInput ||
      !quoteSportsPlanField ||
      !quoteSportsPlanInput ||
      !quoteSportsVenueField ||
      !quoteSportsVenueInput ||
      !quoteOtherVenueField ||
      !quoteOtherVenueInput
    ) {
      return;
    }

    const isSportsTrip = eventTypeInput.value === "sports";
    const sportsVenue = quoteSportsVenueInput.value;
    const tripDirection = Array.from(quoteDirectionInputs).find(
      (input) => input.checked
    )?.value;
    quoteSportsVenueField.hidden = !isSportsTrip;
    quoteSportsVenueInput.required = isSportsTrip;
    quoteSportsPlanField.hidden = !isSportsTrip || !sportsVenue || !tripDirection;
    quoteSportsPlanInput.required =
      isSportsTrip && Boolean(sportsVenue) && Boolean(tripDirection);
    if (!isSportsTrip) {
      quoteSportsPlanInput.value = "";
      quoteSportsVenueInput.value = "";
      quoteOtherVenueField.hidden = true;
      quoteOtherVenueInput.required = false;
      quoteOtherVenueInput.value = "";
      setSelectOptions(quoteSportsPlanInput, [
        { value: "", label: "Select a venue first" },
      ]);
      if (quoteSportsPlanHint) quoteSportsPlanHint.textContent = "";
      return;
    }

    syncQuoteOtherVenueAvailability();
    if (!sportsVenue || !tripDirection) {
      quoteSportsPlanInput.value = "";
      setSelectOptions(quoteSportsPlanInput, [
        {
          value: "",
          label: sportsVenue ? "Select trip direction first" : "Select a venue first",
        },
      ]);
      if (quoteSportsPlanHint) quoteSportsPlanHint.textContent = "";
      return;
    }

    const selectedPlan = quoteSportsPlanInput.value;
    setSelectOptions(
      quoteSportsPlanInput,
      getSportsPlanOptions(sportsVenue, tripDirection)
    );
    if (
      [...quoteSportsPlanInput.options].some(
        (option) => option.value === selectedPlan
      )
    ) {
      quoteSportsPlanInput.value = selectedPlan;
    }
    if (quoteSportsPlanHint) {
      quoteSportsPlanHint.textContent = isSportsSpecialVenue(sportsVenue)
        ? "TD Garden, Fenway Park, and White Stadium are eligible for the game-day specials when the selected plan fits."
        : "Game-day specials are available for TD Garden, Fenway Park, and White Stadium. We will build a custom route for this venue.";
    }
  }

  function syncQuoteOtherVenueAvailability() {
    if (!quoteSportsVenueInput || !quoteOtherVenueField || !quoteOtherVenueInput) {
      return;
    }

    const isOtherVenue =
      eventTypeInput?.value === "sports" && quoteSportsVenueInput.value === "other";
    quoteOtherVenueField.hidden = !isOtherVenue;
    quoteOtherVenueInput.required = isOtherVenue;
    if (!isOtherVenue) {
      quoteOtherVenueInput.value = "";
    }
  }

  function syncQuoteDateLimits() {
    const today = new Date().toISOString().split("T")[0];
    if (pickupDateInput) {
      pickupDateInput.min = today;
    }
  }

  function syncQuoteTimingValidity() {
    if (!pickupTimeInput || !destinationDropoffTimeInput) {
      return;
    }

    destinationDropoffTimeInput.setCustomValidity("");
    destinationPickupTimeInput?.setCustomValidity("");
    if (isDurationTrip(eventTypeInput?.value || "")) {
      return;
    }
    if (
      pickupTimeInput.value &&
      destinationDropoffTimeInput.value &&
      destinationDropoffTimeInput.value <= pickupTimeInput.value
    ) {
      destinationDropoffTimeInput.setCustomValidity(
        "Destination drop-off time must be after pickup time."
      );
      return;
    }

    const isRoundTrip =
      Array.from(quoteDirectionInputs).find((input) => input.checked)?.value ===
      "roundTrip";
    if (!isRoundTrip || !destinationPickupTimeInput) {
      return;
    }

    if (
      destinationDropoffTimeInput.value &&
      destinationPickupTimeInput.value &&
      destinationPickupTimeInput.value <= destinationDropoffTimeInput.value
    ) {
      destinationPickupTimeInput.setCustomValidity(
        "Destination pickup time must be after the destination drop-off time."
      );
      return;
    }

  }

  function syncQuoteDirectionFields() {
    const isRoundTrip =
      Array.from(quoteDirectionInputs).find((input) => input.checked)?.value ===
      "roundTrip";
    const usesDuration = isDurationTrip(eventTypeInput?.value || "");
    quoteDirectionInputs.forEach((input) => {
      input.required = !usesDuration && input.value === "oneWay";
    });
    quoteRoundTripTimeFields.forEach((field) => {
      field.hidden = usesDuration || !isRoundTrip;
    });
    if (destinationLocationLabel) {
      destinationLocationLabel.textContent = isRoundTrip
        ? "Event location"
        : "Destination location";
    }
    if (dropoffTimeLabel) {
      dropoffTimeLabel.textContent = isRoundTrip
        ? "Event drop-off time"
        : "Destination drop-off time";
    }
    if (quoteFinalLocationField) {
      quoteFinalLocationField.hidden = usesDuration || !isRoundTrip;
    }
    syncFinalDropoffLocation();
    if (destinationPickupTimeInput) {
      destinationPickupTimeInput.required = !usesDuration && isRoundTrip;
    }
    syncQuoteSportsPlanAvailability();
    syncQuoteTimingValidity();
  }

  function syncQuoteTripFields() {
    const usesDuration = isDurationTrip(eventTypeInput?.value || "");
    const isRoundTrip =
      Array.from(quoteDirectionInputs).find((input) => input.checked)?.value ===
      "roundTrip";

    if (quoteDirectionField) quoteDirectionField.hidden = usesDuration;
    quoteScheduledFields.forEach((field) => {
      field.hidden = usesDuration;
    });
    if (destinationDropoffTimeInput) {
      destinationDropoffTimeInput.required = !usesDuration;
    }
    if (quoteDurationField) quoteDurationField.hidden = !usesDuration;
    if (durationHoursInput) {
      const selectedDuration = durationHoursInput.value;
      setSelectOptions(
        durationHoursInput,
        getDurationHourOptions(eventTypeInput?.value || "")
      );
      if (
        Array.from(durationHoursInput.options).some(
          (option) => option.value === selectedDuration
        )
      ) {
        durationHoursInput.value = selectedDuration;
      }
      durationHoursInput.required = usesDuration;
    }
    if (quoteDestinationLocationField) {
      quoteDestinationLocationField.hidden = usesDuration;
    }
    const dropoffInput = quoteForm.querySelector('[name="dropoff"]');
    if (dropoffInput) dropoffInput.required = !usesDuration;

    quoteRoundTripTimeFields.forEach((field) => {
      field.hidden = usesDuration || !isRoundTrip;
    });
    if (quoteFinalLocationField) {
      quoteFinalLocationField.hidden = usesDuration || !isRoundTrip;
    }
    if (quoteFinalDropoffField) {
      quoteFinalDropoffField.hidden = usesDuration || !isRoundTrip;
    }
    if (usesDuration) {
      if (destinationPickupTimeInput) destinationPickupTimeInput.required = false;
      if (finalDropoffInput) finalDropoffInput.required = false;
    } else {
      syncQuoteDirectionFields();
    }
  }

  function syncFinalDropoffLocation() {
    const isRoundTrip =
      Array.from(quoteDirectionInputs).find((input) => input.checked)?.value ===
      "roundTrip";
    const usesDuration = isDurationTrip(eventTypeInput?.value || "");
    const needsFinalLocation =
      !usesDuration &&
      isRoundTrip &&
      quoteFinalLocationInput &&
      !quoteFinalLocationInput.checked;
    if (quoteFinalDropoffField) {
      quoteFinalDropoffField.hidden = usesDuration || !isRoundTrip;
    }
    if (finalDropoffInput) {
      finalDropoffInput.required = Boolean(needsFinalLocation);
      finalDropoffInput.disabled = !needsFinalLocation;
      finalDropoffInput.placeholder = needsFinalLocation
        ? "Enter a different final location"
        : "Same as pickup location";
    }
  }

  function clearQuoteTripPrefill() {
    if (quoteTripPackageInput) quoteTripPackageInput.value = "";
    if (quoteTripSelection) quoteTripSelection.hidden = true;
    if (quoteTripName) quoteTripName.textContent = "";
  }

  function applyQuoteTripPrefill(tripKey) {
    const trip = quoteTripPrefills[tripKey];
    if (!trip) return;

    isApplyingQuoteTripPrefill = true;
    if (eventTypeInput && trip.eventType) {
      eventTypeInput.value = trip.eventType;
      previousEventType = trip.eventType;
    }
    syncQuoteTripFields();
    syncQuoteSportsPlanAvailability();
    if (trip.tripDirection) {
      const directionInput = Array.from(quoteDirectionInputs).find(
        (input) => input.value === trip.tripDirection
      );
      if (directionInput) directionInput.checked = true;
    }
    syncQuoteDirectionFields();
    if (quoteTripPackageInput) quoteTripPackageInput.value = trip.packageName;
    if (quoteTripName) quoteTripName.textContent = trip.packageName;
    if (quoteTripSelection) quoteTripSelection.hidden = false;
    trackQuoteFormStart("trip_menu");
    isApplyingQuoteTripPrefill = false;
  }

  if (contactPreferenceInput) {
    contactPreferenceInput.addEventListener("change", syncPhoneRequirement);
  }

    if (eventTypeInput) {
    eventTypeInput.addEventListener("change", () => {
      if (eventTypeInput.value === "airport") {
        const oneWayInput = Array.from(quoteDirectionInputs).find(
          (input) => input.value === "oneWay"
        );
        if (oneWayInput) oneWayInput.checked = true;
        if (pickupLocationInput && !pickupLocationInput.value.trim()) {
          pickupLocationInput.value = "Logan Airport";
        }
      } else if (previousEventType === "airport" && pickupLocationInput) {
        pickupLocationInput.value = "";
      }
      syncQuoteTripFields();
      syncQuoteSportsPlanAvailability();
      trackQuoteFormStart("form");
      if (!isApplyingQuoteTripPrefill) clearQuoteTripPrefill();
      previousEventType = eventTypeInput.value;
    });
  }

  if (quoteSportsVenueInput) {
    quoteSportsVenueInput.addEventListener("change", () => {
      if (quoteSportsPlanInput) quoteSportsPlanInput.value = "";
      syncQuoteSportsPlanAvailability();
      if (!isApplyingQuoteTripPrefill) clearQuoteTripPrefill();
    });
  }

  quoteDirectionInputs.forEach((input) => {
    input.addEventListener("change", () => {
      syncQuoteDirectionFields();
      if (!isApplyingQuoteTripPrefill) clearQuoteTripPrefill();
    });
  });

  quoteFinalLocationInput?.addEventListener("change", syncFinalDropoffLocation);

  customServiceInputs.forEach((input) => {
    input.addEventListener("change", syncCustomServiceDetails);
  });

  document.querySelectorAll("[data-quote-service]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const helpPanel = link.closest(".estimate-help");
      if (helpPanel) closeEstimateHelpPanel(helpPanel);
      const serviceInput = quoteForm.querySelector(
        `[name="customServices"][value="${link.dataset.quoteService}"]`
      );
      if (serviceInput) serviceInput.checked = true;

      const eventType = link.dataset.quoteEventType;
      if (eventType && eventTypeInput) {
        eventTypeInput.value = eventType;
        previousEventType = eventType;
        syncQuoteTripFields();
        syncQuoteSportsPlanAvailability();
        trackQuoteFormStart("custom_service");
      }
      syncCustomServiceDetails();
      window.requestAnimationFrame(() => {
        quoteForm.scrollIntoView({ behavior: "smooth", block: "start" });
        eventTypeInput?.focus({ preventScroll: true });
      });
    });
  });

  pickupDateInput?.addEventListener("change", () => {
    syncQuoteDateLimits();
    syncCustomServiceDetails();
  });

  [
    pickupTimeInput,
    destinationDropoffTimeInput,
    destinationPickupTimeInput,
  ].forEach((input) => {
    input?.addEventListener("change", syncQuoteTimingValidity);
  });

  document.querySelectorAll("[data-quote-trip]").forEach((link) => {
    link.addEventListener("click", () => {
      applyQuoteTripPrefill(link.dataset.quoteTrip);
    });
  });

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.setCustomValidity("");
    });
  }

  syncPhoneRequirement();
  syncCustomServiceDetails();
  populateTimeSelects(quoteForm);
  syncQuoteTripFields();
  syncQuoteSportsPlanAvailability();
  syncQuoteDirectionFields();
  syncQuoteDateLimits();
  syncQuoteTimingValidity();

  const quoteTripFromUrl = new URLSearchParams(window.location.search).get(
    "trip"
  );
  if (quoteTripFromUrl) {
    applyQuoteTripPrefill(quoteTripFromUrl);
  }

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const latestAttribution = buildAttributionSnapshot();
    populateAttributionFields(quoteForm, latestAttribution);
    const data = new FormData(quoteForm);
    const name = data.get("name");
    const requiresPhone = data.get("contactPreference") === "text";
    const phoneValue = (data.get("phone") || "").toString().trim();
    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : "";

    syncQuoteTimingValidity();
    if (!quoteForm.checkValidity()) {
      quoteForm.reportValidity();
      return;
    }

    if (requiresPhone && !phoneValue) {
      if (phoneInput) {
        phoneInput.setCustomValidity("Phone is required when preferred contact is text.");
        phoneInput.reportValidity();
      }
      setQuoteMessage(
        "Please enter a phone number if you prefer to be contacted by text.",
        "error"
      );
      return;
    }

    // Honeypot trap: silently ignore likely bot submissions.
    if ((data.get("_honey") || "").toString().trim() !== "") {
      setQuoteMessage("Thanks! Your request has been received.", "success");
      quoteForm.reset();
      hasTrackedQuoteFormStart = false;
      populateAttributionFields(quoteForm, buildAttributionSnapshot());
      syncPhoneRequirement();
      syncCustomServiceDetails();
      syncQuoteTripFields();
      syncQuoteSportsPlanAvailability();
      syncQuoteDirectionFields();
      syncQuoteDateLimits();
      syncQuoteTimingValidity();
      clearQuoteTripPrefill();
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      setQuoteMessage("Sending your request...", "sending");

      const payload = buildIntakePayload(data);
      const receipt = buildQuoteReceiptData(data);
      const response = await fetch(INTAKE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      const message = (result.message || "").toString();
      const isSuccess = result.success === true || result.success === "true";

      if (!response.ok || !isSuccess) {
        if (message.toLowerCase().includes("activation")) {
          setQuoteMessage(
            "The booking form still needs to be activated before requests can be delivered. Please finish the FormSubmit activation, then submit again."
          );
          return;
        }
        throw new Error(result.message || "Submission failed");
      }

      sendQuoteReceipt(receipt).catch((error) => {
        console.error("Quote confirmation email failed", error);
      });

      setQuoteMessage(
        `Thanks ${name || "there"}! Your request is in. We typically reply within 30-60 minutes between 8am-9pm ET (same day otherwise).`,
        "success"
      );
      trackGa4Event("generate_lead", buildLeadEventParams(data));
      trackGoogleAdsQuoteConversion();
      quoteForm.reset();
      hasTrackedQuoteFormStart = false;
      populateAttributionFields(quoteForm, buildAttributionSnapshot());
      syncPhoneRequirement();
      syncCustomServiceDetails();
      syncQuoteTripFields();
      syncQuoteSportsPlanAvailability();
      syncQuoteDirectionFields();
      syncQuoteDateLimits();
      syncQuoteTimingValidity();
      clearQuoteTripPrefill();
    } catch (error) {
      quoteSuccess.classList.remove("success", "sending");
      quoteSuccess.classList.add("error");
      quoteSuccess.textContent =
        "We couldn’t submit your request right now. Please wait a moment and try again.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText || "Send Quote Request";
      }
    }
  });
}
