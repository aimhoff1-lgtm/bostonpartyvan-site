const DEFAULT_FROM = "Boston Party Van <bookings@bostonpartyvan.com>";
const ALLOWED_ORIGINS = new Set([
  "https://www.bostonpartyvan.com",
  "https://bostonpartyvan.com",
]);

function htmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sportsReceiptDetails(sportsVenue, tripDirection) {
  const isRoundTrip = tripDirection === "roundTrip";
  const venueDetails = {
    "td-garden": {
      subject: "Your TD Garden ride request is in",
      oneWay: "I have your TD Garden drop-off request, including the game-day arrival details you submitted.",
      roundTrip: "I have your TD Garden round-trip request, including both the trip in and the return leg.",
    },
    "fenway-park": {
      subject: "Your Fenway ride request is in",
      oneWay: "I have your Fenway drop-off request. I’ll review the pickup and ballpark arrival details you submitted.",
      roundTrip: "I have your Fenway round-trip request, including the ballpark arrival and return leg.",
    },
    "gillette-stadium": {
      subject: "Your Gillette Stadium ride request is in",
      oneWay: "I have your Gillette Stadium drop-off request. I’ll review the route and timing before I follow up.",
      roundTrip: "I have your Gillette Stadium round-trip request, with both legs of the trip noted.",
    },
    "white-stadium": {
      subject: "Your White Stadium ride request is in",
      oneWay: "I have your White Stadium drop-off request, with the event timing and arrival details noted.",
      roundTrip: "I have your White Stadium round-trip request, including the trip in and return leg.",
    },
    other: {
      subject: "Your game-day ride request is in",
      oneWay: "I have your sporting-event drop-off request and the venue details you submitted.",
      roundTrip: "I have your sporting-event round-trip request, including both legs of the trip.",
    },
  };
  const details = Object.hasOwn(venueDetails, sportsVenue)
    ? venueDetails[sportsVenue]
    : venueDetails.other;

  return {
    subject: details.subject,
    copy: isRoundTrip ? details.roundTrip : details.oneWay,
  };
}

function receiptDetails(receipt) {
  if (receipt.eventType === "sports") {
    return sportsReceiptDetails(receipt.sportsVenue, receipt.tripDirection);
  }

  const details = {
    airport: {
      subject: "Your airport transfer request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your airport round-trip request, including both transfer legs."
        : "I have your one-way airport transfer request and the travel details you submitted.",
    },
    wedding: {
      subject: "Your wedding transportation request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your wedding round-trip request, including both legs of the day."
        : "I have your wedding transportation request and the timing you submitted.",
    },
    corporate: {
      subject: "Your group transportation request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your corporate round-trip request, including both legs of the itinerary."
        : "I have your corporate transportation request and the event timing you submitted.",
    },
    family: {
      subject: "Your group outing request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your family outing round-trip request, including both directions of travel."
        : "I have your family outing transportation request and the details you submitted.",
    },
    golf: {
      subject: "Your golf outing request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your golf-trip round-trip request, including both legs of the day."
        : "I have your golf-trip transportation request and the timing you submitted.",
    },
    cape: {
      subject: "Your Cape Cod trip request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your Cape Cod round-trip request, including both directions of travel."
        : "I have your Cape Cod transportation request and the route details you submitted.",
    },
    islandferry: {
      subject: "Your island ferry transfer request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your island ferry round-trip transfer request, including both travel legs."
        : "I have your island ferry transfer request and the ferry details you submitted.",
    },
    whitemountains: {
      subject: "Your New England trip request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your White Mountains round-trip request, including both directions of travel."
        : "I have your White Mountains transportation request and the route details you shared.",
    },
    bach: {
      subject: "Your celebration ride request is in",
      copy: "I have your bachelor or bachelorette plans and will review the details before I follow up.",
    },
    barcrawl: {
      subject: "Your Boston bar crawl request is in",
      copy: "I have your Boston bar crawl details and will take a look at the plan you have in mind.",
    },
    birthday: {
      subject: "Your birthday ride request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your birthday round-trip request, including the ride out and return leg."
        : "I have your birthday transportation request and the trip details you submitted.",
    },
    nightlife: {
      subject: "Your night-out ride request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your night-out round-trip request, including the ride out and return leg."
        : "I have your night-out transportation request and the details you submitted.",
    },
    concert: {
      subject: "Your concert ride request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your concert round-trip request, including the arrival and return leg."
        : "I have your concert transportation request, including the venue and arrival timing you shared.",
    },
    local: {
      subject: "Your Boston route request is in",
      copy: receipt.tripDirection === "roundTrip"
        ? "I have your local group round-trip request, including both legs of the trip."
        : "I have your local group transportation request and the trip details you submitted.",
    },
  };

  return details[receipt.eventType] || {
    subject: "Your Boston Party Van quote request is in",
    copy: receipt.tripDirection === "roundTrip"
      ? "I have your custom round-trip request, including both legs of the itinerary."
      : "I have your custom transportation request and the route details you submitted.",
  };
}

