/**
 * Dilki & Isuru — Wedding RSVP + Wishes (Google Apps Script Web App)
 *
 * Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1oik6bG44y_OU_PirWAUEensAoBhPtg6H11-uTqDszsA/edit
 *
 * The "RSVP" and "Wishes" sheets (with headers) are created automatically
 * on the first request. You can also run setup() once from the editor.
 *
 * Endpoints (same /exec URL):
 *   POST action=rsvp   name, attendance, guests, invitedAs
 *   POST action=wish   name, message, invitedAs
 *   GET  action=wishes [limit]   → approved wishes for the website
 *
 * Wishes moderation: untick "Show on Website" in the Wishes sheet to hide a wish.
 */

const SPREADSHEET_ID = "1oik6bG44y_OU_PirWAUEensAoBhPtg6H11-uTqDszsA";
const TIMEZONE = "Asia/Colombo";

const SHEETS = {
  rsvp: {
    name: "RSVP",
    headers: ["Timestamp", "Name", "Attendance", "Guests", "Invited As (Link)"],
    widths: [170, 220, 130, 80, 220],
    color: "#2f7a55",
  },
  wishes: {
    name: "Wishes",
    headers: ["Timestamp", "Name", "Wish", "Invited As (Link)", "Show on Website"],
    widths: [170, 200, 420, 220, 130],
    color: "#1f5a3d",
  },
};

/* ------------------------------------------------------------------ */
/*  Entry points                                                      */
/* ------------------------------------------------------------------ */

function doPost(e) {
  return handleRequest_(e);
}

function doGet(e) {
  return handleRequest_(e);
}

/** Optional: run once from the Apps Script editor to create both sheets now. */
function setup() {
  getSheet_(SHEETS.rsvp);
  getSheet_(SHEETS.wishes);
}

function handleRequest_(e) {
  try {
    const params = parseParams_(e);
    const action = String(params.action || "").trim().toLowerCase();

    if (action === "rsvp") return jsonResponse_(saveRsvp_(params));
    if (action === "wish") return jsonResponse_(saveWish_(params));
    if (action === "wishes") return jsonResponse_(listWishes_(params));

    if (!action) {
      return jsonResponse_({ ok: true, message: "Wedding RSVP API is running" });
    }

    return jsonResponse_({ ok: false, message: "Invalid action" });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error && error.message ? error.message : "Unexpected error",
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Actions                                                           */
/* ------------------------------------------------------------------ */

function saveRsvp_(params) {
  const name = clean_(params.name, 120);
  if (!name) return { ok: false, message: "Name is required" };

  let attendance = clean_(params.attendance, 40);
  let guests = parseInt(params.guests, 10);
  if (isNaN(guests) || guests < 0) guests = 1;
  if (guests > 50) guests = 50;

  if (!attendance) attendance = guests === 0 ? "Not Attending" : "Attending";
  if (attendance === "Not Attending") guests = 0;

  appendRow_(SHEETS.rsvp, [
    new Date(),
    name,
    attendance,
    guests,
    clean_(params.invitedAs, 160),
  ]);

  return { ok: true, message: "RSVP saved" };
}

function saveWish_(params) {
  const name = clean_(params.name, 120);
  const message = clean_(params.message, 1500);

  if (!name || !message) {
    return { ok: false, message: "Name and message are required" };
  }

  appendRow_(SHEETS.wishes, [
    new Date(),
    name,
    message,
    clean_(params.invitedAs, 160),
    true,
  ]);

  return { ok: true, message: "Wish saved" };
}

function listWishes_(params) {
  const sheet = getSheet_(SHEETS.wishes);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { ok: true, wishes: [] };

  let limit = parseInt(params.limit, 10);
  if (isNaN(limit) || limit <= 0) limit = 30;
  if (limit > 200) limit = 200;

  const values = sheet.getRange(2, 1, lastRow - 1, SHEETS.wishes.headers.length).getValues();
  const wishes = [];

  for (let i = values.length - 1; i >= 0 && wishes.length < limit; i--) {
    const row = values[i];
    const show = row[4] === true || String(row[4]).toUpperCase() === "TRUE";
    if (!show || !row[1] || !row[2]) continue;

    wishes.push({
      timestamp: row[0] instanceof Date ? Utilities.formatDate(row[0], TIMEZONE, "yyyy-MM-dd HH:mm") : String(row[0]),
      name: String(row[1]),
      message: String(row[2]),
    });
  }

  return { ok: true, wishes: wishes };
}

/* ------------------------------------------------------------------ */
/*  Sheet helpers                                                     */
/* ------------------------------------------------------------------ */

function appendRow_(config, row) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const sheet = getSheet_(config);
    sheet.appendRow(row);

    const rowIndex = sheet.getLastRow();
    sheet.getRange(rowIndex, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

    if (config === SHEETS.wishes) {
      sheet.getRange(rowIndex, 5).insertCheckboxes().setValue(true);
      sheet.getRange(rowIndex, 3).setWrap(true);
    }
  } finally {
    lock.releaseLock();
  }
}

/** Returns the sheet, creating it and its header row when missing. */
function getSheet_(config) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(config.name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(config.name);
  }

  ensureHeader_(sheet, config);
  return sheet;
}

function ensureHeader_(sheet, config) {
  const width = config.headers.length;
  const firstRow = sheet.getLastRow() === 0
    ? []
    : sheet.getRange(1, 1, 1, width).getValues()[0];

  const hasHeader = firstRow.length > 0 && String(firstRow[0]).trim() !== "";
  if (hasHeader) return;

  if (sheet.getLastRow() > 0) {
    // Row 1 is blank but there is data below — make room for the header.
    sheet.insertRowBefore(1);
  }

  const header = sheet.getRange(1, 1, 1, width);
  header
    .setValues([config.headers])
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground(config.color)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 32);

  for (let i = 0; i < config.widths.length; i++) {
    sheet.setColumnWidth(i + 1, config.widths[i]);
  }

  // Remove the default empty columns beyond our table (keeps the sheet tidy).
  const maxColumns = sheet.getMaxColumns();
  if (maxColumns > width) {
    sheet.deleteColumns(width + 1, maxColumns - width);
  }
}

/* ------------------------------------------------------------------ */
/*  Request helpers                                                   */
/* ------------------------------------------------------------------ */

/** Trim, cap length, and stop spreadsheet formula injection. */
function clean_(value, maxLength) {
  let text = String(value == null ? "" : value).trim();
  if (maxLength && text.length > maxLength) text = text.slice(0, maxLength);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function parseParams_(e) {
  const params = Object.assign({}, (e && e.parameter) || {});

  if (!(e && e.postData && e.postData.contents)) {
    return params;
  }

  const contents = String(e.postData.contents || "").trim();
  if (!contents) return params;

  if (contents.charAt(0) === "{") {
    return Object.assign(params, JSON.parse(contents));
  }

  return Object.assign(params, parseFormEncoded_(contents));
}

function parseFormEncoded_(raw) {
  const result = {};
  const pairs = String(raw || "").split("&");

  for (let i = 0; i < pairs.length; i++) {
    if (!pairs[i]) continue;
    const parts = pairs[i].split("=");
    const key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
    const value = decodeURIComponent((parts.slice(1).join("=") || "").replace(/\+/g, " "));
    if (key) result[key] = value;
  }

  return result;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
