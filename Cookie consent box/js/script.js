const banner = document.getElementById("consent-banner");
const dialog = document.getElementById("preferences-dialog");
const form = document.getElementById("preferences-form");
const counterChoice = document.getElementById("counter-choice");
const choiceStatus = document.getElementById("choice-status");
const storageStatus = document.getElementById("storage-status");
const counterStatus = document.getElementById("counter-status");
const openSettings = document.getElementById("open-settings");
const customize = document.getElementById("customize");
const acceptAll = document.getElementById("accept-all");
const rejectOptional = document.getElementById("reject-optional");

const cookieName = "cookie_consent_demo_v2";
const storageKey = "cookie-consent-demo-v2";
const counterKey = "cookie-consent-demo-local-visits";
const cookieLifetime = 60 * 60 * 24 * 180;
const validChoices = new Set(["all", "necessary"]);
let currentChoice = null;
let countedThisPage = false;
let returnFocusTo = null;

function readCookie(name) {
    try {
        const entry = document.cookie.split(";").find((part) => part.trim().startsWith(`${name}=`));
        return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : null;
    } catch {
        return null;
    }
}

function clearOldPreference() {
    try {
        if (readCookie("cookie_consent_demo_preference") !== null) {
            document.cookie = "cookie_consent_demo_preference=; Max-Age=0; SameSite=Lax";
        }
    } catch {
        // The old cookie may be blocked by the browser.
    }

    try {
        localStorage.removeItem("cookie-consent-demo-preference");
    } catch {
        // The old local value may be unavailable.
    }
}

function readSavedChoice() {
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
            const saved = JSON.parse(raw);
            if (validChoices.has(saved.choice) && Number.isFinite(saved.expiresAt) && saved.expiresAt > Date.now()) {
                return { choice: saved.choice, storage: "local" };
            }
            localStorage.removeItem(storageKey);
        }
    } catch {
        // Browser storage can be unavailable or contain an old value.
    }

    const cookieChoice = readCookie(cookieName);
    return validChoices.has(cookieChoice)
        ? { choice: cookieChoice, storage: "cookie" }
        : { choice: null, storage: null };
}

function saveChoice(choice) {
    const secure = location.protocol === "https:" ? "; Secure" : "";

    try {
        document.cookie = `${cookieName}=${encodeURIComponent(choice)}; Max-Age=${cookieLifetime}; SameSite=Lax${secure}`;
        if (readCookie(cookieName) === choice) {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                // The cookie keeps the choice if local storage is unavailable.
            }
            return "cookie";
        }
    } catch {
        // Use local storage if cookies are blocked.
    }

    try {
        const saved = JSON.stringify({ choice, expiresAt: Date.now() + cookieLifetime * 1000 });
        localStorage.setItem(storageKey, saved);
        if (localStorage.getItem(storageKey) === saved) {
            return "local";
        }
    } catch {
        // The choice can still be used until this page is reloaded.
    }

    return "session";
}

function updateCounter(choice) {
    if (choice !== "all") {
        countedThisPage = false;
        try {
            localStorage.removeItem(counterKey);
            counterStatus.textContent = localStorage.getItem(counterKey) === null
                ? "Local visit counter is off."
                : "The saved count could not be removed. Clear this site's browser storage to remove it.";
        } catch {
            counterStatus.textContent = "The local counter is off, but stored data could not be checked.";
        }
        return;
    }

    if (countedThisPage) {
        return;
    }

    try {
        const raw = localStorage.getItem(counterKey);
        const previous = raw && /^\d+$/.test(raw) ? Number(raw) : 0;
        const count = Number.isSafeInteger(previous) ? previous + 1 : 1;
        localStorage.setItem(counterKey, String(count));
        if (localStorage.getItem(counterKey) === String(count)) {
            countedThisPage = true;
            counterStatus.textContent = `Local visits counted: ${count}. Nothing leaves this browser.`;
            return;
        }
    } catch {
        // The optional counter cannot run without browser storage.
    }

    counterStatus.textContent = "The local counter is unavailable because browser storage is blocked.";
}

function showChoice(choice, storage) {
    currentChoice = choice;
    banner.hidden = choice !== null;
    document.body.classList.toggle("banner-visible", choice === null);

    if (choice === null) {
        choiceStatus.textContent = "No choice saved";
        storageStatus.textContent = "Use the prompt below to set your preference.";
        updateCounter(null);
        return;
    }

    choiceStatus.textContent = choice === "all"
        ? "Local counter allowed"
        : "Necessary storage only";

    const storageMessages = {
        cookie: "Saved in a first-party cookie for 180 days.",
        local: "Saved in local browser storage for 180 days because the cookie could not be updated.",
        session: "Active for this visit. Your browser did not allow this choice to be saved."
    };
    storageStatus.textContent = storageMessages[storage];
    updateCounter(choice);
}

function choose(choice) {
    showChoice(choice, saveChoice(choice));
}

function showPreferences(event) {
    returnFocusTo = event.currentTarget;
    counterChoice.checked = currentChoice === "all";
    dialog.showModal();
}

openSettings.addEventListener("click", showPreferences);
customize.addEventListener("click", showPreferences);

acceptAll.addEventListener("click", () => {
    choose("all");
    openSettings.focus();
});

rejectOptional.addEventListener("click", () => {
    choose("necessary");
    openSettings.focus();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    returnFocusTo = openSettings;
    choose(counterChoice.checked ? "all" : "necessary");
    dialog.close();
});

document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
document.getElementById("cancel-dialog").addEventListener("click", () => dialog.close());

dialog.addEventListener("close", () => {
    if (returnFocusTo && !returnFocusTo.closest("[hidden]")) {
        returnFocusTo.focus();
    } else {
        openSettings.focus();
    }
});

clearOldPreference();
const savedChoice = readSavedChoice();
showChoice(savedChoice.choice, savedChoice.storage);
openSettings.disabled = false;
acceptAll.disabled = false;
rejectOptional.disabled = false;
customize.disabled = false;
