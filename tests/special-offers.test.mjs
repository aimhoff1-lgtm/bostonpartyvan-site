import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../script.js", import.meta.url), "utf8");
const config = script.slice(0, script.indexOf("const SPECIAL_OFFERS_ENABLED"));
const sportsHelpers = script.slice(
  script.indexOf("const SPORTS_SPECIAL_VENUES"),
  script.indexOf("function setSelectOptions")
);

function sportsState(enabled, venue, direction) {
  return JSON.parse(vm.runInNewContext(`
    ${config}
    SITE_CONFIG.specialOffersEnabled = ${enabled};
    const SPECIAL_OFFERS_ENABLED = SITE_CONFIG.specialOffersEnabled === true;
    ${sportsHelpers}
    JSON.stringify({
      eligible: isSportsSpecialVenue(${JSON.stringify(venue)}),
      options: getSportsPlanOptions(${JSON.stringify(venue)}, ${JSON.stringify(direction)}),
      hint: getSportsPlanHint(${JSON.stringify(venue)})
    });
  `));
}

test("special offers are disabled by default", () => {
  assert.equal(vm.runInNewContext(`${config}\nSITE_CONFIG.specialOffersEnabled`), false);
});

test("all four original deal cards are retained in an inert template", () => {
  const archive = html.match(/<template id="archivedSpecialOffers">([\s\S]*?)<\/template>/);
  assert.ok(archive);
  assert.equal((archive[1].match(/data-package-card/g) || []).length, 4);
  for (const trip of ["early-booking", "airport-transfer", "sports-dropoff", "wedding-offer"]) {
    assert.ok(archive[1].includes(`data-quote-trip="${trip}"`));
  }
  assert.doesNotMatch(html.replace(archive[0], ""), /id="offers"|class="[^"]*offer-card/);
});

test("archived sports specials cannot be selected for any venue or direction", () => {
  for (const venue of ["td-garden", "fenway-park", "white-stadium", "gillette-stadium", "other"]) {
    for (const direction of ["", "oneWay", "roundTrip"]) {
      const state = sportsState(false, venue, direction);
      assert.equal(state.eligible, false);
      assert.deepEqual(state.options.map((option) => option.value), ["", "custom"]);
      assert.doesNotMatch(JSON.stringify(state), /special|\$400|\$600/i);
    }
  }
});

test("restoring offers preserves the original venue and direction restrictions", () => {
  for (const venue of ["td-garden", "fenway-park", "white-stadium"]) {
    assert.deepEqual(sportsState(true, venue, "oneWay").options.map((option) => option.value), ["", "dropoff", "custom"]);
    assert.deepEqual(sportsState(true, venue, "roundTrip").options.map((option) => option.value), ["", "roundTrip", "custom"]);
  }
  assert.equal(sportsState(true, "gillette-stadium", "oneWay").eligible, false);
});

test("FAQ structured data remains valid and no longer advertises specials", () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(blocks.length);
  for (const [, source] of blocks) {
    const data = JSON.parse(source);
    assert.doesNotMatch(JSON.stringify(data), /specials|game-day special|current airport offers|current wedding offers/i);
  }
});
