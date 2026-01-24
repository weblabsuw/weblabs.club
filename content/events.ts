import * as chrono from 'chrono-node';

export const csvURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTPSyppMint-P9hXfeiW2yOz3Bp6DX2R8qZR4c1jB5s5IBMJoV2_rxxbL7lHhlDPzUty8hB442KcNlN/pub?output=csv";

export const calendarLink =
  "https://calendar.google.com/calendar/u/1?cid=MWNiMzVjNTFhZjE1NGI2ZTg4OWU1MWFmNzI3MGI3ZDk0MjRhYTJhNjQ5YzBhNWFmODUzYmVmNmFiYzJkNDdjZEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t";

export interface Event {
  title: string;
  description: string;
  date: chrono.ParsedResult | string | null;
  status: "past" | "planned";
  link?: string;
  key: string;
}

const dateConfig: Intl.DateTimeFormatOptions = {
  timeZone: "America/Chicago",
  weekday: "short",
  month: "short",
  day: "numeric",
};

const timeConfig: Intl.DateTimeFormatOptions = {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
};

export const formatDate = (date: string | chrono.ParsedResult): string => {
  if (typeof date === "string") return date;
  const builder = [];
  builder.push(date.start.date().toLocaleDateString("en-US", dateConfig));
  if (date.start.isCertain("hour")) {
    builder.push(", ");
    builder.push(
      date.start.date().toLocaleTimeString("en-US", timeConfig)
    );
  }
  // support end date/time if available
  if (date.end) builder.push(" - ");
    
  // if end date is different from start date, show full date
  if (date.end && date.end.date().toDateString() !== date.start.date().toDateString()) {
    builder.push(date.end.date().toLocaleDateString("en-US", dateConfig));
    if (date.end.isCertain("hour")) {
      builder.push(", ");
    }
  }

  if (date.end && date.end.isCertain("hour")) {
    builder.push(
      date.end.date().toLocaleTimeString("en-US", timeConfig)
    );
  }

  return builder.join("");
}

export function sortEvents(events: Event[]): [Event[], [string, Event[]][], number] {
  const pastEvents = [];
  const plannedEvents = [];
  const pastCutoff = new Date().getTime() - 1000 * 60 * 60 * 24 * 7 * 4; // 4 weeks ago

  for (const event of events) {
    if (event.date instanceof Object && event.date.start.date().getTime() < pastCutoff) {
      pastEvents.push(event);
    } else {
      plannedEvents.push(event);
    }
  }
  // show most recent past events first
  pastEvents.reverse();
  // group past events by semester
  const groupedPastEvents = pastEvents.reduce(
    (acc: Record<string, Event[]>, event) => {
      let semester = "Other";
      if (event.date instanceof Date) {
        const year = event.date.getFullYear();
        const month = event.date.getMonth();
        if (month < 6) {
          semester = `${year} Spring`;
        } else {
          semester = `${year} Fall`;
        }
      }
      acc[semester] = [...(acc[semester] || []), event];
      return acc;
    },
    {}
  );
  return [plannedEvents, Object.entries(groupedPastEvents), pastEvents.length];
}

export async function fetchEvents(): Promise<Event[]> {
  const response = await fetch(csvURL, { cache: "no-cache"});
  const csvText = await response.text();

  const lines = csvText.trim().split("\n");

  const events = lines
    .slice(1)
    .map((line) => {
      // Simple CSV parsing that handles quoted fields
      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] === ",")) {
          inQuotes = true;
        } else if (
          char === '"' &&
          inQuotes &&
          (i === line.length - 1 || line[i + 1] === ",")
        ) {
          inQuotes = false;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
          continue;
        } else if (
          char !== '"' ||
          (char === '"' && inQuotes && line[i + 1] === '"')
        ) {
          current += char;
          if (char === '"' && inQuotes && line[i + 1] === '"') i++; // Skip next quote
        }
      }
      values.push(current.trim());

      const eventTitle = values[0];
      const description = values[1] || "";
      const dateStr = values[2];
      const link = values[3] || "";

      let status: "past" | "planned" = "planned";

      const date = dateStr ? chrono.strict.parse(dateStr)[0] || dateStr : null;
      // Parse date and determine status
      if (date instanceof Object) {
        status = date.start.date() < new Date() ? "past" : "planned";
      }

      const key = `${eventTitle}-${dateStr}-${Math.random().toString(36).substring(2, 8)}`;

      return {
        title: eventTitle,
        description,
        date,
        status,
        link: link || undefined,
        key
      };
    })
    .filter((event) => event.title); // Filter out empty rows

  return events;
}
