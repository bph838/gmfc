"use strict";

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const PLUGIN_NAME = "GenerateCalendarIcsPlugin";

function pad(n) {
  return String(n).padStart(2, "0");
}

function isAllDay(value) {
  return typeof value === "string" && !value.includes(" ");
}

// All-day "YYYY-MM-DD" -> "YYYYMMDD"; timed "YYYY-MM-DD HH:MM:SS" -> "YYYYMMDDTHHMMSS".
// Timed values are emitted as floating local time (no trailing Z / TZID).
function formatDateValue(value, { addDay = false } = {}) {
  if (isAllDay(value)) {
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + (addDay ? 1 : 0)));
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
  }

  const [datePart, timePart] = value.split(" ");
  const [y, m, d] = datePart.split("-");
  const [hh, mm, ss] = timePart.split(":");
  return `${y}${m}${d}T${hh}${mm}${ss || "00"}`;
}

function formatTimestamp(date) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeText(str) {
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function uidFor(event) {
  const hash = crypto
    .createHash("md5")
    .update(`${event.title}${event.start}${event.end}`)
    .digest("hex");
  return `${hash}@gmfc.uk`;
}

class GenerateCalendarIcsPlugin {
  /**
   * Reads the site calendar events file and writes it out as an RFC 5545 iCalendar
   * (.ics) feed to .build/site/calendar.ics. Date-only "start"/"end" values (e.g.
   * "2026-01-17") become all-day events; "YYYY-MM-DD HH:MM:SS" values become timed
   * events in floating local time. Relative "url" values are prefixed with baseUrl.
   *
   * @param {string} [eventsFile] Path to calendarevents.json (relative to the project root).
   * @param {object} [options]
   * @param {string} [options.baseUrl] Site origin to prefix relative event URLs with.
   * @param {string} [options.outputFile] Path (relative to the project root) to write the .ics file to.
   */
  constructor(
    eventsFile = "./src/database/site/calendarevents.json",
    { baseUrl = "https://www.gmfc.uk", outputFile = "./.build/site/calendar.ics" } = {},
  ) {
    this.eventsFile = eventsFile;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.outputFile = outputFile;
  }

  apply(compiler) {
    const absEventsFile = path.resolve(compiler.context, this.eventsFile);
    const absOutputFile = path.resolve(compiler.context, this.outputFile);

    const run = () => this.writeCalendar(absEventsFile, absOutputFile);
    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, run);
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, run);
  }

  async writeCalendar(absEventsFile, absOutputFile) {
    if (!fs.existsSync(absEventsFile)) return;

    const events = JSON.parse(await fs.promises.readFile(absEventsFile, "utf8"));
    const ics = this.buildIcs(events);

    // This file may live under a watched directory, so rewriting it unconditionally
    // on every watchRun (even with unchanged content) would retrigger the watcher
    // and rebuild forever. Only write when the content actually changes.
    if (fs.existsSync(absOutputFile)) {
      const existing = await fs.promises.readFile(absOutputFile, "utf8");
      if (existing === ics) return;
    }

    await fs.promises.mkdir(path.dirname(absOutputFile), { recursive: true });
    await fs.promises.writeFile(absOutputFile, ics);
  }

  buildIcs(events) {
    const dtstamp = formatTimestamp(new Date());

    const veventBlocks = events.map((event) => {
      const allDay = isAllDay(event.start);
      const url = /^https?:\/\//.test(event.url) ? event.url : `${this.baseUrl}${event.url}`;

      const dtstart = allDay
        ? `DTSTART;VALUE=DATE:${formatDateValue(event.start)}`
        : `DTSTART:${formatDateValue(event.start)}`;
      const dtend = allDay
        ? `DTEND;VALUE=DATE:${formatDateValue(event.end, { addDay: true })}`
        : `DTEND:${formatDateValue(event.end)}`;

      return [
        "BEGIN:VEVENT",
        `UID:${uidFor(event)}`,
        `DTSTAMP:${dtstamp}`,
        dtstart,
        dtend,
        `SUMMARY:${escapeText(event.title)}`,
        `URL:${escapeText(url)}`,
        `DESCRIPTION:${escapeText(`You can find out more at ${url}`)}`,
        "END:VEVENT",
      ].join("\r\n");
    });

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gordano Model Flying Club//Calendar//EN",
      "CALSCALE:GREGORIAN",
      ...veventBlocks,
      "END:VCALENDAR",
    ].join("\r\n") + "\r\n";
  }
}

module.exports = GenerateCalendarIcsPlugin;
