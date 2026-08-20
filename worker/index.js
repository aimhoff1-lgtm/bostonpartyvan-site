const FORM_SUBMIT_ENDPOINT =
  "https://formsubmit.co/ajax/902c76a22ec98900ac487ed64bc69c35";
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

function receiptDetails(eventType) {
  const details = {
    airport: {
      subject: "Your airport transfer request is in",
      copy: "I will review your flight timing, pickup point, and direct route so I can send the right option for your group.",
    },
    sports: {
      subject: "Your game-day ride request is in",
      copy: "I will review your venue, pickup timing, and game-day plan, including whether a current special fits your trip.",
    },
    wedding: {
      subject: "Your wedding transportation request is in",
      copy: "Congratulations on the celebration. I will review your guest timing, venues, and any hotel or reception coordination before sending options.",
    },
    corporate: {
      subject: "Your group transportation request is in",
      copy: "I will review your schedule, pickup plan, and route so I can put together a polished option for your group.",
    },
    family: {
      subject: "Your group outing request is in",
      copy: "I will review the timing and group needs so I can send a comfortable, practical option for the day.",
    },
    golf: {
      subject: "Your golf outing request is in",
      copy: "I will review your course timing, pickup plan, and return window before sending a personalized option.",
    },
    cape: {
      subject: "Your Cape Cod trip request is in",
      copy: "I will review the route, timing, and bridge-aware travel window before sending your options.",
    },
    islandferry: {
      subject: "Your island ferry transfer request is in",
      copy: "I will review your ferry timing and pickup plan so the transfer is simple and coordinated from the start.",
    },
    whitemountains: {
      subject: "Your New England trip request is in",
      copy: "I will review the route, timing, and planned stops before sending an option built around your day.",
    },
    bach: {
      subject: "Your celebration ride request is in",
      copy: "I will review the route, timing, and stop list so your group can enjoy the night without worrying about the driving.",
    },
    barcrawl: {
      subject: "Your Boston bar crawl request is in",
      copy: "I will review the timing and stop list so I can build a smooth, well-paced night for your group.",
    },
    birthday: {
      subject: "Your birthday ride request is in",
      copy: "I will review the route and timing so I can help make the celebration feel easy from the first pickup through the last drop-off.",
    },
    nightlife: {
      subject: "Your night-out ride request is in",
      copy: "I will review your plan and timing so your group can focus on the night and leave the driving to us.",
    },
    concert: {
      subject: "Your concert ride request is in",
      copy: "I will review your venue, arrival timing, and pickup plan before sending options for the show.",
    },
    local: {
      subject: "Your Boston route request is in",
      copy: "I will review the route and timing so I can build a comfortable, practical plan for your group.",
    },
  };

  return details[eventType] || {
    subject: "Your Boston Party Van quote request is in",
    copy: "I will review the route, timing, and group details before sending a personalized option for your trip.",
  };
}

function buildReceiptEmail(receipt) {
  const details = receiptDetails(receipt.eventType);
  const firstName = String(receipt.name || "there").trim().split(/\s+/)[0] || "there";
  const contactMethod = {
    text: "text",
    call: "phone call",
    email: "email",
  }[receipt.contactPreference];
  const contactCopy = contactMethod
    ? ` I will use ${contactMethod} first unless you let me know otherwise.`
    : "";
  const safeName = htmlEscape(firstName);
  const text = [
    `Hi ${firstName},`,
    "",
    `Thanks for considering Boston Party Van for your ${receipt.eventTypeLabel || "trip"}. Your request is in.`,
    "",
    details.copy,
    `I will personally follow up with a more solid quote based on the actual plan.${contactCopy}`,
    "",
    "This is a confirmation of your inquiry, not a booking confirmation.",
    "",
    "Andrew",
    "Boston Party Van",
    "(617) 515-3702",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#f4f7fb;color:#132232;font-family:Arial,sans-serif;"><div style="max-width:600px;margin:0 auto;padding:32px 20px;"><div style="padding:28px;background:#061725;border-radius:12px 12px 0 0;"><p style="margin:0;color:#35d2c3;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Boston Party Van</p><h1 style="margin:12px 0 0;color:#ffffff;font-size:28px;line-height:1.2;">Your request is in.</h1></div><div style="padding:28px;background:#ffffff;border-radius:0 0 12px 12px;"><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">Hi ${safeName},</p><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">Thanks for considering Boston Party Van for your ${htmlEscape(receipt.eventTypeLabel || "trip")}. I received your request.</p><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">${htmlEscape(details.copy)}</p><p style="margin:0 0 18px;font-size:17px;line-height:1.6;">I will personally follow up with a more solid quote based on the actual plan.${htmlEscape(contactCopy)}</p><p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #d9e1e8;color:#587083;font-size:14px;line-height:1.5;">This confirms your inquiry, not a booking confirmation.</p><p style="margin:24px 0 0;font-size:16px;line-height:1.6;">Andrew<br /><strong>Boston Party Van</strong><br />(617) 515-3702</p></div></div></body></html>`;

  return { subject: details.subject, text, html };
}

async function handleQuoteRequest(request, env) {
  const origin = request.headers.get("Origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return Response.json({ success: false, message: "Invalid request origin." }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ success: false, message: "Invalid request." }, { status: 400 });
  }

  const receipt = payload._bpv_receipt;
  delete payload._bpv_receipt;
  if (!receipt || typeof receipt !== "object" || !receipt.email) {
    return Response.json({ success: false, message: "Missing receipt details." }, { status: 400 });
  }

  const formSubmitResponse = await fetch(FORM_SUBMIT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  const formSubmitResult = await formSubmitResponse.json().catch(() => ({}));
  const submitted =
    formSubmitResponse.ok &&
    (formSubmitResult.success === true || formSubmitResult.success === "true");

  if (!submitted) {
    return Response.json(
      { success: false, message: formSubmitResult.message || "Submission failed." },
      { status: 502 }
    );
  }

  if (env.RESEND_API_KEY) {
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
    }
  } else {
    console.warn("Quote receipt skipped: RESEND_API_KEY is not configured.");
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

    if (url.pathname === "/api/quote" && request.method === "POST") {
      return handleQuoteRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
