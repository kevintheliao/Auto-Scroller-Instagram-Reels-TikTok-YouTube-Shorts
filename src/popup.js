"use strict";

const checkbox = document.getElementById("enabled");

chrome.storage.sync.get("enabled", (data) => {
    checkbox.checked = !!data.enabled;
});

checkbox.addEventListener("change", async (event) => {
    const enabled = event.target.checked;

    await chrome.storage.sync.set({ enabled });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { enabled });
    }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.enabled) {
        checkbox.checked = !!changes.enabled.newValue;
    }
});