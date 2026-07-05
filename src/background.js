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

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ enabled: false});
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
