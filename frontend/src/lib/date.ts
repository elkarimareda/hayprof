import { parse, parseISO, format, differenceInMinutes } from "date-fns";

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

export type TimeString = string; // "HH:mm" expected

// Parse "HH:mm" into a Date anchored to 2000-01-01
export function parseTime(
  time: TimeString,
  baseDate = new Date(2000, 0, 1)
): Date {
  return parse(time, "HH:mm", baseDate);
}

// Accepts "HH:mm" or ISO date string or Date, returns formatted string like "9:30 AM"
export function formatTime(value: TimeString | Date, fmt = "h:mm a"): string {
  const d =
    typeof value === "string"
      ? value.includes(":") && !value.includes("T")
        ? parseTime(value)
        : parseISO(value)
      : value;
  return format(d, fmt);
}

// Calculate hours between two "HH:mm" strings (returns 0 if negative)
export function calculateDurationHours(
  start: TimeString,
  end: TimeString
): number {
  const s = parseTime(start);
  const e = parseTime(end);
  const minutes = differenceInMinutes(e, s);
  return minutes > 0 ? minutes / 60 : 0;
}

// Calculate total hours from a schedule array [{ start_time, end_time }]
export function calculateTotalHoursFromSchedule<
  T extends { start_time?: string; end_time?: string }[],
>(schedule: T): number {
  return schedule.reduce((sum, slot) => {
    if (!slot?.start_time || !slot?.end_time) return sum;
    return sum + calculateDurationHours(slot.start_time, slot.end_time);
  }, 0);
}
