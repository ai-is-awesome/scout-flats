export const constructFBProfileUrl = (authorId: string) =>
  `https://www.facebook.com/profile.php?id=${authorId}`;

export function extractPostId(url: string): string {
  const m =
    url.match(/\/posts\/(\d+)/) ??
    url.match(/\/permalink\/(\d+)/) ??
    url.match(/multi_permalinks=(\d+)/) ??
    url.match(/story_fbid=(\d+)/);
  return m?.[1] ?? "";
}

export function extractGroupId(url: string): string {
  return url.match(/\/groups\/(\d+)/)?.[1] ?? "";
}

export function extractAuthorId(profileUrl: string): string {
  return (
    profileUrl.match(/\/user\/(\d+)/)?.[1] ??
    profileUrl.match(/profile\.php\?id=(\d+)/)?.[1] ??
    ""
  );
}

// Indian mobile — 10 digits starting 6-9, with optional +91/91/0 prefix.
const PHONE_REGEX =
  /(?<!\d)(?:\+?91|0{1,2}91|0)?[6-9]\d{2}[.-]?\d{3}[.-]?\d{4}(?!\d)/g;

export function extractPhones(text: string): string[] {
  function toE164(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith("0091")) return `+${digits.slice(2)}`;
    if (digits.startsWith("091")) return `+${digits.slice(1)}`;
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.startsWith("0") && digits.length === 11)
      return `+91${digits.slice(1)}`;
    return `+${digits}`;
  }

  // Collapse spaces (and tabs) anywhere inside a run of digits separated only
  // by whitespace. "9 8 7 6 5 4 3 2 1 0" → "9876543210". Doesn't touch
  // digits separated by other text.
  const normalized = text.replace(/\d(?:\s+\d)+/g, (run) =>
    run.replace(/\s+/g, "")
  );

  const matches = normalized.match(PHONE_REGEX) ?? [];
  return [...new Set(matches.map(toE164))];
}
