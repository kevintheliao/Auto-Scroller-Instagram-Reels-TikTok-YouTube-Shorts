# Auto Scroller — Instagram Reels, TikTok & YouTube Shorts

A Chrome extension that automatically scrolls through Instagram Reels, TikTok videos and YouTube Shorts, with convenient keyboard shortcuts and on-page controls.

## Features

- **Auto-Scroll**: Automatically advances to the next video when the current one ends
  - Instagram Reels & feed videos
  - TikTok For You / Following feeds
  - YouTube Shorts
- **Keyboard Shortcuts** (per platform, see table below)
- **On-page control card**: Appears in the top-right corner of all three sites — hover to toggle auto-scroll and see shortcuts
- **Comments Detection**: Pauses auto-scroll while comments are open, resumes when closed
- **What's New page**: Opens automatically after installing or updating

## Installation

**EASIEST WAY:**
1. Go to the [Chrome Web Store listing](https://chromewebstore.google.com/detail/instagram-auto-scroller/innfihfpikaokkljfakkdjahjjbjmnmc?authuser=4&hl=en)
2. Click "Add To Chrome"
3. Click on the extension icon in the Chrome toolbar and enable the extension

OR:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked" and select the `src` directory
5. The extension will appear in your Chrome toolbar

## Usage

Once installed, the extension adds:
- **Icon in toolbar**: Click to open the popup and see controls
- **Control card overlay**: Appears on Instagram, TikTok and YouTube Shorts pages showing auto-scroll status (hover to expand)
- **Keyboard shortcuts**: Work anywhere on the supported sites when not typing in text fields

## Keyboard Shortcuts

### Instagram & TikTok

| Shortcut | Action |
|----------|--------|
| R | Toggle Auto Scroll |
| F | Like/Unlike |
| C | Open/Close Comments |
| M | Mute/Unmute |

### YouTube Shorts

| Shortcut | Action |
|----------|--------|
| R | Toggle Auto Scroll |
| E | Like/Unlike |
| M | Mute/Unmute (YouTube built-in) |
| C | Captions (YouTube built-in) |
| F | Fullscreen (YouTube built-in) |

**Note**: Shortcuts are disabled when typing in text input fields.

## Settings

The extension remembers your preferences including:
- Auto-scroll enabled/disabled state
- Preferred audio mute state

## Feedback

Found a bug or have a feature request? [Submit feedback here](https://docs.google.com/forms/d/e/1FAIpQLScElo0xb6CCIPFu_AEp6t06LsUS3XDrpa6zshlIq8RTuCq-Fw/viewform?usp=publish-editor)

## Version

Current version: 2.1.4

## Files

- `src/manifest.json` - Extension configuration
- `src/background.js` - Background service worker (badge, what's-new tab)
- `src/content.js` - Content script for Instagram, TikTok and YouTube pages
- `src/main-world.js` - TikTok main-world bridge (React click handling)
- `src/whatsnew.html` - What's-new page shown after install/update
- `src/popup.html` - Popup UI
- `src/popup.js` - Popup script
- `src/popup.css` - Popup styles
