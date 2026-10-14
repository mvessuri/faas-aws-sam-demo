import { test } from "node:test";
import assert from "node:assert/strict";

process.env.HOME_TIMEZONE = "America/Argentina/Buenos_Aires";
const { handler, timeIn } = await import("../src/clock.mjs");

// A fixed instant so results don't depend on when the tests run: Wednesday 15:30 UTC
const now = new Date("2026-01-14T15:30:00Z");

test("returns the local time in Tokyo", async () => {
  const res = timeIn("tokyo", now);
  const body = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.equal(body.localTime, "Thursday 00:30");
  assert.equal(body.greeting, "Good night from tokyo!");
  assert.equal(body.workingHours, false);
  assert.equal(body.hoursFromHome, 12);
});

test("cities behind home get a negative difference", async () => {
  const res = timeIn("san-francisco", now);
  const body = JSON.parse(res.body);
  assert.equal(body.localTime, "Wednesday 07:30");
  assert.equal(body.hoursFromHome, -5);
});

test("city names are case-insensitive", async () => {
  const res = await handler({ pathParameters: { city: "London" } });
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).city, "london");
});

test("unknown cities return 404 with the list of options", async () => {
  const res = timeIn("atlantis", now);
  assert.equal(res.statusCode, 404);
  assert.ok(JSON.parse(res.body).availableCities.includes("tokyo"));
});
