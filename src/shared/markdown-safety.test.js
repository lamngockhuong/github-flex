import { describe, expect, it } from "vitest";
import { toMarkdownImage, toSafeTitle } from "./markdown-safety.js";

const wrap = (title) =>
  `![${toSafeTitle(title)}](https://media.giphy.com/x.gif)`;

describe("toSafeTitle", () => {
  it("keeps an ordinary title intact", () => {
    expect(toSafeTitle("dancing cat")).toBe("dancing cat");
  });

  // The bug this guards: a newline ends the image syntax, so everything after
  // it becomes markdown of its own inside the comment the user posts.
  it("collapses newlines so nothing escapes the image syntax", () => {
    const injected = "cat\n\n### Injected heading\n\nhttps://evil.tld/phish";
    expect(wrap(injected)).not.toContain("\n");
    expect(wrap(injected)).toBe(
      "![cat ### Injected heading https://evil.tld/phish](https://media.giphy.com/x.gif)",
    );
  });

  it("collapses carriage returns and tabs too", () => {
    expect(toSafeTitle("a\r\nb\tc")).toBe("a b c");
  });

  it("strips characters that carry markdown meaning", () => {
    expect(toSafeTitle("a[b]c(d)e`f`g<h>i!j\\k")).toBe("abcdefghijk");
  });

  it("falls back to GIF when nothing survives", () => {
    expect(toSafeTitle("((()))")).toBe("GIF");
    expect(toSafeTitle("   ")).toBe("GIF");
    expect(toSafeTitle("")).toBe("GIF");
    expect(toSafeTitle(null)).toBe("GIF");
    expect(toSafeTitle(undefined)).toBe("GIF");
  });

  it("caps length so a huge title cannot flood the comment", () => {
    expect(toSafeTitle("x".repeat(5000))).toHaveLength(100);
  });
});

describe("toMarkdownImage", () => {
  const gif = "https://media.giphy.com/media/abc/giphy.gif";

  it("builds the image markdown", () => {
    expect(toMarkdownImage(gif, "dancing cat")).toBe(`![dancing cat](${gif})`);
  });

  // A URL is the sibling injection point to the title: a ")" closes the link
  // early and everything after it becomes markdown of its own. new URL().href
  // percent-encodes whitespace but leaves parens alone, so normalizing is not
  // enough on its own.
  it("rejects a URL that would close the link early", () => {
    const evil = "https://media.giphy.com/x.gif) ![pwn](https://evil.tld/a.gif";
    expect(toMarkdownImage(evil, "cat")).toBeNull();
    expect(toMarkdownImage(new URL(evil).href, "cat")).toBeNull();
  });

  it("rejects URLs carrying whitespace or angle brackets", () => {
    expect(toMarkdownImage("https://media.giphy.com/a b.gif", "x")).toBeNull();
    expect(toMarkdownImage("https://media.giphy.com/a\nb.gif", "x")).toBeNull();
    expect(toMarkdownImage("https://media.giphy.com/<b>.gif", "x")).toBeNull();
  });

  it("rejects a null URL, so a failed validation cannot slip through", () => {
    expect(toMarkdownImage(null, "cat")).toBeNull();
    expect(toMarkdownImage(undefined, "cat")).toBeNull();
  });

  it("still sanitizes the title", () => {
    expect(toMarkdownImage(gif, "a\n\n### b")).toBe(`![a ### b](${gif})`);
  });
});
