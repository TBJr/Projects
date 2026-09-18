/*
 * Author: Thomas Brown
 * Website: https://thomasbrown.app
 */

const colorFields = {
    foreground: {
        picker: document.querySelector('#foreground-picker'),
        hex: document.querySelector('#foreground-hex'),
        error: document.querySelector('#foreground-error')
    },
    background: {
        picker: document.querySelector('#background-picker'),
        hex: document.querySelector('#background-hex'),
        error: document.querySelector('#background-error')
    }
};
const swapButton = document.querySelector('#swap-colors');
const presetButtons = document.querySelectorAll('.preset-button');
const ratioValue = document.querySelector('#ratio-value');
const ratioCaption = document.querySelector('#ratio-caption');
const resultAnnouncement = document.querySelector('#result-announcement');
const previewSurface = document.querySelector('#preview-surface');
const criteria = [
    { card: document.querySelector('#normal-aa-card'), result: document.querySelector('#normal-aa-result'), minimum: 4.5 },
    { card: document.querySelector('#normal-aaa-card'), result: document.querySelector('#normal-aaa-result'), minimum: 7 },
    { card: document.querySelector('#large-aa-card'), result: document.querySelector('#large-aa-result'), minimum: 3 },
    { card: document.querySelector('#large-aaa-card'), result: document.querySelector('#large-aaa-result'), minimum: 4.5 },
    { card: document.querySelector('#ui-aa-card'), result: document.querySelector('#ui-aa-result'), minimum: 3 }
];
const colors = {
    foreground: '#19352A',
    background: '#F6F8F4'
};

function normalizeHex(value) {
    const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(value.trim());
    if (!match) return null;
    const digits = match[1].length === 3
        ? [...match[1]].map((digit) => digit + digit).join('')
        : match[1];
    return `#${digits.toUpperCase()}`;
}

function relativeLuminance(hex) {
    const channels = [1, 3, 5].map((start) => {
        const srgb = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
        return srgb <= 0.04045
            ? srgb / 12.92
            : ((srgb + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(first, second) {
    const firstLuminance = relativeLuminance(first);
    const secondLuminance = relativeLuminance(second);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);
    return (lighter + 0.05) / (darker + 0.05);
}

function displayRatio(ratio) {
    return (Math.floor(ratio * 100) / 100).toFixed(2);
}

function setError(kind, message) {
    const field = colorFields[kind];
    if (field.error.textContent !== message) field.error.textContent = message;
    field.error.hidden = !message;
    if (message) field.hex.setAttribute('aria-invalid', 'true');
    else field.hex.removeAttribute('aria-invalid');
}

function render(announce = false) {
    const ratio = contrastRatio(colors.foreground, colors.background);
    const readableRatio = displayRatio(ratio);
    ratioValue.textContent = readableRatio;
    ratioCaption.textContent = `${colors.foreground} on ${colors.background}`;
    previewSurface.style.setProperty('--preview-foreground', colors.foreground);
    previewSurface.style.setProperty('--preview-background', colors.background);

    let passed = 0;
    for (const criterion of criteria) {
        const meetsMinimum = ratio >= criterion.minimum;
        if (meetsMinimum) passed += 1;
        criterion.result.textContent = meetsMinimum ? 'Pass' : 'Fail';
        criterion.card.classList.toggle('passes', meetsMinimum);
        criterion.card.classList.toggle('fails', !meetsMinimum);
    }
    if (announce) {
        resultAnnouncement.textContent = `Contrast ratio ${readableRatio} to 1. ${passed} of ${criteria.length} checks pass.`;
    }
}

function applyColor(kind, rawValue, syncText = true, announce = false) {
    const normalized = normalizeHex(rawValue);
    if (!normalized) return false;
    colors[kind] = normalized;
    colorFields[kind].picker.value = normalized.toLowerCase();
    if (syncText) colorFields[kind].hex.value = normalized;
    setError(kind, '');
    render(announce);
    return true;
}

function syncAll(announce = false) {
    for (const kind of ['foreground', 'background']) {
        colorFields[kind].picker.value = colors[kind].toLowerCase();
        colorFields[kind].hex.value = colors[kind];
        setError(kind, '');
    }
    render(announce);
}

for (const kind of ['foreground', 'background']) {
    const field = colorFields[kind];
    field.picker.addEventListener('input', () => applyColor(kind, field.picker.value));
    field.picker.addEventListener('change', () => applyColor(kind, field.picker.value, true, true));
    field.hex.addEventListener('input', () => {
        applyColor(kind, field.hex.value, false);
    });
    field.hex.addEventListener('blur', () => {
        if (!applyColor(kind, field.hex.value, true, true)) {
            setError(kind, 'Use #RGB or #RRGGBB. The preview uses the last valid color.');
        }
    });
    field.hex.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            field.hex.blur();
        }
    });
}

swapButton.addEventListener('click', () => {
    [colors.foreground, colors.background] = [colors.background, colors.foreground];
    syncAll(true);
});

for (const button of presetButtons) {
    button.addEventListener('click', () => {
        colors.foreground = normalizeHex(button.dataset.foreground);
        colors.background = normalizeHex(button.dataset.background);
        syncAll(true);
    });
}

syncAll();
