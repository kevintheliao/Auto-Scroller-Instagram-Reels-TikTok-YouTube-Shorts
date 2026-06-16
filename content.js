class ReviewPopupManager {
    constructor() {
        this.popupCard = null;
        this.closeBtn = null;
        this.reviewBtn = null;
        this.laterBtn = null;
        this.interactionCount = 0;
        this.lastShownInteraction = 0;
        this.reviewPopupDismissed = false;
        this.initialized = false;
        this.stateLoaded = false;
        this.pendingInteractions = 0;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        this.injectStyles();
        this.loadState();
    }

    setupElements() {
        const existing = document.getElementById('review-popup-card');
        if (existing) {
            existing.remove();
        }
        
        const card = document.createElement('div');
        card.id = 'review-popup-card';
        card.className = 'review-popup-card review-popup-hidden';
        card.innerHTML = `
            <button class="review-popup-close" id="review-popup-close-btn" aria-label="Close">×</button>
            <div class="review-popup-card-content">
                <div class="review-popup-icon"><img src="${chrome.runtime.getURL('icon48.png')}" alt="Logo" style="width: 32px; height: 32px;"></div>
                <h2 class="review-popup-card-title">Love Instagram Auto-Scroller?</h2>
                <p class="review-popup-card-message">Help us improve by leaving a review on the Chrome Web Store!</p>
                <div class="review-popup-card-buttons">
                    <button class="review-popup-btn review-popup-btn-primary" id="review-popup-review-btn">
                        Leave a Review
                    </button>
                    <button class="review-popup-btn review-popup-btn-secondary" id="review-popup-later-btn">
                        Maybe Later
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(card);
        
        this.popupCard = card;
        this.closeBtn = document.getElementById('review-popup-close-btn');
        this.reviewBtn = document.getElementById('review-popup-review-btn');
        this.laterBtn = document.getElementById('review-popup-later-btn');
        
        this.setupEventListeners();
    }

    injectStyles() {
        if (document.getElementById('review-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'review-popup-styles';
        style.textContent = `
            .review-popup-hidden {
                display: none !important;
            }

            #review-popup-card {
                position: fixed;
                top: 140px;
                right: 80px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                padding: 10px 12px;
                max-width: 280px;
                width: auto;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, "Neue Haas Grotesk Text Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
                animation: reviewFadeIn 0.1s ease-out;
            }

            @keyframes reviewFadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-2px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes reviewFadeOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-2px);
                }
            }

            #review-popup-card.review-popup-closing {
                animation: reviewFadeOut 0.1s ease-in forwards;
            }

            .review-popup-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .review-popup-close:hover {
                background: #f0f0f0;
                color: #333;
            }

            .review-popup-card-content {
                text-align: center;
                padding-top: 4px;
            }

            .review-popup-icon {
                font-size: 28px;
                margin-bottom: 6px;
                animation: bounce 0.6s ease-out;
                display: inline-block;
            }

            @keyframes bounce {
                0% {
                    transform: scale(0.5);
                    opacity: 0;
                }
                70% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            .review-popup-card-title {
                font-size: 13px;
                font-weight: 600;
                color: #333;
                margin: 4px 0 2px 0;
                padding: 0;
            }

            .review-popup-card-message {
                font-size: 11px;
                color: #666;
                margin: 2px 0 8px 0;
                line-height: 1.25;
            }

            .review-popup-card-buttons {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .review-popup-btn {
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 600;
                border-radius: 6px;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-block;
                text-align: center;
            }

            .review-popup-btn-primary {
                background: #6FC276;
                color: white;
            }

            .review-popup-btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(111, 194, 118, 0.4);
            }

            .review-popup-btn-secondary {
                background: #F47174;
                color: white;
                font-size: 12px;
            }

            .review-popup-btn-secondary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(244, 113, 116, 0.4);
            }

            @media (max-width: 640px) {
                #review-popup-card {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    width: calc(100% - 20px);
                    max-width: none;
                }
            }
        `;
        document.documentElement.appendChild(style);
    }

    setupEventListeners() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hidePopup());
        }
        if (this.reviewBtn) {
            this.reviewBtn.addEventListener('click', () => {
                chrome.runtime.sendMessage({ 
                    action: 'openReviewPage',
                    url: 'https://chromewebstore.google.com/detail/instagram-auto-scroller/innfihfpikaokkljfakkdjahjjbjmnmc/reviews?hl=en&authuser=4'
                });
                this.dismissPopup();
            });
        }
        if (this.laterBtn) {
            this.laterBtn.addEventListener('click', () => this.hidePopup());
        }
    }

    loadState() {
        try {
            chrome.storage.sync.get(['reviewInteractionCount', 'reviewLastShownAt', 'reviewPopupDismissed'], (data) => {
                const res = data || {};
                this.interactionCount = res.reviewInteractionCount || 0;
                this.lastShownInteraction = res.reviewLastShownAt || 0;
                this.reviewPopupDismissed = res.reviewPopupDismissed || false;
                
                if (!this.popupCard) {
                    this.setupElements();
                }
                
                console.log('[ReviewPopup] State loaded:', {
                    count: this.interactionCount,
                    dismissed: this.reviewPopupDismissed
                });
                console.log('[ReviewPopup] If you need to reset the popup state for testing, run: window.reviewPopupManager.resetState()');
                
                // Mark state as loaded and process any pending interactions
                this.stateLoaded = true;
                if (this.pendingInteractions > 0) {
                    console.log('[ReviewPopup] Processing', this.pendingInteractions, 'pending interactions');
                    const pending = this.pendingInteractions;
                    this.pendingInteractions = 0;
                    for (let i = 0; i < pending; i++) {
                        this.recordInteraction();
                    }
                }
            });
        } catch (e) {
            console.log('[ReviewPopup] Could not load state:', e);
            this.stateLoaded = true;
        }
    }

    saveState() {
        try {
            chrome.storage.sync.set({
                reviewInteractionCount: this.interactionCount,
                reviewLastShownAt: this.lastShownInteraction,
                reviewPopupDismissed: this.reviewPopupDismissed
            });
        } catch (e) {
            console.log('[ReviewPopup] Could not save state:', e);
        }
    }

    shouldShowPopup() {
        if (this.reviewPopupDismissed) return false;

        const count = this.interactionCount;

        const frequencies = [3, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
        return frequencies.includes(count);
    }

    recordInteraction() {
        if (!this.stateLoaded) {
            console.log('[ReviewPopup] State not loaded yet, queueing interaction...');
            this.pendingInteractions++;
            return;
        }

        const countBefore = this.interactionCount;
        this.interactionCount++;
        console.log('[ReviewPopup] Interaction recorded:', countBefore, '->', this.interactionCount);
        
        this.saveState();

        const shouldShow = this.shouldShowPopup();
        console.log('[ReviewPopup] Should show popup?', shouldShow, '(count:', this.interactionCount, ', dismissed:', this.reviewPopupDismissed, ')');
        
        if (shouldShow) {
            console.log('[ReviewPopup] Showing popup at interaction', this.interactionCount);
            this.lastShownInteraction = this.interactionCount;
            this.saveState();
            this.showPopup();
        } else {
            console.log('[ReviewPopup] Skipping popup (frequencies: [3,5,10,20,50,100,200,500,1000,2000,5000])');
        }
    }

    showPopup() {
        console.log('[ReviewPopup] showPopup() called, popupCard exists?', !!this.popupCard);
        
        if (!this.popupCard || !document.getElementById('review-popup-card')) {
            console.log('[ReviewPopup] Creating/re-attaching popup card...');
            this.setupElements();
        }
        if (this.popupCard) {
            console.log('[ReviewPopup] Removing hidden class, card HTML:', this.popupCard.outerHTML.substring(0, 100));
            this.popupCard.classList.remove('review-popup-hidden');
            this.popupCard.classList.remove('review-popup-closing');
            console.log('[ReviewPopup] Popup shown, classes:', this.popupCard.className);
        } else {
            console.log('[ReviewPopup] ERROR: popupCard is null after setupElements!');
        }
    }

    hidePopup() {
        if (this.popupCard) {
            this.popupCard.classList.add('review-popup-closing');
            setTimeout(() => {
                if (this.popupCard) {
                    this.popupCard.classList.add('review-popup-hidden');
                    this.popupCard.classList.remove('review-popup-closing');
                }
            }, 100);
            console.log('[ReviewPopup] Popup hidden');
        }
    }

    dismissPopup() {
        this.reviewPopupDismissed = true;
        this.saveState();
        this.hidePopup();
    }

    resetState() {
        this.interactionCount = 0;
        this.lastShownInteraction = 0;
        this.reviewPopupDismissed = false;
        this.saveState();
    }
}

const reviewPopupManager = new ReviewPopupManager();
window.reviewPopupManager = reviewPopupManager;

let lastVideo = null;
let autoScrollEnabled = false;
let watchdogIntervalId = null;
let toastUpdateIntervalId = null;
let pendingScrollOnCommentsClose = false;
let preferredMuteState = false;
let preferredMuteStateApplied = false;

let commentsOpen = false;
let videoWhenCommentsStartedClosing = null;
let commentsClosingTimer = null;

function syncCommentsOpenState() {
    const open = areCommentsOpen();
    if (open && !commentsOpen) {
        commentsOpen = true;
        if (commentsClosingTimer) clearTimeout(commentsClosingTimer);
        pendingScrollOnCommentsClose = false;
    } else if (!open && commentsOpen) {
        commentsOpen = false;
        if (pendingScrollOnCommentsClose) {
            videoWhenCommentsStartedClosing = getCurrentVideo();

            if (commentsClosingTimer) clearTimeout(commentsClosingTimer);

            commentsClosingTimer = setTimeout(() => {
                pendingScrollOnCommentsClose = false;
                const currentVideo = getCurrentVideo();

                if (currentVideo === videoWhenCommentsStartedClosing) {
                    try {
                        scrollDown();
                    } catch (e) {}
                }
                videoWhenCommentsStartedClosing = null;
            }, 20);
        }
    }
}

function runWatchdog() {
    try {
        syncCommentsOpenState();
    } catch (_) {}
    if (autoScrollEnabled) {
        try {
            setupVideoEndListener();
        } catch (_) {}
    }
}

function startWatchdog() {
    if (watchdogIntervalId != null) return;
    watchdogIntervalId = setInterval(runWatchdog, 400);
}

function updateToastVisibility() {
    const p = (location.pathname || '/').toLowerCase();
    const toastElement = document.getElementById('autoscroll-toast-unique-v1');
    if (p.startsWith('/direct') || p.startsWith('/stories')) {
        if (toastElement) {
            toastElement.style.display = 'none';
        }
        return;
    }
    if (isRelevantPage()) {
        if (!toastElement || !document.documentElement.contains(toastElement)) {
            const oldEl = document.getElementById('autoscroll-toast-unique-v1');
            if (oldEl && !document.documentElement.contains(oldEl)) {
                oldEl.remove();
            }
            showAutoScrollToast(autoScrollEnabled);
        } else if (toastElement.style.display === 'none') {
            toastElement.style.display = 'flex';
        }
    } else if (toastElement) {
        toastElement.style.display = 'none';
    }
}

function startToastUpdateWatchdog() {
    if (toastUpdateIntervalId != null) return;
    toastUpdateIntervalId = setInterval(updateToastVisibility, 500);
}

chrome.runtime.onMessage.addListener(({ enabled }) => {
    autoScrollEnabled = enabled;
    if (enabled) {
        setupVideoEndListener();
    } else {
        if (lastVideo && lastVideo._autoScrollHandler) {
            lastVideo.removeEventListener("ended", lastVideo._autoScrollHandler);
        }
        lastVideo = null;
    }
});

function initializeAutoScrollCard() {
    if (isRelevantPage()) {
        showAutoScrollToast(autoScrollEnabled);
    }
}

chrome.storage.sync.get(["enabled", "preferredMuteState"], (data) => {
    const res = data || {};
    const enabled = res.enabled;
    const savedMuteState = res.preferredMuteState;
    autoScrollEnabled = enabled;
    preferredMuteState = savedMuteState || false;
    preferredMuteStateApplied = false;
    if (enabled) {
        setupVideoEndListener();
    }
    initializeAutoScrollCard();
});

function getCurrentVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length) return null;
    const vh = window.innerHeight || 0;
    const vw = window.innerWidth || 0;
    const midY = vh / 2;

    let best = null;
    let bestScore = -1;
    for (const v of videos) {
        const r = v.getBoundingClientRect();
        if (r.width < 16 || r.height < 16) continue;
        const visTop = Math.max(0, r.top);
        const visBottom = Math.min(vh, r.bottom);
        const visibleH = Math.max(0, visBottom - visTop);
        if (visibleH < 40) continue;
        const frac = visibleH / Math.max(1, r.height);
        const cy = r.top + r.height / 2;
        const distMid = Math.abs(cy - midY);
        const score = visibleH * 100 + frac * 50 - distMid * 0.02;
        if (score > bestScore) {
            bestScore = score;
            best = v;
        }
    }
    return best;
}

function scrollDown() {
    const allVideos = Array.from(document.querySelectorAll("video"));
    const currentVideo = getCurrentVideo();
    if (!currentVideo) return;

    if (areCommentsOpen()) return;

    if (reviewPopupManager) {
        reviewPopupManager.recordInteraction();
    }

    const currentIndex = allVideos.findIndex(v => v === currentVideo);
    const nextVideo = allVideos[currentIndex + 1];

    if (nextVideo) {
        nextVideo.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "center",
        });
    }
}

function setupVideoEndListener() {
    const video = getCurrentVideo();
    
    if (!video) return;

    if (video === lastVideo) return;

    if (lastVideo) {
        lastVideo.removeEventListener("ended", lastVideo._autoScrollHandler);
    }

    const handler = () => {
        if (areCommentsOpen()) {
            pendingScrollOnCommentsClose = true;
        } else {
            scrollDown();
        }
    };

    video._autoScrollHandler = handler;
    video.addEventListener("ended", handler);
    if (!preferredMuteStateApplied) {
        video.muted = preferredMuteState;
        preferredMuteStateApplied = true;
    }
    
    lastVideo = video;
}

function areCommentsOpen() {
    const modal = document.querySelector('[aria-modal="true"], dialog[open], [role="dialog"][aria-modal="true"]');
    if (modal) {
        const r = modal.getBoundingClientRect();
        const vw = window.innerWidth || 0;
        const vh = window.innerHeight || 0;
        if (r.width >= 160 && r.height >= 160 && r.width <= vw && r.height <= vh) return true;
    }
    const dialog = document.querySelector('[role="dialog"]');
    if (dialog) {
        const r = dialog.getBoundingClientRect();
        const vw = window.innerWidth || 800;
        if (r.width >= Math.min(280, vw * 0.3) && r.height >= 180 && r.bottom > 80) return true;
    }
    return false;
}

const REEL_CONTAINERS = [
    "article",
    "section",
    '[role="article"]',
    '[role="presentation"]',
    '[data-testid="post-container"]',
    '[role="row"]',
];

function getReelRoot(video) {
    if (!video) return null;
    for (const sel of REEL_CONTAINERS) {
        const el = video.closest(sel);
        if (el) return el;
    }
    return video.parentElement;
}

function isSvgVisible(svg) {
    if (!svg || !svg.getClientRects) return false;
    const rects = svg.getClientRects();
    if (!rects || !rects.length) return false;
    const r = svg.getBoundingClientRect();
    return r.width > 2 && r.height > 2;
}

function getReelShellForVideo(video) {
    if (!video) return null;
    const vRect = video.getBoundingClientRect();
    const comments = Array.from(
        document.querySelectorAll('[role="button"][aria-haspopup="menu"] svg[aria-label="Comment"]')
    );
    let bestSvg = null;
    let bestOverlap = -1;
    for (const svg of comments) {
        if (!isSvgVisible(svg)) continue;
        const r = svg.getBoundingClientRect();
        const overlapY = Math.min(vRect.bottom, r.bottom) - Math.max(vRect.top, r.top);
        if (overlapY > bestOverlap) {
            bestOverlap = overlapY;
            bestSvg = svg;
        }
    }
    if (bestSvg && bestOverlap >= 8) {
        let n = bestSvg;
        for (let i = 0; i < 28 && n; i++) {
            if (n.contains && n.contains(video)) return n;
            n = n.parentElement;
        }
    }
    const fallback = getReelRoot(video);
    return fallback && fallback.contains(video) ? fallback : video.parentElement;
}

function getReelActionsScope(video) {
    const shell = getReelShellForVideo(video);
    if (!shell) return null;
    const commentSvg = Array.from(
        shell.querySelectorAll('[role="button"][aria-haspopup="menu"] svg[aria-label="Comment"]')
    ).find(isSvgVisible);
    if (!commentSvg) return shell;
    const commentBtn = commentSvg.closest('[role="button"]');
    if (!commentBtn) return shell;
    let p = commentBtn.parentElement;
    for (let i = 0; i < 14 && p && shell.contains(p); i++) {
        if (p.querySelectorAll('[role="button"]').length >= 2) return p;
        p = p.parentElement;
    }
    return commentBtn.parentElement || shell;
}

function pickSvgInReelActions(video, selectors) {
    if (!video) return null;
    const scopes = [];
    const col = getReelActionsScope(video);
    if (col) scopes.push(col);
    const shell = getReelShellForVideo(video);
    if (shell && scopes.indexOf(shell) === -1) scopes.push(shell);
    const rRoot = getReelRoot(video);
    if (rRoot && scopes.indexOf(rRoot) === -1) scopes.push(rRoot);

    for (const scope of scopes) {
        if (!scope || !scope.querySelector) continue;
        for (const sel of selectors) {
            try {
                const el = scope.querySelector(sel);
                if (el && isSvgVisible(el)) return el;
            } catch (_) {}
        }
    }

    const allVideos = Array.from(document.querySelectorAll("video"));
    const idx = allVideos.indexOf(video);
    for (const sel of selectors) {
        const list = Array.from(document.querySelectorAll(sel));
        const pick = idx >= 0 && idx < list.length ? list[idx] : list[0];
        if (pick && isSvgVisible(pick)) return pick;
    }
    return null;
}

function closestClickTarget(fromEl) {
    if (!fromEl) return null;
    let cur = fromEl;
    for (let i = 0; i < 14 && cur; i++) {
        if (cur.matches && cur.matches('[role="button"], button, a[href]')) return cur;
        cur = cur.parentElement;
    }
    cur = fromEl;
    for (let i = 0; i < 10 && cur; i++) {
        if (cur.matches && cur.matches('[tabindex="0"]')) return cur;
        cur = cur.parentElement;
    }
    return fromEl;
}

function safeClick(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const x = rect.left + Math.min(Math.max(rect.width / 2, 4), rect.width - 4);
    const y = rect.top + Math.min(Math.max(rect.height / 2, 4), rect.height - 4);
    const base = {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
    };
    const fire = (Ctor, type, extra) => {
        try {
            const ev = new Ctor(type, Object.assign({}, base, extra || {}));
            el.dispatchEvent(ev);
        } catch (_) {}
    };
    try {
        if (typeof el.focus === "function") {
            try {
                el.focus({ preventScroll: true });
            } catch (_) {
                try {
                    el.focus();
                } catch (_) {}
            }
        }
    } catch (_) {}
    try {
        if (typeof PointerEvent !== "undefined") {
            fire(PointerEvent, "pointerover", { pointerId: 1, pointerType: "mouse", isPrimary: true });
            fire(PointerEvent, "pointerenter", { pointerId: 1, pointerType: "mouse", isPrimary: true });
            fire(PointerEvent, "pointerdown", { pointerId: 1, pointerType: "mouse", isPrimary: true, buttons: 1, button: 0 });
        }
        fire(MouseEvent, "mousedown", { buttons: 1, button: 0 });
        if (typeof el.click === "function") el.click();
        fire(MouseEvent, "mouseup", { buttons: 0, button: 0 });
        if (typeof PointerEvent !== "undefined") {
            fire(PointerEvent, "pointerup", { pointerId: 1, pointerType: "mouse", isPrimary: true, buttons: 0, button: 0 });
        }
        fire(MouseEvent, "click", { buttons: 0, button: 0 });
        return true;
    } catch (_) {
        try {
            if (typeof el.click === "function") el.click();
            return true;
        } catch (_) {
            return false;
        }
    }
}

function isAdjustVolumeSlider(el) {
    if (!el || el.getAttribute("role") !== "slider") return false;
    return /volume|adjust/i.test((el.getAttribute("aria-label") || "").toLowerCase());
}

function resolveInstagramAudioClickTarget(svg) {
    if (!svg) return null;
    const slider = svg.closest('[role="slider"]');
    if (slider && isAdjustVolumeSlider(slider)) {
        const inner = slider.querySelector('[role="button"]');
        return inner || slider;
    }
    return svg.closest('[role="button"]') || svg;
}

function lastVisibleSvgIn(scope, selector) {
    if (!scope || !scope.querySelectorAll) return null;
    const list = Array.from(scope.querySelectorAll(selector)).filter(isSvgVisible);
    return list.length ? list[list.length - 1] : null;
}

function getInstagramAudioToggle(video) {
    const scopes = [];
    const shell = getReelShellForVideo(video);
    if (shell) scopes.push(shell);
    const rRoot = getReelRoot(video);
    if (rRoot && scopes.indexOf(rRoot) === -1) scopes.push(rRoot);

    for (const scope of scopes) {
        if (!scope || !scope.querySelectorAll) continue;

        const playing = lastVisibleSvgIn(scope, 'svg[aria-label="Audio is playing"]');
        if (playing) {
            return { clickEl: resolveInstagramAudioClickTarget(playing), state: "unmuted" };
        }
        const muted = lastVisibleSvgIn(scope, 'svg[aria-label="Audio is muted"]');
        if (muted) {
            return { clickEl: resolveInstagramAudioClickTarget(muted), state: "muted" };
        }
        const slider = Array.from(scope.querySelectorAll('[role="slider"]')).find(isAdjustVolumeSlider);
        if (slider) {
            const inner = slider.querySelector('[role="button"]');
            return { clickEl: inner || slider, state: "muted" };
        }
    }

    const allVideos = Array.from(document.querySelectorAll("video"));
    const idx = allVideos.indexOf(video);
    
    const globalPlaying = Array.from(document.querySelectorAll('svg[aria-label="Audio is playing"]')).filter(isSvgVisible);
    if (globalPlaying.length) {
        const pick = idx >= 0 && idx < globalPlaying.length ? globalPlaying[idx] : globalPlaying[globalPlaying.length - 1];
        if (pick) return { clickEl: resolveInstagramAudioClickTarget(pick), state: "unmuted" };
    }
    
    const globalMuted = Array.from(document.querySelectorAll('svg[aria-label="Audio is muted"]')).filter(isSvgVisible);
    if (globalMuted.length) {
        const pick = idx >= 0 && idx < globalMuted.length ? globalMuted[idx] : globalMuted[globalMuted.length - 1];
        if (pick) return { clickEl: resolveInstagramAudioClickTarget(pick), state: "muted" };
    }

    return { clickEl: null, state: "unknown" };
}

function instaPointerTap(el) {
    if (!el) return false;
    try {
        el.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    } catch (_) {}
    const r = el.getBoundingClientRect();
    const x = Math.floor(r.left + Math.min(Math.max(r.width / 2, 2), r.width - 2));
    const y = Math.floor(r.top + Math.min(Math.max(r.height / 2, 2), r.height - 2));
    let hit = null;
    try {
        hit = document.elementFromPoint(x, y);
    } catch (_) {
        hit = null;
    }
    const leaf = hit && el.contains(hit) ? hit : el;
    const mk = (type, buttons) =>
        new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: x,
            clientY: y,
            button: 0,
            buttons: buttons != null ? buttons : 0,
        });
    try {
        leaf.dispatchEvent(mk("mousedown", 1));
        leaf.dispatchEvent(mk("mouseup", 0));
        if (typeof leaf.click === "function") leaf.click();
        leaf.dispatchEvent(mk("click", 0));
        return true;
    } catch (_) {
        return false;
    }
}

function toggleAudioForVideo(video) {
    if (!video) return;
    const { clickEl, state } = getInstagramAudioToggle(video);
    if (clickEl) {
        const ok = instaPointerTap(clickEl) || safeClick(clickEl);
        if (ok) {
            if (state === "unmuted") showMuteToast(true);
            else if (state === "muted") showMuteToast(false);
            return;
        }
    }
    try {
        video.muted = !video.muted;
        showMuteToast(!!video.muted);
    } catch (_) {}
}

function getLikeToggleTargetForVideo(video) {
    const svg = pickSvgInReelActions(video, ['svg[aria-label="Like"]', 'svg[aria-label="Unlike"]']);
    if (!svg) return null;
    return closestClickTarget(svg);
}

function toggleLikeForVideo(video) {
    const target = getLikeToggleTargetForVideo(video);
    if (target) safeClick(target);
}

function getCommentToggleTargetForVideo(video) {
    const shell = getReelShellForVideo(video);
    const pickFrom = (container) => {
        if (!container) return null;
        const candidates = Array.from(
            container.querySelectorAll('[role="button"][aria-haspopup="menu"] svg[aria-label="Comment"]')
        );
        const svg = candidates[0];
        return svg ? closestClickTarget(svg) : null;
    };
    let btn = pickFrom(shell);
    if (btn) return btn;
    btn = pickFrom(getReelRoot(video));
    if (btn) return btn;

    const allVideos = Array.from(document.querySelectorAll("video"));
    const index = allVideos.indexOf(video);
    const globalSvgs = Array.from(
        document.querySelectorAll('[role="button"][aria-haspopup="menu"] svg[aria-label="Comment"]')
    );
    const svg = index >= 0 && index < globalSvgs.length ? globalSvgs[index] : globalSvgs[0];
    return svg ? closestClickTarget(svg) : null;
}

function toggleCommentsForVideo(video) {
    const target = getCommentToggleTargetForVideo(video);
    if (target) safeClick(target);
}

function isRelevantPage() {
    try {
        const host = location.hostname || '';
        if (!/(^|\.)instagram\.com$/.test(host)) return false;
        const p = (location.pathname || '/').toLowerCase();
        if (p.startsWith('/direct')) return false;
        return true;
    } catch (e) {
        return false;
    }
}

function isEditableTarget(target) {
    if (!target || !target.nodeType) return false;
    const tag = target.tagName && target.tagName.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return true;
    }
    if (target.isContentEditable) {
        return true;
    }
    const role = target.getAttribute && target.getAttribute('role');
    if (role && (role.toLowerCase() === 'textbox' || role.toLowerCase() === 'searchbox' || role.toLowerCase() === 'combobox')) {
        return true;
    }
    return false;
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) {
        return;
    }

    if (isEditableTarget(e.target)) {
        return;
    }

    if (e.key.toLowerCase() === 'r') {
        if (!isRelevantPage()) {
            return;
        }
        autoScrollEnabled = !autoScrollEnabled;
        try {
            chrome.storage.sync.set({ enabled: autoScrollEnabled });
        } catch (err) { }
        try {
            showAutoScrollToast(autoScrollEnabled);
        } catch (e) {}
        if (autoScrollEnabled) {
            setupVideoEndListener();
        } else {
            if (lastVideo && lastVideo._autoScrollHandler) {
                lastVideo.removeEventListener("ended", lastVideo._autoScrollHandler);
            }
            lastVideo = null;
        }
    }

    const currentVideo = getCurrentVideo();
    if (!currentVideo) return;

    if (e.key.toLowerCase() === "c") {
        toggleCommentsForVideo(currentVideo);
    }

    if (e.key.toLowerCase() === "f") {
        toggleLikeForVideo(currentVideo);
    }

    if (e.key.toLowerCase() === "m") {
        if (!isRelevantPage()) return;
        toggleAudioForVideo(currentVideo);
    }
});

function injectAutoScrollToastStyles() {
    if (document.getElementById('autoscroll-toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'autoscroll-toast-styles';
    style.textContent = `
        @keyframes expandDown {
            from {
                opacity: 0;
                max-height: 0;
            }
            to {
                opacity: 1;
                max-height: 500px;
            }
        }

        #autoscroll-toast-unique-v1 {
            position: fixed;
            right: 80px;
            top: 20px;
            z-index: 2147483647;
            background: #f5f5f5;
            color: #333;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border: 1px solid #ddd;
            font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, "Neue Haas Grotesk Text Pro", "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-weight: 500;
            pointer-events: auto;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        #autoscroll-toast-unique-v1 .toast-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 12px;
            flex-shrink: 0;
        }

        .toast-expanded {
            display: flex;
            flex-direction: column;
            gap: 0;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            transition: max-height 0.3s ease, opacity 0.3s ease;
        }

        #autoscroll-toast-unique-v1:hover .toast-expanded {
            max-height: 500px;
            opacity: 1;
        }

        .toast-card {
            background: #ffffff;
            border-radius: 5px;
            padding: 5px;
            margin-bottom: 12px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .toast-card h3 {
            font-size: 16px;
            margin: 8px 8px 10px 8px;
            font-weight: 600;
            width: 100%;
            text-align: center;
        }

        .toast-card h2 {
            font-size: 14px;
            margin: 8px 8px 10px 8px;
            font-weight: 600;
            width: 100%;
            text-align: center;
        }

        .toast-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 26px;
            margin: 0 auto 12px auto;
        }

        .toast-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .toast-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ec5c56;
            border-radius: 26px;
        }

        .toast-slider::before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            border-radius: 50%;
            transition: transform 0.2s;
        }

        .toast-switch input:checked + .toast-slider {
            background-color: #6fce6e;
        }

        .toast-switch input:checked + .toast-slider:before {
            transform: translateX(34px);
        }

        .toast-shortcut-list {
            list-style: none;
            padding: 0 8px 8px 8px;
            margin: 0;
        }

        .toast-shortcut-list li {
            display: grid;
            grid-template-columns: 1fr 28px;
            text-align: left;
            gap: 8px;
            padding: 4px 0;
            font-size: 12px;
        }

        .toast-shortcut-list .label {
            font-size: 12px;
            white-space: nowrap;
        }

        .toast-shortcut-list kbd {
            font-size: 10px;
            font-family: inherit;
            padding: 4px 0px;
            border-radius: 8px;
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            min-width: 28px;
            text-align: center;
        }

        .toast-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            font-size: 10px;
            color: #7a7a7a;
            border-top: 1px solid #f0f0f0;
        }

        .toast-chevron {
            margin-left: 10px;
            width: 5px;
            height: 5px;
            border-right: 1.5px solid #333;
            border-bottom: 1.5px solid #333;
            transform: rotate(45deg);
            display: inline-block;
        }
    `;
    document.documentElement.appendChild(style);
}

function showAutoScrollToast(enabled) {
    if (!isRelevantPage()) return;
    try {
        injectAutoScrollToastStyles();
        const id = 'autoscroll-toast-unique-v1';
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            document.documentElement.appendChild(el);
        }

        el.innerHTML = '';
        el.style.display = 'flex';
        const header = document.createElement('div');
        header.className = 'toast-header';
        
        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('icon48.png');
        img.style.width = '24px';
        img.style.height = '24px';
        img.style.flexShrink = '0';
        header.appendChild(img);
        
        const text = document.createElement('span');
        text.id = 'autoscroll-text';
        text.textContent = `Auto Scroll: ${enabled ? 'On' : 'Off'}`;
        header.appendChild(text);
        
        const chevron = document.createElement('span');
        chevron.className = 'toast-chevron';
        header.appendChild(chevron);
        
        el.appendChild(header);
        const expanded = document.createElement('div');
        expanded.className = 'toast-expanded';
        const card1 = document.createElement('div');
        card1.className = 'toast-card';
        card1.innerHTML = `
            <h3 class="card-title">Instagram Auto Scroll</h3>
            <label class="toast-switch">
                <input type="checkbox" id="toast-enabled" ${enabled ? 'checked' : ''} />
                <span class="toast-slider"></span>
            </label>
        `;
        expanded.appendChild(card1);
        const card2 = document.createElement('div');
        card2.className = 'toast-card';
        card2.innerHTML = `
            <h2 class="card-title">Keyboard shortcuts</h2>
            <ul class="toast-shortcut-list">
                <li>
                    <span class="label">Toggle Auto Scroll</span>
                    <kbd>R</kbd>
                </li>
                <li>
                    <span class="label">Like</span>
                    <kbd>F</kbd>
                </li>
                <li>
                    <span class="label">Open Comments</span>
                    <kbd>C</kbd>
                </li>
                <li>
                    <span class="label">Mute/Unmute</span>
                    <kbd>M</kbd>
                </li>
            </ul>
        `;
        expanded.appendChild(card2);
        const footer = document.createElement('div');
        footer.className = 'toast-footer';
        footer.innerHTML = `
            <div class="toast-feedback">
                Feedback? Click <a href="https://docs.google.com/forms/d/e/1FAIpQLScElo0xb6CCIPFu_AEp6t06LsUS3XDrpa6zshlIq8RTuCq-Fw/viewform?usp=publish-editor" target="_blank" rel="noopener noreferrer">here.</a>
            </div>
            <div class="version-number">v1.5.3</div>
        `;
        expanded.appendChild(footer);

        el.appendChild(expanded);
        const toastCheckbox = el.querySelector('#toast-enabled');
        if (toastCheckbox) {
            toastCheckbox.addEventListener('change', (e) => {
                autoScrollEnabled = e.target.checked;
                try {
                    chrome.storage.sync.set({ enabled: autoScrollEnabled });
                } catch (err) { }
            });
        }

    } catch (e) { }
}

function injectMuteToastStyles() {
    if (document.getElementById('mute-toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'mute-toast-styles';
    style.textContent = `
        @keyframes muteToastSlideIn {
            from {
                opacity: 0;
                transform: translateY(-2px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes muteToastSlideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-2px);
            }
        }
        #muteunmute-toast-unique-v1 {
            animation: muteToastSlideIn 0.1s ease-out;
        }
        #muteunmute-toast-unique-v1.hide {
            animation: muteToastSlideOut 0.1s ease-in forwards;
        }
    `;
    document.documentElement.appendChild(style);
}

function showMuteToast(muted) {
    if (!isRelevantPage()) return;
    try {
        injectMuteToastStyles();
        const id = 'muteunmute-toast-unique-v1';
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.style.position = 'fixed';
            el.style.right = '80px';
            el.style.top = '70px';
            el.style.zIndex = '2147483647';
            el.style.background = '#555';
            el.style.color = '#fff';
            el.style.padding = '10px 12px';
            el.style.borderRadius = '8px';
            el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            el.style.border = '1px solid #666';
            el.style.fontSize = '13px';
            el.style.fontFamily = 'Arial, Helvetica, sans-serif';
            el.style.fontWeight = '500';
            el.style.pointerEvents = 'auto';
            el.style.cursor = 'default';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.gap = '8px';
            document.documentElement.appendChild(el);
        }

        el.classList.remove('hide');

        if (el.children.length === 0) {
            const text = document.createElement('span');
            text.id = 'mute-text';
            el.appendChild(text);
        }

        const textEl = el.querySelector('#mute-text');
        if (textEl) {
            textEl.textContent = muted ? 'Video Muted' : 'Video Unmuted';
        }
        el.style.display = 'flex';
        
        if (el._muteToastTimeout) {
            clearTimeout(el._muteToastTimeout);
        }
        el._muteToastTimeout = setTimeout(() => {
            el.classList.add('hide');
            setTimeout(() => {
                el.remove(); // Remove from DOM so animation re-triggers next time
            }, 300); // Match animation duration
        }, 2000);
    } catch (e) { }
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes.enabled) {
        autoScrollEnabled = !!changes.enabled.newValue;
        try {
            if (isRelevantPage()) {
                showAutoScrollToast(autoScrollEnabled);
            }
        } catch (e) {}
    }
    if (changes.preferredMuteState) {
        preferredMuteState = !!changes.preferredMuteState.newValue;
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoScrollCard);
} else {
    initializeAutoScrollCard();
}

startWatchdog();
startToastUpdateWatchdog();
