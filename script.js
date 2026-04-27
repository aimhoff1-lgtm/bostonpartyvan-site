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

function setPackageCardExpanded(card, expanded) {
  const toggle = card.querySelector("[data-package-toggle]");
  const cta = card.querySelector("[data-package-cta]");
  card.classList.toggle("is-active", expanded);
  if (toggle) {
    toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  if (cta) {
    cta.textContent = expanded ? "Click to collapse" : "Click for route details";
  }
}

if (packageCards.length) {
  packageCards.forEach((card) => {
    const toggle = card.querySelector("[data-package-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const isExpanded = card.classList.contains("is-active");
      packageCards.forEach((eachCard) => setPackageCardExpanded(eachCard, false));
      setPackageCardExpanded(card, !isExpanded);
    });
  });

  const activeCard = document.querySelector("[data-package-card].is-active");
  packageCards.forEach((card) => setPackageCardExpanded(card, card === activeCard));
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

if (estimateForm && estimateResult) {
  estimateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(estimateForm);
    const tripType = data.get("tripType");
    const hours = Number(data.get("hours"));
    const miles = Number(data.get("miles"));
    const passengers = Number(data.get("passengers"));
    const isWeekend = data.get("weekend") === "on";
    const hasMultiStop = data.get("multiStop") === "on";

    const hourlyByTrip = {
      airport: 145,
      wedding: 190,
      nightlife: 180,
      golf: 175,
      cape: 215,
      bach: 195,
      local: 170,
      corporate: 165,
    };

    const base = (hourlyByTrip[tripType] || 160) * Math.max(hours, 3);
    const mileageCost = Math.max(miles, 10) * 2.2;
    const passengerAdjustment = passengers > 12 ? 65 : passengers < 6 ? -30 : 0;
    const weekendAdjustment = isWeekend ? base * 0.14 : 0;
    const multiStopAdjustment = hasMultiStop ? 75 : 0;

    const subtotal =
      base +
      mileageCost +
      passengerAdjustment +
      weekendAdjustment +
      multiStopAdjustment;

    const low = Math.max(250, subtotal * 0.92);
    const high = subtotal * 1.1;

    const price = estimateResult.querySelector(".estimate-price");
    const note = estimateResult.querySelector(".estimate-note");
    if (price && note) {
      price.textContent = `${formatUsd(low)} - ${formatUsd(high)}`;
      note.textContent =
        "This is an instant estimate. We'll confirm your final price after route and timing review.";
    }
  });
}

const quoteForm = document.getElementById("quoteForm");
const quoteSuccess = document.getElementById("quoteSuccess");
const INTAKE_ENDPOINT =
  "https://formsubmit.co/ajax/902c76a22ec98900ac487ed64bc69c35";

function toTitleCase(value) {
  if (!value || typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildMailtoFromFormData(data) {
  const lines = [
    `Name: ${data.get("name") || ""}`,
    `Email: ${data.get("email") || ""}`,
    `Phone: ${data.get("phone") || ""}`,
    `Event date: ${data.get("date") || ""}`,
    `Event type: ${toTitleCase(data.get("eventType") || "")}`,
    `Passengers: ${data.get("guestCount") || ""}`,
    `Pickup: ${data.get("pickup") || ""}`,
    `Drop-off: ${data.get("dropoff") || ""}`,
    `Preferred contact method: ${toTitleCase(data.get("contactPreference") || "")}`,
    `Best contact time: ${toTitleCase(data.get("contactTime") || "")}`,
    "",
    "Trip notes:",
    data.get("notes") || "(none provided)",
  ];

  const subject = `Quote Request - ${data.get("name") || "New Lead"}`;
  const body = lines.join("\n");

  return `mailto:aimhoff1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildIntakePayload(data) {
  const name = data.get("name") || "New Lead";
  return {
    name: data.get("name") || "",
    email: data.get("email") || "",
    phone: data.get("phone") || "",
    event_date: data.get("date") || "",
    event_type: toTitleCase(data.get("eventType") || ""),
    passengers: data.get("guestCount") || "",
    pickup_location: data.get("pickup") || "",
    dropoff_location: data.get("dropoff") || "",
    preferred_contact_method: toTitleCase(data.get("contactPreference") || ""),
    best_contact_time: toTitleCase(data.get("contactTime") || ""),
    notes: data.get("notes") || "",
    _subject: `New Quote Request - ${name}`,
    _template: "table",
    _captcha: "false",
    _replyto: data.get("email") || "",
  };
}

if (quoteForm && quoteSuccess) {
  const dateInput = quoteForm.querySelector('input[name="date"]');
  const contactPreferenceInput = quoteForm.querySelector(
    'select[name="contactPreference"]'
  );
  const phoneInput = quoteForm.querySelector('input[name="phone"]');
  const phoneHint = quoteForm.querySelector("[data-phone-hint]");

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

  if (contactPreferenceInput) {
    contactPreferenceInput.addEventListener("change", syncPhoneRequirement);
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.setCustomValidity("");
    });
  }

  syncPhoneRequirement();

  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  quoteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const name = data.get("name");
    const requiresPhone = data.get("contactPreference") === "text";
    const phoneValue = (data.get("phone") || "").toString().trim();
    const submitButton = quoteForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : "";

    if (requiresPhone && !phoneValue) {
      if (phoneInput) {
        phoneInput.setCustomValidity("Phone is required when preferred contact is text.");
        phoneInput.reportValidity();
      }
      quoteSuccess.classList.add("error");
      quoteSuccess.textContent =
        "Please enter a phone number if you prefer to be contacted by text.";
      return;
    }

    // Honeypot trap: silently ignore likely bot submissions.
    if ((data.get("_honey") || "").toString().trim() !== "") {
      quoteSuccess.classList.remove("error");
      quoteSuccess.textContent = "Thanks! Your request has been received.";
      quoteForm.reset();
      syncPhoneRequirement();
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      quoteSuccess.classList.remove("error");
      quoteSuccess.textContent = "Sending your request...";

      const payload = buildIntakePayload(data);
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
          quoteSuccess.classList.remove("error");
          quoteSuccess.textContent =
            "Almost done: check aimhoff1@gmail.com for the FormSubmit activation email, click Activate Form once, then submit again.";
          return;
        }
        throw new Error(result.message || "Submission failed");
      }

      quoteSuccess.classList.remove("error");
      quoteSuccess.textContent = `Thanks ${name || "there"}! Your request was sent. We’ll follow up soon.`;
      quoteForm.reset();
      syncPhoneRequirement();
    } catch (error) {
      const mailto = buildMailtoFromFormData(data);
      const fallbackLink = document.createElement("a");
      fallbackLink.href = mailto;
      fallbackLink.textContent = "Send via email instead";
      fallbackLink.rel = "nofollow";

      quoteSuccess.classList.add("error");
      quoteSuccess.textContent =
        "We couldn’t auto-submit right now. Please use the backup link: ";
      quoteSuccess.appendChild(fallbackLink);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText || "Send Quote Request";
      }
    }
  });
}
