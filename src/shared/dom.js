// Safe DOM utilities to avoid innerHTML (flagged by Firefox add-on linter)

const parser = new DOMParser();
const cache = new Map();

/**
 * Parse trusted HTML string and set as element content.
 * Caches parsed results for repeated strings (e.g. icon toggles).
 * Use only with static/hardcoded HTML — never with external data.
 */
export function setTrustedHTML(element, html) {
  let template = cache.get(html);
  if (!template) {
    template = parser.parseFromString(html, "text/html").body;
    cache.set(html, template);
  }
  element.replaceChildren(...template.cloneNode(true).childNodes);
}
