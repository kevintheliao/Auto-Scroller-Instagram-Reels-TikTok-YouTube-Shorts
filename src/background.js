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

chrome.runtime.onInstalled.addListener((details) => {
    // Only default on fresh install; an update must not reset the user's toggle.
    if (details.reason === "install") {
        chrome.storage.sync.set({ enabled: false });
    }

    const version = chrome.runtime.getManifest().version;
    const isRealUpdate = details.reason === "update" && details.previousVersion !== version;
    if (details.reason === "install" || isRealUpdate) {
        chrome.tabs.create({ url: chrome.runtime.getURL("whatsnew.html") });
    }
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
