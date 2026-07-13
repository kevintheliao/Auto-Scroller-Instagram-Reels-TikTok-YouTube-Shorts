"use strict";

// MAIN world on IG/TikTok: React ignores synthetic clicks (isTrusted), so
// content.js marks a button + fires this event; we call its React onClick prop.
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
