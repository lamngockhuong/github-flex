// Close the test browser. The profile (and login) stays on disk.
import { connect, isBrowserUp } from "./browser-lib.mjs";

if (!(await isBrowserUp())) {
  console.log("No browser running");
  process.exit(0);
}
const { browser } = await connect();
const session = await browser.newBrowserCDPSession();
await session.send("Browser.close").catch(() => {});
console.log("CLOSED");
process.exit(0);
