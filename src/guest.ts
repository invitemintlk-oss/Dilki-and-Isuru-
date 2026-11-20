/* ------------------------------------------------------------------ */
/*  Guest name helpers shared by the invitation and the /admin page   */
/* ------------------------------------------------------------------ */

export const PREFIXES = ["Mr.", "Mrs.", "Miss", "Mr. & Mrs.", "Family", "Dear"] as const;
export type Prefix = (typeof PREFIXES)[number];

/** Collapse whitespace and trim. */
export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

/**
 * Combine prefix + name into the name shown to the guest.
 * "Dear" is a message style (the greeting already says "Dear"), so it adds nothing here.
 */
export function buildDisplayName(prefix: Prefix, guestName: string): string {
  const name = cleanName(guestName);
  if (!name) return "";

  switch (prefix) {
    case "Family":
      return `${name} and Family`;
    case "Dear":
      return name;
    default:
      return `${prefix} ${name}`;
  }
}

/** Greeting line for the WhatsApp message — never "Dear Dear …". */
export function buildGreeting(displayName: string): string {
  const name = displayName.replace(/^dear\s+/i, "").trim();
  return `Dear ${name} ❤️`;
}

/** Personalised link: {baseURL}/{displayName}, safely URL-encoded. */
export function buildInviteLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${encodeURIComponent(displayName)}`;
}

/** Read the guest name from /{name} (or the older ?to= links). */
export function getGuestNameFromUrl(): string | null {
  const segment = window.location.pathname.replace(/^\/+|\/+$/g, "");

  if (segment && segment.toLowerCase() !== "admin" && segment.toLowerCase() !== "index.html") {
    try {
      const decoded = cleanName(decodeURIComponent(segment));
      if (decoded) return decoded;
    } catch {
      /* malformed encoding — fall through */
    }
  }

  const legacy = new URLSearchParams(window.location.search).get("to");
  return legacy ? cleanName(legacy) || null : null;
}
