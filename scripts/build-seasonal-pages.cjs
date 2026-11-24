const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const site = "https://www.bostonpartyvan.com";
const pages = [
  {
    slug: "boston-holiday-party-transportation",
    title: "Boston Holiday Party Transportation",
    heading: "Holiday party transportation in Boston",
    short: "Holiday parties",
    description: "Private Boston holiday and Christmas party transportation for up to 14 passengers. Office parties, family dinners, hotel pickups, and a dedicated driver.",
    intro: "Celebrate together, from the first pickup to the ride home. A private Mercedes-Benz Sprinter for up to 14 passengers, plus your dedicated driver.",
    sections: [
      { title: "Your holiday party starts with the ride", paragraphs: [
        "A company celebration, a Christmas dinner with friends, or a family night out should not require a convoy of cars. Boston Party Van keeps your group together in one private, high-roof Sprinter. Andrew plans the pickup, stop sequence, and return around your actual event.",
        "We are accepting holiday transportation inquiries from Greater Boston, including Boston, Cambridge, Somerville, Newton, and nearby communities. The van has 14 passenger seats plus a separate driver seat. Request your date and itinerary for personalized pricing; availability and transportation arrangements are confirmed before booking."
      ] },
      { title: "Office and corporate holiday parties", paragraphs: [
        "Arrange one office pickup, a hotel departure, or a planned neighborhood pickup loop before your team dinner or company party. Share the venue address, event start time, and when everyone needs to be back. We can plan a round trip or a one-way transfer if your group has a separate return arrangement.",
        "For an evening with several stops, include the restaurant, party venue, and final drop-off location in your request. A clear schedule helps us allow time for loading, traffic, and the end-of-night meeting point."
      ], items: ["Office-to-restaurant and office-to-venue transportation", "Hotel pickups for visiting colleagues or clients", "Small-team celebrations and company dinners", "Coordinated return trips after the party"] },
      { id: "christmas-parties", title: "Christmas parties, dinners, and celebrations", paragraphs: [
        "Bring your friends or family together for a Christmas party without dividing the group among several cars. Plan a restaurant dinner, a holiday performance, a private gathering, or a festive night across Boston. Your driver handles the transportation while everyone enjoys the occasion.",
        "Christmas-light displays can be included as a planned stop before or after dinner. Tell us which displays you want to see and any timed admission you have booked. Admission, show tickets, and restaurant reservations are separate from transportation."
      ] },
      { title: "Build your holiday ride request", items: [
        "Your trip date, total passenger count, and pickup area", "The party, restaurant, or hotel address and any intermediate stops", "Your preferred pickup time and final return time", "Whether you need one-way service, a round trip, or a multi-stop evening", "Any luggage, gifts, or equipment traveling with the group"
      ], paragraphs: ["Most local bookings have a three-hour minimum. Pricing depends on the route, duration, mileage, stops, and service needs. Use our estimator for a planning range, then submit an inquiry for your actual itinerary. No payment is taken through the inquiry form."] }
    ],
    faqs: [
      ["How many people can ride to our holiday party?", "The Sprinter seats up to 14 passengers plus a separate driver. Share your exact passenger count and any luggage or equipment so we can confirm your plan."],
      ["Can you pick up our group at an office or hotel?", "Yes. We plan office, hotel, and other Greater Boston pickups. Include every pickup address and the event start time in your inquiry."],
      ["Can we add Christmas lights or a dinner stop?", "Yes. Include your desired displays, restaurant, stop sequence, and timing so the quote covers the full evening. Tickets and reservations are separate."],
      ["Are you available for Christmas and New Year's Eve?", "We are unavailable December 25, 2026 through January 4, 2027, inclusive. Holiday-party inquiries are welcome for dates outside that period, with exact availability confirmed before booking."],
      ["Can we request a last-minute holiday ride?", "Yes. We accept immediate and short-notice inquiries for dates outside the holiday closure. Andrew will review your route and confirm availability; there is no 30-day notice requirement."]
    ]
  },
  {
    slug: "boston-ski-trip-transportation",
    title: "Boston Ski & Snowboard Trip Transportation",
    heading: "Ski & snowboard trips from Boston",
    short: "Ski & snowboard trips",
    description: "Private ski and snowboard transportation from Boston for up to 14 passengers. New England mountain trips with a dedicated driver and room for skis and winter gear.",
    intro: "Bring the group and the gear. Private Boston-to-mountain transportation with 14 passenger seats, a dedicated driver, and plenty of space for skis and winter bags.",
    sections: [
      { title: "A private ski-day ride from Boston", paragraphs: [
        "Start your ski or snowboard day together in our high-roof Mercedes-Benz Sprinter. Instead of coordinating several cars, your group has one pickup plan, a dedicated driver, and a scheduled return. We build the transportation around your mountain, lesson time, and preferred day on the slopes.",
        "Ski trips work for friends, families, small company outings, and groups with a mix of skiers and snowboarders. Request a Greater Boston pickup and tell us whether you want a day trip, a mountain drop-off, or a multi-day itinerary. Exact route feasibility and availability are confirmed before booking."
      ] },
      { title: "Room for skis, snowboards, and winter gear", paragraphs: [
        "There is plenty of room for skis, snowboards, boots, helmets, and winter bags. The van has 14 passenger seats plus a separate driver seat, with space to plan the load around your group.",
        "Include your passenger count, number of skis or boards, and any overnight luggage in your inquiry. That lets us confirm the full seating and equipment arrangement before the trip, especially when everyone is bringing both sports equipment and weekend bags."
      ] },
      { title: "New England mountain routes", paragraphs: [
        "Request transportation from Boston to your chosen Massachusetts, New Hampshire, or Vermont mountain. Examples include Wachusett Mountain in Princeton, Massachusetts, and Loon Mountain in Lincoln, New Hampshire. Longer mountain journeys and overnight returns receive an itinerary-specific quote.",
        "Tell us your preferred arrival time rather than assuming a fixed driving time. Winter roads, traffic, loading, resort access, and weather all affect the plan. Mountain operating dates, lift tickets, rentals, and lessons must be confirmed directly with the resort. Transportation does not include resort admission."
      ], links: [["Wachusett Mountain operating information", "https://www.wachusett.com/"], ["Loon Mountain operating information", "https://www.loonmtn.com/"]] },
      { title: "From early pickup to the return ride", items: [
        "One agreed pickup hub or a planned local pickup loop", "Time to load skis, boards, boots, and bags before departure", "A resort drop-off coordinated around your tickets or lesson time", "A planned return meeting point and departure time", "Optional meal or apres-ski stops included in the quoted itinerary"
      ], paragraphs: ["For a multi-day ski weekend, send the service end date, lodging location, passenger and bag counts, and all required driving windows. We do not accept itineraries that overlap December 25, 2026 through January 4, 2027. Trips outside those dates can be requested now."] }
    ],
    faqs: [
      ["Can we bring our own skis and snowboards?", "Yes. There is room for skis, snowboards, boots, and winter bags. Include the full equipment and luggage count with your passenger count so we can confirm the load before booking."],
      ["Is this a shared ski bus?", "No. This is private Sprinter transportation for your group, with up to 14 passenger seats plus your driver. Your pickup, mountain, and return timing are planned around your itinerary."],
      ["Can you take us to New Hampshire or Vermont?", "Yes, we consider custom New England mountain routes. Share the resort, pickup area, timing, and any overnight plans for an itinerary-specific quote."],
      ["Are lift tickets and rentals included?", "No. Lift tickets, resort admission, rentals, and lessons are separate. Confirm your arrangements and the mountain's operating dates directly with the resort."],
      ["Can we book a ski trip during the holiday closure?", "No. Trips and multi-day service overlapping December 25, 2026 through January 4, 2027 are unavailable. You can request dates before or after that period."],
      ["What happens if winter weather affects the route?", "Share your schedule and resort details when requesting a quote. Route feasibility and weather-related arrangements are reviewed for your trip; we do not promise travel through unsafe conditions."]
    ]
  },
  {
    slug: "boston-winter-group-transportation",
    title: "Boston Winter Outing & Christmas Lights Transportation",
    heading: "Winter outings & Christmas lights",
    short: "Winter outings & Christmas lights",
    description: "Private Boston winter group transportation for Christmas lights, ice skating, holiday markets, tubing, concerts, and family outings. Up to 14 passengers plus a driver.",
    intro: "Christmas lights, skating, winter shows, and a great meal together. Give your group one private ride and a dedicated driver for the whole plan.",
    sections: [
      { id: "holiday-calendar", title: "2026 holiday markets, lights, and festivals", paragraphs: [
        "Give your group a specific night or day out to look forward to. These organizer-published dates were checked November 18, 2026. Choose an open event date outside our December 25, 2026 through January 4, 2027 closure; transportation availability is confirmed with your quote. Admission and event tickets are separate."
      ], items: [
        "SoWa Christmas Market, Boston's South End: November 20-December 27, 2026. Handmade gifts, food, and live music. Closed Mondays and Thanksgiving, with special holiday hours. BPV ride requests must be for dates before December 25.",
        "La Salette Christmas Festival of Lights, Attleboro: November 21, 2026-January 3, 2027. Plan an evening among the illuminated grounds, with a dinner stop if desired. Our available season for this outing ends December 24.",
        "Winterlights at the Eleanor Cabot Bradley Estate, Canton: select nights November 27, 2026-January 2, 2027. Timed tickets are required; the event is closed December 24-25. Request one of the event's open nights through December 23, and contact the organizer about group admission for more than 10 guests.",
        "Kennebunkport Christmas Prelude, Maine: December 3-13, 2026. Tree lightings, caroling, and coastal-town celebrations make a longer holiday day trip. Pick the activities you want from the official schedule so we can plan the route and return time."
      ], links: [
        ["SoWa official dates and hours", "https://www.sowaboston.com/sowa-christmas-market/"],
        ["La Salette official festival schedule", "https://www.lasaletteattleboroshrine.org/christmas-festival"],
        ["Winterlights official nights and tickets", "https://thetrustees.org/program/winterlights-massachusetts/"],
        ["Christmas Prelude official schedule", "https://christmasprelude.com/schedule/"]
      ] },
      { title: "Make a winter day of it", paragraphs: [
        "Winter outings are easier when everyone travels together. Boston Party Van provides private group transportation from Greater Boston in our actual high-roof Mercedes-Benz Sprinter, with 14 passenger seats plus a separate driver seat.",
        "Build a route around the activities your group wants: Christmas-light displays, holiday markets, ice skating, snow tubing, winter concerts, theater performances, hockey games, or an indoor museum day followed by dinner. We provide the transportation; tickets, equipment rentals, and activity reservations are arranged separately."
      ] },
      { id: "christmas-lights", title: "Christmas lights and holiday markets", paragraphs: [
        "Plan a family or friends' outing with one pickup point, your chosen light display or holiday market, and a return or dinner stop. If your destination uses timed admission, include the entry window and how long you expect to stay.",
        "Send the actual display and venue names rather than a general request for a lights tour. We can help organize the transportation, but do not advertise a fixed sightseeing circuit or included admission. Check seasonal opening dates and access rules directly with each venue."
      ] },
      { title: "Ice skating, snow tubing, and family outings", paragraphs: [
        "Keep the group together for a skating session, a snow-tubing reservation, or a winter family day trip. Share your destination, arrival window, passenger count, and any boots, skates, bags, or other equipment you will bring.",
        "For trips with children, include their ages and any car-seat or booster-seat needs so the seating plan and responsibilities can be confirmed. Activity age limits, safety rules, rental equipment, and weather closures are set by the venue, not the transportation booking."
      ] },
      { title: "Winter concerts, theater, hockey, and dinner", paragraphs: [
        "A show or game can be the centerpiece of a winter night out. Build in dinner before the performance, a convenient drop-off, and a clear post-event meeting point. We plan around your group's timing and the venue's vehicle-access rules.",
        "Include any final neighborhood drop-offs and whether everyone returns together. A private quote reflects the full route and service window, not just the journey to the venue. For mountain days with skis or snowboards, use our dedicated ski-trip planning page."
      ] },
      { title: "Details that make your winter quote accurate", items: [
        "Trip date, passenger count, and pickup address", "Activity venues and timed tickets or reservations", "The order of stops, including meals or additional pickups", "Desired return time and final drop-off location", "Equipment, luggage, and any child-seat needs"
      ], paragraphs: ["We accept immediate and short-notice inquiries. Exact availability is confirmed before booking. December 25, 2026 through January 4, 2027 is unavailable, including multi-day trips that overlap the closure."] }
    ],
    faqs: [
      ["Can you drive us to Christmas-light displays?", "Yes. Share the displays or venues you want to visit, their addresses, and any timed admission. We plan the transportation around your route; admission is separate."],
      ["Can our winter outing include several stops?", "Yes. Include your complete stop sequence, meal plans, and return details in the inquiry so the quote covers the full itinerary."],
      ["Is the van suitable for a family group?", "The van has 14 passenger seats plus a driver. Tell us the children's ages, car-seat or booster-seat needs, and any equipment so the seating plan can be confirmed."],
      ["Can we bring skates, boots, or winter bags?", "Yes. Include the equipment and luggage list with your headcount so we can plan the load. For skis and snowboards, our ski-trip service offers the same private van with gear planning."],
      ["Which winter dates are unavailable?", "December 25, 2026 through January 4, 2027, inclusive, is blocked. Inquiries are welcome for other dates, with exact availability confirmed before booking."]
    ]
  }
];