function buildReceiptEmail(receipt) {
  const details = receiptDetails(receipt);
  const firstName = String(receipt.name || "there").trim().split(/\s+/)[0] || "there";
  const contactMethod = {
    text: "text",
    call: "phone call",
    email: "email",
  }[receipt.contactPreference];
  const contactCopy = contactMethod
    ? ` I will use ${contactMethod} when I follow up.`
    : "";
  const safeName = htmlEscape(firstName);
  const text = [
    `Hi ${firstName},`,
    "",
    "Thanks for reaching out to Boston Party Van. Your request is in.",
    "",
    details.copy,
    `I will review the details and follow up soon.${contactCopy}`,
    "",
    "This is a confirmation of your inquiry, not a booking confirmation.",
    "",
    "Andrew",
    "Boston Party Van",
    "(617) 515-3702",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;color:#132232;font-family:Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:32px 20px;"><div style="padding:28px;background:#061725;border-radius:12px 12px 0 0;"><p style="margin:0;color:#35d2c3;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Boston Party Van</p><h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;line-height:1.2;">Your request is in.</h1></div><div style="padding:28px;background:#ffffff;border-radius:0 0 12px 12px;"><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">Hi ${safeName},</p><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">Thanks for reaching out to Boston Party Van. I received your request.</p><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">${htmlEscape(details.copy)}</p><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">I will review the details and follow up soon.${htmlEscape(contactCopy)}</p><p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #d9e1e8;color:#587083;font-size:14px;line-height:1.5;">This confirms your inquiry, not a booking confirmation.</p><p style="margin:24px 0 0;font-size:16px;line-height:1.6;">Andrew<br /><strong>Boston Party Van</strong><br />(617) 515-3702</p></div></div></body></html>`;

  return { subject: details.subject, text, html };
}

async function handleQuoteReceipt(request, env) {
  const origin = request.headers.get("Origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return Response.json({ success: false, message: "Invalid request origin." }, { status: 403 });
  }

  let receipt;
  try {
    receipt = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (!receipt.email) {
    return Response.json({ success: false, message: "Missing receipt details." }, { status: 400 });
  }

  if (!env.RESEND_API_KEY) {
    console.warn("Quote receipt skipped: RESEND_API_KEY is not configured.");
    return Response.json({ success: true });
  }

  const receiptEmail = buildReceiptEmail(receipt);
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || DEFAULT_FROM,
      to: [receipt.email],
      subject: receiptEmail.subject,
      html: receiptEmail.html,
      text: receiptEmail.text,
      reply_to: "aimhoff1@gmail.com",
    }),
  });

  if (!resendResponse.ok) {
    console.error("Quote receipt email failed", await resendResponse.text());
    return Response.json({ success: false, message: "Confirmation email failed." }, { status: 502 });
  }

  return Response.json({ success: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === "bostonpartyvan.com") {
      url.hostname = "www.bostonpartyvan.com";
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/quote-receipt" && request.method === "POST") {
      return handleQuoteReceipt(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
