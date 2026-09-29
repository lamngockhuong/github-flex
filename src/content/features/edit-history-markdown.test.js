import { describe, expect, it } from "vitest";
import { pickSafeAttrs } from "./edit-history-markdown.js";

describe("pickSafeAttrs", () => {
  it("keeps title and open", () => {
    expect(pickSafeAttrs(' title="note" open="open"')).toEqual([
      ["title", "note"],
      ["open", "open"],
    ]);
  });

  // The bug this guards: author-chosen ids/classes match the extension's own
  // stylesheet rules and turn a comment line into a full-viewport overlay.
  it("drops id, class and name", () => {
    expect(
      pickSafeAttrs(
        ' id="ghflex-edit-history" class="ghflex-table-fullscreen-overlay" name="x"',
      ),
    ).toEqual([]);
  });

  it("matches attribute names case-insensitively", () => {
    expect(pickSafeAttrs(' ID="a" CLASS="b" TITLE="c"')).toEqual([
      ["title", "c"],
    ]);
  });

  it("drops event handlers and style", () => {
    expect(pickSafeAttrs(' onclick="alert(1)" style="position:fixed"')).toEqual(
      [],
    );
  });

  it("returns nothing for missing attributes", () => {
    expect(pickSafeAttrs(undefined)).toEqual([]);
    expect(pickSafeAttrs("")).toEqual([]);
  });
});
