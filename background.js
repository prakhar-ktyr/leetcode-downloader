chrome.action.onClicked.addListener((tab) => {
  // Only execute if we are on a LeetCode problem page
  if (tab.url && tab.url.includes("leetcode.com/problems/")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  }
});