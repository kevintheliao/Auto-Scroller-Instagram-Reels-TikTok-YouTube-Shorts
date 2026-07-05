# Instagram Reels Auto-Scroller

A Chrome extension that automatically scrolls through Instagram Reels with convenient keyboard shortcuts and controls.

## Features

- **Auto-Scroll**: Automatically scroll to the next Reel when the current one ends
- **Keyboard Shortcuts**:
  - `R` - Toggle auto-scroll on/off
  - `F` - Like/Unlike current Reel
  - `C` - Open/Close comments
  - `M` - Mute/Unmute audio
- **Toast Notifications**: Visual feedback for actions and settings
- **Smart Detection**: Automatically detects when you're on Instagram and relevant pages
- **Comments Detection**: Pauses auto-scroll when comments are open, resumes when closed

## Installation

**EASIEST WAY:**
1. Go to [https://chromewebstore.google.com/detail/instagram-auto-scroller/innfihfpikaokkljfakkdjahjjbjmnmc?authuser=4&hl=en
](url)
2. Click "Add To Chrome"
3. Click on the extension icon in the Chrome toolbar and enable the extension

OR:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right corner)
4. Click "Load unpacked" and select the project directory
5. The extension will appear in your Chrome toolbar

## Usage

Once installed, the extension adds:
- **Icon in toolbar**: Click to open the popup and see controls
- **Toast overlay**: Appears on Instagram pages showing auto-scroll status (hover to expand)
- **Keyboard shortcuts**: Work anywhere on Instagram when not typing in text fields

### Controls

Click the extension icon to access:
- Toggle auto-scroll on/off
- View keyboard shortcuts
- Send feedback

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| R | Toggle Auto Scroll |
| F | Like/Unlike |
| C | Open/Close Comments |
| M | Mute/Unmute |

**Note**: Shortcuts are disabled when typing in text input fields.

## Settings

The extension remembers your preferences including:
- Auto-scroll enabled/disabled state
- Preferred audio mute state

## Feedback

Found a bug or have a feature request? [Submit feedback here](https://docs.google.com/forms/d/e/1FAIpQLScElo0xb6CCIPFu_AEp6t06LsUS3XDrpa6zshlIq8RTuCq-Fw/viewform?usp=publish-editor)

## Version

Current version: 1.6.1

## Files

- `src/manifest.json` - Extension configuration
- `src/background.js` - Background service worker
- `src/content.js` - Content script for Instagram pages
- `src/popup.html` - Popup UI
- `src/popup.js` - Popup script
- `src/popup.css` - Popup styles
