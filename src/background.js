"use strict"

function setBadgeText(enabled) {
    const text = enabled ? "ON" : "OFF"
    chrome.action.setBadgeText({text: text})
}

function startUp() {
    chrome.storage.sync.get("enabled", (data) => {
        setBadgeText(!!data.enabled)
    })
}

const CONTENT_SCRIPT_URLS = [
    "https://www.instagram.com/*",
    "https://www.tiktok.com/*",
    "https://www.youtube.com/*",
];

chrome.runtime.onInstalled.addListener(async (details) => {
    // Fresh install only; updates keep the user's toggle.
    if (details.reason !== "install") return;

    chrome.storage.sync.set({ enabled: true });

    // Tabs open at install time have no content scripts until reload — inject now.
    const tabs = await chrome.tabs.query({ url: CONTENT_SCRIPT_URLS });
    for (const tab of tabs) {
        if (!tab.id) continue;
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"],
            });
            if (!tab.url.includes("youtube.com")) {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["main-world.js"],
                    world: "MAIN",
                });
            }
        } catch (_) {
            // uninjectable tab (discarded etc.); skip
        }
    }

    chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
});

chrome.runtime.onStartup.addListener(startUp)
chrome.runtime.onInstalled.addListener(startUp)

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.enabled) {
        setBadgeText(!!changes.enabled.newValue);
    }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLScElo0xb6CCIPFu_AEp6t06LsUS3XDrpa6zshlIq8RTuCq-Fw/viewform?usp=publish-editor");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openReviewPage') {
        chrome.tabs.create({ url: request.url });
    }
});
