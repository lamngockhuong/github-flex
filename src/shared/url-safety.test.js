import { describe, expect, it } from "vitest";
import { isAllowedHost, safeGiphyUrl, safeUrl } from "./url-safety.js";

describe("isAllowedHost", () => {
  const hosts = ["giphy.com", "giphycdn.com"];

  it("accepts the host itself", () => {
    expect(isAllowedHost("giphy.com", hosts)).toBe(true);
    expect(isAllowedHost("giphycdn.com", hosts)).toBe(true);
  });

  it("accepts subdomains", () => {
    expect(isAllowedHost("media.giphy.com", hosts)).toBe(true);
    expect(isAllowedHost("media0.giphycdn.com", hosts)).toBe(true);
  });

  // The bug this module exists to prevent: a bare endsWith() check treats any
  // host merely ending in "giphy.com" as GIPHY, including ones an attacker
  // can register.
  it("rejects lookalike hosts sharing the suffix", () => {
    expect(isAllowedHost("evilgiphy.com", hosts)).toBe(false);
    expect(isAllowedHost("not-giphy.com", hosts)).toBe(false);
    expect(isAllowedHost("attackergiphycdn.com", hosts)).toBe(false);
  });

  it("rejects the allowed host used as a prefix", () => {
    expect(isAllowedHost("giphy.com.evil.tld", hosts)).toBe(false);
  });
});

describe("safeGiphyUrl", () => {
  it("returns the normalized URL for https GIPHY URLs", () => {
    expect(safeGiphyUrl("https://giphy.com/gifs/x.gif")).toBe(
      "https://giphy.com/gifs/x.gif",
    );
    expect(safeGiphyUrl("https://media3.giphy.com/media/abc/giphy.gif")).toBe(
      "https://media3.giphy.com/media/abc/giphy.gif",
    );
  });

  it("rejects lookalike domains", () => {
    expect(safeGiphyUrl("https://evilgiphy.com/x.gif")).toBeNull();
    expect(safeGiphyUrl("https://giphy.com.evil.tld/x.gif")).toBeNull();
  });

  it("rejects non-https schemes", () => {
    expect(safeGiphyUrl("http://giphy.com/x.gif")).toBeNull();
    expect(safeGiphyUrl("javascript:alert(1)")).toBeNull();
    expect(safeGiphyUrl("data:image/gif;base64,AAAA")).toBeNull();
  });

  it("rejects unparseable input", () => {
    expect(safeGiphyUrl("")).toBeNull();
    expect(safeGiphyUrl("not a url")).toBeNull();
    expect(safeGiphyUrl(null)).toBeNull();
    expect(safeGiphyUrl(undefined)).toBeNull();
  });
});

describe("safeUrl", () => {
  const base = "https://github.com/owner/repo/issues/1";

  it("passes through http(s) and mailto", () => {
    expect(safeUrl("https://example.com/a", base)).toBe(
      "https://example.com/a",
    );
    expect(safeUrl("http://example.com/a", base)).toBe("http://example.com/a");
    expect(safeUrl("mailto:someone@example.com", base)).toBe(
      "mailto:someone@example.com",
    );
  });

  it("resolves relative URLs against the base", () => {
    expect(safeUrl("/owner/repo", base)).toBe("https://github.com/owner/repo");
  });

  it("rejects javascript: URLs", () => {
    expect(safeUrl("javascript:alert(1)", base)).toBeNull();
    expect(safeUrl("JavaScript:alert(1)", base)).toBeNull();
    expect(safeUrl("  javascript:alert(1)", base)).toBeNull();
  });

  // The WHATWG URL parser strips tabs and newlines before parsing, so a scheme
  // broken up with them still resolves to javascript: and must still be caught.
  it("rejects javascript: obfuscated with control characters", () => {
    expect(safeUrl("java\tscript:alert(1)", base)).toBeNull();
    expect(safeUrl("java\nscript:alert(1)", base)).toBeNull();
  });

  it("rejects other dangerous schemes", () => {
    expect(safeUrl("data:text/html;base64,PHNjcmlwdD4=", base)).toBeNull();
    expect(safeUrl("vbscript:msgbox(1)", base)).toBeNull();
    expect(safeUrl("file:///etc/passwd", base)).toBeNull();
    expect(safeUrl("blob:https://github.com/abc", base)).toBeNull();
  });

  it("rejects unparseable input", () => {
    expect(safeUrl(null, base)).toBeNull();
    expect(safeUrl("http://[malformed", base)).toBeNull();
  });

  // No base and no window.location (the test environment is node) means a
  // relative URL cannot be resolved - reject rather than guess.
  it("rejects relative URLs when no base is available", () => {
    expect(safeUrl("/owner/repo")).toBeNull();
  });
});
