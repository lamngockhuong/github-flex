// Sanitizing untrusted text before it is embedded in markdown the user posts.

const MAX_TITLE_LENGTH = 100;

// Characters that carry meaning inside ![alt](url): brackets and parens close
// the syntax, backtick opens code, <> opens inline HTML, ! starts an image, and
// a backslash escapes whatever follows.
const MARKDOWN_SIGNIFICANT = /[[\]()`<>!\\]/g;

/**
 * Flatten an untrusted GIF title into something safe to place inside
 * ![title](url).
 *
 * Whitespace collapses first: a newline in a title ends the image syntax and
 * everything after it becomes markdown in its own right, which lands in the
 * comment the user is about to post under their own name. Titles reach us from
 * the GIF API, so they are never ours to trust.
 */
export function toSafeTitle(title) {
  // Guard non-strings: a number or object title from the API would make
  // .replace throw inside a click handler, leaving the button silently dead.
  if (typeof title !== "string") return "GIF";
  const cleaned = title
    .replace(/\s+/g, " ")
    .replace(MARKDOWN_SIGNIFICANT, "")
    .trim()
    .slice(0, MAX_TITLE_LENGTH);
  return cleaned || "GIF";
}

// Characters that end the (url) part of a markdown link early. Note that
// new URL().href percent-encodes whitespace but leaves parentheses alone, so
// normalizing the URL is not by itself enough to make it safe to embed.
const URL_BREAKS_MARKDOWN = /[()\s<>]/;

/**
 * Build `![title](url)` from an untrusted title and an already-validated URL,
 * or return null when the URL cannot be embedded safely.
 *
 * A URL containing a parenthesis closes the link early and everything after it
 * becomes markdown of its own - the same injection toSafeTitle prevents, just
 * through the other parameter. Real GIPHY URLs never contain one, so rejecting
 * is safe and fails closed.
 */
export function toMarkdownImage(url, title) {
  if (typeof url !== "string" || URL_BREAKS_MARKDOWN.test(url)) return null;
  return `![${toSafeTitle(title)}](${url})`;
}