function escape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

async function main() {
  for (const page of pages) {
    const url = `${site}/guides/${page.slug}/`;
    const quote = "../../index.html#quote";
    const schema = { "@context": "https://schema.org", "@graph": [
      { "@type": "Service", "@id": `${url}#service`, name: page.title, url, description: page.description, serviceType: "Private driver-included group transportation", provider: { "@id": `${site}/#business` }, areaServed: ["Greater Boston", "Massachusetts", "New England"], image: `${site}/assets/images/van-2026/exterior-retouched.webp` },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Boston Party Van", item: `${site}/` }, { "@type": "ListItem", position: 2, name: page.short, item: url }] },
      { "@type": "FAQPage", mainEntity: page.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
    ] };
    const sections = page.sections.map((section) => `<section class="section"${section.id ? ` id="${section.id}"` : ""}>
      <h2>${escape(section.title)}</h2>
      ${(section.paragraphs || []).map((p) => `<p>${escape(p)}</p>`).join("\n")}
      ${section.items ? `<ul>${section.items.map((item) => `<li>${escape(item)}</li>`).join("\n")}</ul>` : ""}
      ${section.links ? `<p>${section.links.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`).join(" | ")}</p>` : ""}
    </section>`).join("\n");
    const related = pages.filter((p) => p.slug !== page.slug).map((p) => `<li><a href="../${p.slug}/">${escape(p.title)}</a></li>`).join("\n");
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escape(page.title)} | Boston Party Van</title>
  <meta name="description" content="${escape(page.description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" href="../../assets/images/favicon-32.png" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Boston Party Van" />
  <meta property="og:title" content="${escape(page.title)}" />
  <meta property="og:description" content="${escape(page.description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${site}/assets/images/boston-skyline-river-dusk.webp" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(page.title)}" />
  <meta name="twitter:description" content="${escape(page.description)}" />
  <meta name="twitter:image" content="${site}/assets/images/boston-skyline-river-dusk.webp" />
  <script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../../style.css?v=1.6.3-inquiries" />
</head>
<body>
  <header class="site-header">
    <div class="top-strip"><p>Sprinter van bookings for Greater Boston and nearby routes</p></div>
    <div class="nav-wrap">
      <a class="brand" href="../../index.html" aria-label="Boston Party Van home"><span class="brand-lockup"><img class="brand-logo" src="../../assets/images/bpv-header-mark.png" alt="" aria-hidden="true" /><span class="brand-wordmark">Boston Party Van</span></span></a>
      <button class="menu-toggle" aria-label="Toggle menu">Menu</button>
      <nav class="main-nav"><a href="../../index.html#services">Trip Menu</a><a href="../../index.html#pricing">Estimate</a><a href="../../photos.html">Photos</a><a class="nav-cta" href="${quote}">Request a Quote</a></nav>
    </div>
  </header>
  <main class="winter-guide-content">
    <section class="section winter-guide-intro">
        <p class="eyebrow">Boston Party Van</p>
        <h1>${escape(page.heading)}</h1>
        <p>${escape(page.intro)}</p>
        <div class="hero-actions"><a class="btn btn-primary" href="${quote}">Request a Quote</a><a class="btn btn-ghost" href="../../index.html#services">View Trip Options</a></div>
        <p class="holiday-availability"><strong>Now accepting inquiries.</strong> Availability confirmed before booking. Closed Dec 25-Jan 4.</p>
    </section>
    ${sections}
    <section class="section"><h2>Frequently asked questions</h2><div class="faq-list">${page.faqs.map(([q, a]) => `<details><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`).join("\n")}</div></section>
    <section class="section"><h2>Plan your private winter ride</h2><p>Send Andrew your date, headcount, pickup, destination, and timing. Your quote is built around the whole itinerary. This is an inquiry, not a booking or payment.</p><div class="hero-actions"><a class="btn btn-primary" href="${quote}">Request your trip quote</a><a class="btn btn-ghost" href="../../index.html#pricing">Estimate your ride</a></div></section>
    <section class="section"><h2>More holiday and winter trips</h2><ul>${related}<li><a href="../../photos.html">See the actual van and passenger seating</a></li></ul></section>
  </main>
  <footer class="site-footer"><div><h3>Boston Party Van</h3><p>Private transportation for Greater Boston and New England.</p></div><div><a href="../../index.html">Home</a></div><div><a href="${quote}">Request a Quote</a></div></footer>
  <script src="../../script.js?v=1.6.3-inquiries"></script>
</body>
</html>
`;
    const directory = path.join(root, "guides", page.slug);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, "index.html"), html.split("\n").map((line) => line.trimEnd()).join("\n"));
    console.log(page.slug);
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
