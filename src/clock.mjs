// GET /time/{city} - what time is it there, and how far is it from home?
const CITIES = {
  "buenos-aires": "America/Argentina/Buenos_Aires",
  "new-york": "America/New_York",
  "san-francisco": "America/Los_Angeles",
  london: "Europe/London",
  madrid: "Europe/Madrid",
  tokyo: "Asia/Tokyo",
  sydney: "Australia/Sydney",
};

// Configured in template.yaml, so it can change without touching code
const HOME_TIMEZONE = process.env.HOME_TIMEZONE ?? "UTC";

// Minutes east of UTC for a time zone at a given instant, e.g. "GMT+09:00" -> 540
const offsetMinutes = (timeZone, date) => {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName").value;
  const match = name.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0; // plain "GMT"
  const [, sign, h, m] = match;
  return (sign === "-" ? -1 : 1) * (Number(h) * 60 + Number(m));
};

const greetingFor = (hour) =>
  hour < 6 ? "Good night" : hour < 12 ? "Good morning" : hour < 19 ? "Good afternoon" : "Good evening";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Pure logic, kept apart from the handler so tests can pin the clock
export const timeIn = (city, now = new Date()) => {
  const timeZone = CITIES[city];

  if (!timeZone) {
    return json(404, { error: `Unknown city: ${city}`, availableCities: Object.keys(CITIES) });
  }

  const localTime = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(now));
  const hoursFromHome = (offsetMinutes(timeZone, now) - offsetMinutes(HOME_TIMEZONE, now)) / 60;

  return json(200, {
    city,
    timeZone,
    localTime,
    greeting: `${greetingFor(hour)} from ${city}!`,
    workingHours: hour >= 9 && hour < 18,
    hoursFromHome,
    home: HOME_TIMEZONE,
  });
};

export const handler = async (event) => {
  const city = event.pathParameters?.city?.toLowerCase();
  console.log(`Time requested for ${city}`);
  return timeIn(city);
};
