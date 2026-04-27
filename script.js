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

  return `mailto:info@bostonpartyvan.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

if (quoteForm && quoteSuccess) {
  const dateInput = quoteForm.querySelector('input[name="date"]');
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const name = data.get("name");
    const mailto = buildMailtoFromFormData(data);
    const fallbackLink = document.createElement("a");
    fallbackLink.href = mailto;
    fallbackLink.textContent = "Open draft again";
    fallbackLink.rel = "nofollow";

    quoteSuccess.textContent = `Thanks ${name || "there"}! Your details are ready to send. `;
    quoteSuccess.appendChild(fallbackLink);

    // Open the user's email app with a pre-filled quote request.
    window.location.href = mailto;

    quoteForm.reset();
  });
}
