import { beforeAll, beforeEach, describe, expect, it } from "vitest";

// table-utils pulls in shared/dom.js, which builds a DOMParser at load time.
// Stub the browser globals it touches, then import it.
const storage = new Map();
let readTableEntry;
let writeTableEntry;
let loadJsonStore;

beforeAll(async () => {
  globalThis.DOMParser = class {};
  globalThis.localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
  };
  ({ readTableEntry, writeTableEntry, loadJsonStore } = await import(
    "./table-utils.js"
  ));
});

beforeEach(() => storage.clear());

describe("readTableEntry", () => {
  it("returns a stored entry", () => {
    writeTableEntry("k", "No|Item", [1, 2]);
    expect(readTableEntry("k", "No|Item")).toEqual([1, 2]);
  });

  // The bug this guards: header text is attacker-authored, and on a plain
  // object these keys resolve to inherited, truthy Object.prototype members.
  it.each([
    "__proto__",
    "constructor",
    "toString",
    "valueOf",
  ])("returns undefined for an unstored %s key", (key) => {
    writeTableEntry("k", "No|Item", [1]);
    expect(readTableEntry("k", key)).toBeUndefined();
  });

  it("round-trips an entry stored under __proto__ without polluting", () => {
    writeTableEntry("k", "__proto__", [3]);
    expect(readTableEntry("k", "__proto__")).toEqual([3]);
    expect({}.constructor).toBe(Object);
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
  });

  it("returns undefined without a table key", () => {
    expect(readTableEntry("k", null)).toBeUndefined();
  });
});

describe("loadJsonStore", () => {
  it("returns an empty store for missing or corrupt data", () => {
    expect({ ...loadJsonStore("missing") }).toEqual({});
    storage.set("bad", "{not json");
    expect({ ...loadJsonStore("bad") }).toEqual({});
    storage.set("null", "null");
    expect({ ...loadJsonStore("null") }).toEqual({});
  });
});
