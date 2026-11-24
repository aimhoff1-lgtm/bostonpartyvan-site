const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const output = path.resolve(root, "../tmp/inquiry-release");
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".xml": "application/xml" };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.resolve(root, `.${pathname.endsWith("/") ? `${pathname}index.html` : pathname}`);
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    const content = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" }).end(content);
  } catch { res.writeHead(404).end(); }
});

async function main() {
  await fs.mkdir(output, { recursive: true });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const origin = process.env.BPV_TEST_ORIGIN || `http://127.0.0.1:${server.address().port}`;
  const prefix = process.env.BPV_TEST_ORIGIN ? "live-" : "local-";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const errors = [];
  const reports = [];
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 320, height: 740 }]) {
      const context = await browser.newContext({ viewport });
      let behavior = "success";
      const payloads = [];
      await context.addInitScript(() => {
        window.dataLayer = [];
        window.gtag = (...args) => window.dataLayer.push(args);
      });
      await context.route("**/*", async (route) => {
        const url = route.request().url();
        if (url.startsWith("https://formsubmit.co/ajax/")) {
          payloads.push(route.request().postDataJSON());
          if (behavior === "failure") return route.fulfill({ status: 503, json: { success: false } });
          if (behavior === "activation") return route.fulfill({ json: { success: false, message: "Activation required" } });
          return route.fulfill({ json: { success: true } });
        }
        if (url === `${origin}/api/quote-receipt`) return route.fulfill({ json: { success: true } });
        if (url.startsWith(origin + "/") || /^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url)) return route.continue();
        return route.fulfill({ status: 200, body: "" });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(20000);
      page.on("pageerror", (error) => errors.push(error.message));
      await page.clock.setFixedTime(new Date("2026-11-23T17:00:00Z"));
      async function visit(url) {
        const response = await page.goto(url, { waitUntil: "load" });
        assert.equal(response.status(), 200, url);
        await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
        await page.evaluate(() => document.fonts.ready);
      }
      async function noOverflow() {
        const dimensions = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
        assert.ok(dimensions[0] <= dimensions[1] + 1, `${page.url()}: ${dimensions}`);
      }
      await visit(origin);
      await page.waitForFunction(() => document.querySelector(".hero").classList.contains("in-view"));
      await page.evaluate(async () => { const img = new Image(); img.src = "/assets/images/boston-skyline-river-dusk.webp"; await img.decode(); });
      assert.match(await page.locator(".hero").evaluate((el) => getComputedStyle(el).backgroundImage), /boston-skyline-river-dusk/);
      assert.equal(await page.locator("#offers").count(), 0);
      assert.equal(await page.locator(".winter-trip").count(), 2);
      await noOverflow();
      const framing = await page.evaluate(() => ({
        nextSectionTop: document.querySelector(".quick-action-label").getBoundingClientRect().bottom,
        visibleBottom: innerHeight - (document.querySelector(".mobile-callbar").getBoundingClientRect().height || 0),
      }));
      assert.ok(framing.nextSectionTop < framing.visibleBottom, JSON.stringify(framing));
      await page.screenshot({ path: path.join(output, `${prefix}home-${viewport.width}.png`), animations: "disabled" });
      console.log(`Homepage checked at ${viewport.width}px`);
      if (viewport.width < 600) {
        assert.equal(await page.locator(".mobile-callbar a").count(), 2);
        await page.locator(".menu-toggle").click();
        assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "true");
        await page.keyboard.press("Escape");
        assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
        await page.locator(".menu-toggle").click();
        await page.locator(".main-nav a[href='#quote']").click();
        assert.equal(await page.locator(".menu-toggle").getAttribute("aria-expanded"), "false");
      }

      const landing = "/guides/boston-ski-trip-transportation/?utm_source=google&utm_medium=cpc&utm_campaign=winter-test&gclid=test-click";
      await visit(origin + landing);
      await noOverflow();
      await page.locator(".winter-guide-intro a[href$='#quote']").click();
      await page.waitForURL((url) => ["/", "/index.html"].includes(url.pathname) && url.hash === "#quote");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      const form = page.locator("#quoteForm");
      assert.equal(await form.locator('[name="utm_campaign"]').inputValue(), "winter-test");
      assert.equal(await form.locator('[name="lead_landing_page"]').inputValue(), "/");
      assert.equal(await form.locator('[name="lead_last_landing_page"]').inputValue(), landing);
      await form.locator('[name="name"]').fill("Browser Test");
      await form.locator('[name="email"]').fill("browser-test@example.com");
      await form.locator('[name="eventType"]').selectOption("other");
      await form.locator(".segment-option").filter({ hasText: "Round trip" }).click();
      await form.locator('[name="pickupDate"]').fill("2026-12-10");
      await form.locator('[name="pickup"]').fill("Somerville");
      await form.locator('[name="dropoff"]').fill("Gillette Stadium");
      await form.locator(".quote-details > summary").click();
      await form.locator('[name="contactPreference"]').selectOption("text");
      assert.equal(await form.locator('[name="phone"]').getAttribute("required"), "");
      await form.locator('[name="contactPreference"]').selectOption("call");
      assert.equal(await form.locator('[name="phone"]').getAttribute("required"), "");
      await form.locator('[name="contactPreference"]').selectOption("email");
      assert.equal(await form.locator('[name="phone"]').getAttribute("required"), null);
      await form.locator('[name="guestCount"]').fill("12");
      const submit = form.locator('button[type="submit"]');
      for (const date of ["2026-12-25", "2027-01-04"]) {
        await form.locator('[name="pickupDate"]').fill(date);
        assert.equal(await submit.isDisabled(), true);
      }
      await form.locator('[name="pickupDate"]').fill("2026-12-10");
      assert.equal(await form.evaluate((el) => el.checkValidity()), true);
      if (viewport.width < 600) {
        await form.locator('[name="name"]').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector(".mobile-callbar").classList.contains("is-hidden"));
        assert.equal(await page.locator(".mobile-callbar").isVisible(), false);
      }
      await noOverflow();
      await page.locator("#quote").screenshot({ path: path.join(output, `${prefix}quote-${viewport.width}.png`), animations: "disabled", style: ".site-header { visibility:hidden !important; }" });

      await page.evaluate(() => {
        window.originalFetch = window.fetch;
        window.originalSetTimeout = window.setTimeout;
        window.pendingIntakes = 0;
        window.setTimeout = (callback, delay, ...args) => {
          if (delay === 20000) window.requestedIntakeTimeout = delay;
          return window.originalSetTimeout(callback, delay === 20000 ? 250 : delay, ...args);
        };
        window.fetch = (url, options) => {
          if (!String(url).startsWith("https://formsubmit.co/ajax/")) return window.originalFetch(url, options);
          window.pendingIntakes++;
          return new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
        };
      });
      await form.evaluate((el) => { el.requestSubmit(); el.requestSubmit(); });
      await page.waitForFunction(() => document.querySelector("#quoteSuccess").classList.contains("error"));
      assert.equal(await page.evaluate(() => window.pendingIntakes), 1);
      assert.equal(await page.evaluate(() => window.requestedIntakeTimeout), 20000);
      assert.match(await page.locator("#quoteSuccess").textContent(), /confirm delivery in time/);
      assert.equal(await submit.isDisabled(), false);
      assert.equal(await form.locator('[name="name"]').inputValue(), "Browser Test");
      await page.evaluate(() => { window.fetch = window.originalFetch; window.setTimeout = window.originalSetTimeout; });

      for (const mode of ["failure", "activation"]) {
        behavior = mode;
        await submit.click();
        await page.waitForFunction(() => document.querySelector("#quoteSuccess").classList.contains("error"));
        assert.equal(await form.locator('[name="name"]').inputValue(), "Browser Test");
        assert.equal(await page.locator(".quote-email-fallback").isVisible(), true);
        assert.equal(await submit.isDisabled(), false);
        assert.equal(await page.evaluate(() => window.dataLayer.filter((event) => event[1] === "generate_lead").length), 0);
      }
      behavior = "success";
      await submit.click();
      await page.waitForFunction(() => document.querySelector("#quoteSuccess").classList.contains("success"));
      assert.match(await page.locator("#quoteSuccess").textContent(), /by email/);
      assert.equal(await form.locator('[name="name"]').inputValue(), "");
      assert.equal(await page.locator(".quote-email-fallback").isVisible(), false);
      assert.equal(payloads.length, 3);
      assert.equal(payloads.at(-1)["Latest landing page"], landing);
      assert.match(payloads.at(-1)["Lead source"], /winter-test/);
      const events = await page.evaluate(() => window.dataLayer.map((event) => Array.from(event)));
      assert.equal(events.filter((event) => event[1] === "generate_lead").length, 1);
      assert.equal(events.filter((event) => event[1] === "conversion").length, 1);
      assert.equal(events.filter((event) => event[1] === "quote_form_error").length, 3);
      assert.ok(!JSON.stringify(events).includes("browser-test@example.com"));
      assert.ok(!JSON.stringify(events).includes("Browser Test"));

      await visit(origin + "/guides/boston-sporting-event-transportation/");
      assert.equal(await page.locator("#gillette-transportation").count(), 1);
      await noOverflow();
      if (viewport.width === 1440) {
        const sitemap = await (await context.request.get(origin + "/sitemap.xml")).text();
        const urls = await page.evaluate((xml) => [...new DOMParser().parseFromString(xml, "application/xml").querySelectorAll("loc")].map((node) => node.textContent), sitemap);
        for (const canonical of urls) {
          const pathname = new URL(canonical).pathname;
          const response = await context.request.get(origin + pathname);
          assert.equal(response.status(), 200, pathname);
          const markup = await response.text();
          const details = await page.evaluate((html) => {
            const doc = new DOMParser().parseFromString(html, "text/html");
            return {
              headings: doc.querySelectorAll("h1").length,
              canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href"),
              title: doc.title,
              description: doc.querySelector('meta[name="description"]')?.content,
              schema: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((node) => JSON.parse(node.textContent)),
              scripts: [...doc.querySelectorAll("script[src]")].map((node) => node.getAttribute("src")),
            };
          }, markup);
          assert.equal(details.headings, 1, pathname);
          assert.equal(details.canonical, canonical, pathname);
          assert.ok(details.title && details.description, pathname);
          assert.ok(details.schema.length, pathname);
          assert.ok(details.scripts.some((src) => src.includes("script.js?v=1.6.3-inquiries")), pathname);
        }
        console.log(`Checked ${urls.length} sitemap pages, canonical URLs, structured data, and current tracking assets`);
      }
      reports.push({ width: viewport.width, passed: true, mockedSubmissions: payloads.length });
      console.log(`Inquiry success, failures, timeout, duplicate protection, and tracking checked at ${viewport.width}px`);
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ origin, reports, screenshots: output, pageErrors: errors }, null, 2));
  } finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => { console.error(error); server.close(); process.exitCode = 1; });
