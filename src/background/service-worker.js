// Service worker for GitHub Flex

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[GitHub Flex] Installed");
  } else if (details.reason === "update") {
    console.log(
      "[GitHub Flex] Updated to",
      chrome.runtime.getManifest().version,
    );
  }
});
