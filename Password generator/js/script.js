/*
 * Author: Thomas Brown
 * Website: https://thomasbrown.app
 */

const CHARACTER_SETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}?'
};
const RANDOM_RANGE = 2 ** 32;
const APPLE_CONSONANTS = 'bcdfghjklmnprstvwxz';
const APPLE_VOWELS = 'aeiouy';
const APPLE_DIGIT_POSITIONS = [5, 7, 12, 14, 19];
const issuedPasswords = new Set();
const customFormat = document.querySelector('#format-custom');
const appleFormat = document.querySelector('#format-apple');
const customSettings = document.querySelector('#custom-settings');
const appleSettings = document.querySelector('#apple-settings');
const lengthRange = document.querySelector('#length-range');
const lengthValue = document.querySelector('#length-value');
const optionInputs = {
    lowercase: document.querySelector('#include-lowercase'),
    uppercase: document.querySelector('#include-uppercase'),
    numbers: document.querySelector('#include-numbers'),
    symbols: document.querySelector('#include-symbols')
};
const optionsError = document.querySelector('#options-error');
const selectionSummary = document.querySelector('#selection-summary');
const settingCaution = document.querySelector('#setting-caution');
const generateButton = document.querySelector('#generate-button');
const passwordOutput = document.querySelector('#password-output');
const visibilityButton = document.querySelector('#toggle-visibility');
const copyButton = document.querySelector('#copy-button');
const generatorStatus = document.querySelector('#generator-status');
const copyStatus = document.querySelector('#copy-status');

function selectedSets() {
    return Object.entries(optionInputs)
        .filter(([, input]) => input.checked)
        .map(([name]) => CHARACTER_SETS[name]);
}

function setStatus(message, isError = false) {
    if (generatorStatus.textContent !== message) generatorStatus.textContent = message;
    generatorStatus.classList.toggle('is-error', isError);
}

function clearOutput() {
    passwordOutput.value = '';
    passwordOutput.type = 'password';
    visibilityButton.textContent = 'Show password';
    visibilityButton.disabled = true;
    copyButton.disabled = true;
    copyStatus.textContent = '';
}

function updateSettings(initial = false) {
    const sets = selectedSets();
    const count = sets.length;
    const length = Number(lengthRange.value);
    const isAppleStyle = appleFormat.checked;
    customSettings.hidden = isAppleStyle;
    appleSettings.hidden = !isAppleStyle;
    lengthValue.textContent = length;
    selectionSummary.textContent = `${length} characters · ${count} ${count === 1 ? 'type' : 'types'} selected`;
    const poolSize = sets.join('').length;
    settingCaution.hidden = isAppleStyle || count === 0 || length * Math.log2(poolSize) >= 60;
    optionsError.hidden = isAppleStyle || count > 0;
    generateButton.disabled = !isAppleStyle && count === 0;
    if (!initial) {
        clearOutput();
        const missingTypes = !isAppleStyle && count === 0;
        setStatus(missingTypes ? 'Select at least one character type.' : 'Settings changed. Generate a new password.', missingTypes);
    }
}

function secureRandomIndex(size) {
    if (!Number.isInteger(size) || size < 1 || size > RANDOM_RANGE) {
        throw new Error('The character set is invalid.');
    }
    if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
        throw new Error('Secure random generation is unavailable in this browser.');
    }
    const limit = RANDOM_RANGE - (RANDOM_RANGE % size);
    const value = new Uint32Array(1);
    do {
        globalThis.crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % size;
}

function createPassword(length, sets) {
    if (!Number.isInteger(length) || length < 8 || length > 64 || !sets.length || sets.length > length) {
        throw new Error('Choose a length from 8 to 64 and at least one character type.');
    }
    const alphabet = sets.join('');
    for (let attempt = 0; attempt < 1000; attempt += 1) {
        const characters = Array.from({ length }, () => alphabet[secureRandomIndex(alphabet.length)]);
        if (sets.every((set) => characters.some((character) => set.includes(character)))) {
            return characters.join('');
        }
    }
    throw new Error('A password could not be generated. Try again.');
}

function createAppleStylePassword() {
    const letters = Array.from({ length: 18 }, (_, index) => {
        const alphabet = index % 3 === 1 ? APPLE_VOWELS : APPLE_CONSONANTS;
        return alphabet[secureRandomIndex(alphabet.length)];
    });
    const characters = [
        ...letters.slice(0, 6), '-',
        ...letters.slice(6, 12), '-',
        ...letters.slice(12)
    ];
    const digitPosition = APPLE_DIGIT_POSITIONS[secureRandomIndex(APPLE_DIGIT_POSITIONS.length)];
    characters[digitPosition] = CHARACTER_SETS.numbers[secureRandomIndex(CHARACTER_SETS.numbers.length)];
    const letterPositions = characters
        .map((character, index) => /[a-z]/.test(character) ? index : -1)
        .filter((index) => index >= 0);
    const uppercasePosition = letterPositions[secureRandomIndex(letterPositions.length)];
    characters[uppercasePosition] = characters[uppercasePosition].toUpperCase();
    return characters.join('');
}

function createUniquePassword(generator) {
    for (let attempt = 0; attempt < 1000; attempt += 1) {
        const password = generator();
        if (!issuedPasswords.has(password)) {
            issuedPasswords.add(password);
            return password;
        }
    }
    throw new Error('A new password could not be created without repeating a previous result. Try again.');
}

customFormat.addEventListener('change', () => updateSettings());
appleFormat.addEventListener('change', () => updateSettings());
lengthRange.addEventListener('input', () => updateSettings());
for (const input of Object.values(optionInputs)) {
    input.addEventListener('change', () => updateSettings());
}

generateButton.addEventListener('click', () => {
    try {
        const isAppleStyle = appleFormat.checked;
        const password = createUniquePassword(() => isAppleStyle
            ? createAppleStylePassword()
            : createPassword(Number(lengthRange.value), selectedSets()));
        clearOutput();
        passwordOutput.value = password;
        visibilityButton.disabled = false;
        copyButton.disabled = false;
        setStatus(isAppleStyle
            ? 'New 20-character Apple-style password generated.'
            : `New ${password.length}-character password generated.`);
    } catch (error) {
        setStatus(error.message || 'A password could not be generated.', true);
    }
});

visibilityButton.addEventListener('click', () => {
    if (!passwordOutput.value) return;
    const reveal = passwordOutput.type === 'password';
    passwordOutput.type = reveal ? 'text' : 'password';
    visibilityButton.textContent = reveal ? 'Hide password' : 'Show password';
});

copyButton.addEventListener('click', async () => {
    const password = passwordOutput.value;
    if (!password) return;
    copyStatus.textContent = '';
    try {
        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('Clipboard access is unavailable.');
        }
        await navigator.clipboard.writeText(password);
        if (passwordOutput.value === password) copyStatus.textContent = 'Copied to clipboard.';
    } catch {
        if (passwordOutput.value !== password) return;
        passwordOutput.focus();
        passwordOutput.select();
        copyStatus.textContent = 'Clipboard access is unavailable. Press Command+C or Ctrl+C to copy the selected password.';
    }
});

window.addEventListener('pagehide', () => {
    clearOutput();
    issuedPasswords.clear();
});
updateSettings(true);
