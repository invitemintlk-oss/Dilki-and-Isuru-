/* ------------------------------------------------------------------ */
/*  Wedding details — single source of truth for the site and /admin  */
/* ------------------------------------------------------------------ */

export const INVITATION = {
  couple: {
    /* Sinhala names shown on the invitation */
    bride: "දිල්කි",
    groom: "ඉසුරු",
    brideFull: "දිල්කි",
    groomFull: "ඉසුරු",
    /* English names used in the WhatsApp message, page title, etc. */
    brideEn: "Dilki",
    groomEn: "Isuru",
  },
  parents: {
    bride: "සුමිත් මහතාගේ සහ රමණී මහත්මියගේ ආදරණීය දියණිය වන",
    groom: "ඉලංගකෝන් මහතාගේ සහ තමරා මහත්මියගේ ආදරණීය පුත් වන",
  },
  date: {
    displayNumeric: "26 . 05 . 2027",
    displayLong: "වර්ෂ 2027 ක් වූ මැයි මස 26 වන දින",
    /* Countdown runs to the Poruwa ceremony */
    countdownTarget: "2027-05-26T08:58:00+05:30",
  },
  time: {
    poruwa: "පෙ.ව. 8:58",
    eventStart: "පෙ.ව. 10:00",
    eventEnd: "ප.ව. 4:00",
  },
  venue: {
    name: "Hotel Royal Ramesses",
    city: "Seeduwa",
    address: "අංක 09, අඹලන්මුල්ල, සීදූව.",
    mapQuery: "Hotel Royal Ramesses, Seeduwa, Sri Lanka",
    googleMapsLink:
      "https://www.google.com/maps/search/?api=1&query=Hotel%20Royal%20Ramesses%2C%20Seeduwa%2C%20Sri%20Lanka",
  },
  /* Add contact lines like "Name - +94 77 123 4567". Section hides when empty. */
  rsvpContacts: [] as string[],
} as const;

/** Google Apps Script Web App URL (code.gs → Deploy → Web app). */
export const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbywh7G46usMsHODXZ4Iv5BVfBkE0uXfF3Yyeqhc2f4xC0_j8Qls2yfd1wypumaNboB75w/exec";

export const BACKGROUND_MUSIC = "/handawaka-various-artists.mp3";
