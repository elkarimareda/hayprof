export const getTimeZoneOptions = () => {
  const timeZones = Intl.supportedValuesOf("timeZone");
  const now = new Date();

  return timeZones.map((tz) => {
    // Get formatted offset (like GMT+1, GMT-5:30, etc.)
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";

    return { value: tz, label: `${tz} (${offset})` };
  });
};
