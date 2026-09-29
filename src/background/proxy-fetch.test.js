import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGifApi, fetchGiphyImage } from "./proxy-fetch.js";

const API_URL = "https://github-gifs.aldilaff6545.workers.dev/search?q=cat";
const GIF_URL = "https://media.giphy.com/media/abc/giphy.gif";

function stubFetch(response) {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, status: 200, ...response });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe("fetchGifApi", () => {
  it("refuses redirects", async () => {
    const fetch = stubFetch({ json: async () => ({ data: [1] }) });
    expect(await fetchGifApi(API_URL)).toEqual({ data: [1] });
    expect(fetch).toHaveBeenCalledWith(API_URL, { redirect: "error" });
  });

  it("rejects hosts other than the API host", async () => {
    const fetch = stubFetch({});
    expect(await fetchGifApi("https://evil.example/search")).toEqual({
      error: "URL not allowed",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("fetchGiphyImage", () => {
  const bytes = new Uint8Array([71, 73, 70]).buffer; // "GIF"

  it("returns base64 bytes when the final URL is still GIPHY", async () => {
    stubFetch({
      url: "https://media0.giphy.com/media/abc/giphy.gif",
      arrayBuffer: async () => bytes,
    });
    expect(await fetchGiphyImage(GIF_URL)).toEqual({ data: "R0lG" });
  });

  // The bug this guards: fetch follows redirects, so the allowlist on the
  // requested URL says nothing about where the bytes actually came from.
  it("rejects a response redirected off GIPHY", async () => {
    const arrayBuffer = vi.fn(async () => bytes);
    stubFetch({ url: "https://evil.example/x.gif", arrayBuffer });
    expect(await fetchGiphyImage(GIF_URL)).toEqual({
      error: "URL not allowed",
    });
    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it("rejects a non-GIPHY URL without fetching", async () => {
    const fetch = stubFetch({});
    expect(await fetchGiphyImage("https://evil.example/x.gif")).toEqual({
      error: "URL not allowed",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
