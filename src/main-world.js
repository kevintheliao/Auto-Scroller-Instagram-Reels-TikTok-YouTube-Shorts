"use strict";

// Runs in the page (MAIN) world on TikTok. TikTok's React handlers ignore
// synthetic DOM clicks (isTrusted check), so the isolated-world content script
// marks a button with data-igas-click and fires this event; here we can reach
// React's onClick prop directly and call it.
window.addEventListener("igas-react-click", () => {
    const el = document.querySelector("[data-igas-click]");
    if (!el) return;
    el.removeAttribute("data-igas-click");

    let props = null;
    try {
        const key = Object.keys(el).find((k) => k.indexOf("__reactProps$") === 0);
        props = key ? el[key] : null;
    } catch (_) { }

    if (props && typeof props.onClick === "function") {
        try {
            props.onClick({
                isTrusted: true,
                type: "click",
                target: el,
                currentTarget: el,
                stopPropagation() { },
                preventDefault() { },
                persist() { },
                nativeEvent: new MouseEvent("click", { bubbles: true }),
                clientX: 0,
                clientY: 0,
                button: 0,
            });
            return;
        } catch (_) { }
    }
    try { el.click(); } catch (_) { }
});
