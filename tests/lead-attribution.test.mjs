import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const script = await readFile(new URL("../script.js", import.meta.url), "utf8");
const constants = script.slice(script.indexOf("const ATTRIBUTION_STORAGE_KEY"), script.indexOf("function toTitleCase"));
const helpers = script.slice(script.indexOf("function readAttributionStorage"), script.indexOf("function populateAttributionFields"));

function visitor(initialValue) {
  let storage = initialValue || "";
  const context = vm.createContext({
    URL, URLSearchParams,
    window: { location: new URL("https://www.bostonpartyvan.com/") },
    document: { referrer: "" },
    localStorage: {
      getItem: () => storage,
      setItem: (_key, value) => { storage = value; },
    },
  });
  vm.runInContext(`${constants}\nfunction normalizeValue(value) { return String(value || "").trim(); }\n${helpers}`, context);
  return {
    context,
    visit(path, referrer = "") {
      context.window.location = new URL(path, "https://www.bostonpartyvan.com");
      context.document.referrer = referrer;
      return JSON.parse(vm.runInContext("JSON.stringify(buildAttributionSnapshot())", context));
    },
  };
}

test("guide entry preserves campaign, ad ID, and landing page through the inquiry", () => {
  const user = visitor();
  const landing = "/guides/boston-ski-trip-transportation/?utm_source=google&utm_medium=cpc&utm_campaign=winter&gclid=click-1";
  user.visit(landing, "https://www.google.com/");
  const result = user.visit("/index.html", `https://www.bostonpartyvan.com${landing}`);
  assert.equal(result.utm_source, "google");
  assert.equal(result.utm_campaign, "winter");
  assert.equal(result.gclid, "click-1");
  assert.equal(result.first_landing_page, landing);
  assert.equal(result.last_landing_page, landing);
  assert.equal(result.last_referrer, "https://www.google.com/");
});

test("a paid visit replaces an earlier direct classification", () => {
  const user = visitor();
  user.visit("/");
  const result = user.visit("/?gclid=new-click");
  assert.equal(result.utm_source, "google");
  assert.equal(result.utm_medium, "cpc");
  assert.equal(result.gclid, "new-click");
  assert.equal(result.first_landing_page, "/");
});

test("new campaigns clear stale paid click IDs and unrelated campaign fields", () => {
  const user = visitor();
  user.visit("/?gclid=old-click&utm_source=google&utm_campaign=summer&utm_term=airport");
  const result = user.visit("/?utm_source=instagram&utm_medium=social&utm_campaign=holiday");
  assert.equal(result.lead_source_summary, "instagram / social | holiday");
  assert.equal(result.gclid, undefined);
  assert.equal(result.utm_term, undefined);
});

test("organic search is distinct from paid traffic and clears old ad attribution", () => {
  const user = visitor();
  user.visit("/?gclid=old-click&utm_campaign=summer");
  const result = user.visit("/guides/boston-holiday-party-transportation/", "https://www.google.com/search?q=holiday");
  assert.equal(result.utm_source, "google");
  assert.equal(result.utm_medium, "organic");
  assert.equal(result.gclid, undefined);
  assert.equal(result.utm_campaign, undefined);
});

test("Google country domains, Bing, and referrals are identified", () => {
  for (const [referrer, source, medium] of [
    ["https://www.google.co.uk/search?q=van", "google", "organic"],
    ["https://www.bing.com/search?q=van", "bing", "organic"],
    ["https://duckduckgo.com/", "duckduckgo", "organic"],
    ["https://local.example.com/boston", "local.example.com", "referral"],
  ]) {
    const result = visitor().visit("/", referrer);
    assert.equal(result.utm_source, source);
    assert.equal(result.utm_medium, medium);
  }
});

test("internal navigation is not a referral, including the apex domain", () => {
  const result = visitor().visit("/index.html", "https://bostonpartyvan.com/photos.html");
  assert.equal(result.utm_source, "direct");
  assert.equal(result.utm_medium, "none");
});

test("a direct return preserves the previous campaign without changing first landing", () => {
  const user = visitor();
  user.visit("/guides/boston-ski-trip-transportation/?utm_source=newsletter&utm_medium=email");
  const result = user.visit("/");
  assert.equal(result.utm_source, "newsletter");
  assert.match(result.first_landing_page, /boston-ski-trip/);
});

test("malformed or disabled storage does not block inquiries", () => {
  assert.equal(visitor("not JSON").visit("/").utm_source, "direct");
  const user = visitor();
  user.context.localStorage.getItem = () => { throw new Error("Blocked"); };
  user.context.localStorage.setItem = () => { throw new Error("Blocked"); };
  assert.equal(user.visit("/?gclid=test").utm_medium, "cpc");
});

test("attribution is captured before the form-only branch on every page", () => {
  assert.ok(script.indexOf("const initialAttribution = buildAttributionSnapshot();") < script.indexOf("if (quoteForm && quoteSuccess)"));
});
