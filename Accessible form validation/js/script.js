/*
 * Author: Thomas Brown
 * Website: https://thomasbrown.app
 */

const form = document.querySelector('#contact-form');
const scriptNote = document.querySelector('#script-note');
const errorSummary = document.querySelector('#error-summary');
const errorTitle = document.querySelector('#error-title');
const errorList = document.querySelector('#error-list');
const validationStatus = document.querySelector('#validation-status');
const successPanel = document.querySelector('#success-panel');
const startOver = document.querySelector('#start-over');
const messageCount = document.querySelector('#message-count');
const messageInput = document.querySelector('#message');

const fields = [
    {
        id: 'full-name',
        label: 'Full name',
        check(input) {
            const value = input.value.trim();
            if (!value) return 'Enter your full name.';
            if (value.length < 2) return 'Enter at least 2 characters for your full name.';
            return '';
        }
    },
    {
        id: 'email',
        label: 'Email address',
        check(input) {
            if (!input.value.trim()) return 'Enter your email address.';
            if (input.validity.typeMismatch) return 'Enter an email address in the format name@example.com.';
            return '';
        }
    },
    {
        id: 'topic',
        label: 'Topic',
        check(input) {
            return input.value ? '' : 'Choose a topic.';
        }
    },
    {
        id: 'message',
        label: 'Message',
        check(input) {
            const value = input.value.trim();
            if (!value) return 'Enter a message.';
            if (value.length < 20) return 'Enter at least 20 characters in your message.';
            return '';
        }
    }
];

const touched = new Set();
let attempted = false;

function inputFor(field) {
    return document.getElementById(field.id);
}

function errorFor(field) {
    return document.getElementById(`${field.id}-error`);
}

function updateMessageCount() {
    messageCount.textContent = `${messageInput.value.length} / 500`;
}

function showFieldError(field, message) {
    const input = inputFor(field);
    const error = errorFor(field);
    const wrapper = input.closest('.field');
    error.textContent = message;
    error.hidden = !message;
    wrapper.classList.toggle('has-error', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
}

function validateField(field, announce = false) {
    const previousMessage = errorFor(field).textContent;
    const message = field.check(inputFor(field));
    showFieldError(field, message);
    if (announce && previousMessage !== message) {
        validationStatus.textContent = message
            ? `${field.label}: ${message}`
            : `${field.label} is valid.`;
    }
    return message;
}

function visibleErrors() {
    return fields
        .map((field) => ({ field, message: errorFor(field).textContent }))
        .filter(({ message }) => Boolean(message));
}

function renderSummary(errors) {
    errorList.replaceChildren();
    if (!errors.length) {
        errorSummary.hidden = true;
        return;
    }

    errorTitle.textContent = errors.length === 1
        ? 'Please fix 1 field:'
        : `Please fix ${errors.length} fields:`;
    for (const { field, message } of errors) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${field.id}`;
        link.dataset.target = field.id;
        link.textContent = `${field.label}: ${message}`;
        item.append(link);
        errorList.append(item);
    }
    errorSummary.hidden = false;
}

for (const field of fields) {
    const input = inputFor(field);
    input.addEventListener('blur', () => {
        touched.add(field.id);
        validateField(field, true);
        if (attempted) renderSummary(visibleErrors());
    });
    const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventName, () => {
        if (field.id === 'message') updateMessageCount();
        if (touched.has(field.id) || attempted) {
            validateField(field, true);
            if (attempted) renderSummary(visibleErrors());
        }
    });
}

errorList.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-target]');
    if (!link) return;
    event.preventDefault();
    document.getElementById(link.dataset.target).focus();
});

form.addEventListener('submit', (event) => {
    event.preventDefault();
    attempted = true;
    validationStatus.textContent = '';
    for (const field of fields) validateField(field);
    const errors = visibleErrors();
    renderSummary(errors);
    if (errors.length) {
        errorSummary.focus();
        return;
    }

    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
});

startOver.addEventListener('click', () => {
    form.reset();
    attempted = false;
    touched.clear();
    for (const field of fields) showFieldError(field, '');
    renderSummary([]);
    validationStatus.textContent = '';
    updateMessageCount();
    successPanel.hidden = true;
    form.hidden = false;
    inputFor(fields[0]).focus();
});

updateMessageCount();
scriptNote.hidden = true;
form.hidden = false;
