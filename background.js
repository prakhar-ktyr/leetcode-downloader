function isSupportedProblemPage(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const normalizedHost = hostname.replace(/^www\./, "");

    const isLeetCodeProblem = normalizedHost === "leetcode.com" && pathname.startsWith("/problems/");
    const isGfgProblem = ["geeksforgeeks.org", "practice.geeksforgeeks.org"].includes(normalizedHost)
      && pathname.startsWith("/problems/");

    return isLeetCodeProblem || isGfgProblem;
  } catch (error) {
    console.error("Invalid tab URL:", error);
    return false;
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id || !tab.url || !isSupportedProblemPage(tab.url)) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});