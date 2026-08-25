// URL validation shared by every place that consumes an untrusted URL:
// the GIF picker, the background fetch proxy, and the edit-history markdown
// renderer. Kept in one module so a fix here reaches all of them at once.

// Schemes safe to put in an href/src. Anything else - javascript:, data:,
// vbscript:, file: - is rejected. Note that relying on the host page's CSP to
// block javascript: is not a control we own, so we reject it ourselves.
const SAFE_SCHEMES = new Set(["https:", "http:", "mailto:"]);

// GIPHY hosts the GIF picker is allowed to load from.
const GIPHY_HOSTS = ["giphy.com", "giphycdn.com"];

/**
 * Match a hostname against an allowed host: the host itself, or a subdomain of
 * it. Deliberately not endsWith() alone - "evilgiphy.com".endsWith("giphy.com")
 * is true, which would let any attacker-registered lookalike through.
 */
export function isAllowedHost(hostname, allowedHosts) {
  return allowedHosts.some(
    (host) => hostname === host || hostname.endsWith(`.${host}`),
  );
}

/**
 * Return the normalized URL when it is an https GIPHY URL, otherwise null.
 *
 * Returns the parsed href rather than a boolean on purpose: a boolean leaves
 * the caller holding the raw string, and the raw string is what ends up
 * interpolated into markdown or passed to fetch. Callers must use the value
 * this returns, never the input they passed in.
 */
export function safeGiphyUrl(url) {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    const ok =
      parsed.protocol === "https:" &&
      isAllowedHost(parsed.hostname, GIPHY_HOSTS);
    return ok ? parsed.href : null;
  } catch {
    return null;
  }
}

/**
 * Return url if it carries a safe scheme, otherwise null. Relative URLs resolve
 * against the current page. Callers must treat null as "do not render this as a
 * link or image" - fall back to plain text rather than dropping the content.
 */
export function safeUrl(url, base = globalThis.location?.href) {
  // Guard non-strings explicitly: new URL(null, base) stringifies null to
  // "null" and resolves it against the base, yielding a valid-looking URL.
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url, base);
    return SAFE_SCHEMES.has(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
}
