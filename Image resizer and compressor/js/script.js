/*
 * Author: Thomas Brown
 * Website: https://thomasbrown.app
 */

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 40_000_000;
const MAX_OUTPUT_PIXELS = 16_000_000;
const MAX_SIDE = 8192;
const SUPPORTED_TYPES = new Map([
    ['image/jpeg', { label: 'JPEG', extension: 'jpg' }],
    ['image/png', { label: 'PNG', extension: 'png' }],
    ['image/webp', { label: 'WebP', extension: 'webp' }]
]);
const EXTENSION_TYPES = new Map([
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['webp', 'image/webp']
]);

const fileInput = document.querySelector('#image-input');
const dropZone = document.querySelector('#drop-zone');
const statusMessage = document.querySelector('#status-message');
const workspace = document.querySelector('#workspace');
const form = document.querySelector('#image-form');
const maxWidth = document.querySelector('#max-width');
const maxHeight = document.querySelector('#max-height');
const outputFormat = document.querySelector('#output-format');
const qualityField = document.querySelector('#quality-field');
const outputQuality = document.querySelector('#output-quality');
const qualityValue = document.querySelector('#quality-value');
const formatNote = document.querySelector('#format-note');
const createButton = document.querySelector('#create-button');
const originalPreview = document.querySelector('#original-preview');
const originalDetails = document.querySelector('#original-details');
const resultPreview = document.querySelector('#result-preview');
const resultPlaceholder = document.querySelector('#result-placeholder');
const resultDetails = document.querySelector('#result-details');
const sizeChange = document.querySelector('#size-change');
const downloadLink = document.querySelector('#download-link');

let sourceFile = null;
let sourceImage = null;
let sourceUrl = null;
let outputUrl = null;
let busy = false;

function setStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('is-error', isError);
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setBusy(isBusy) {
    busy = isBusy;
    fileInput.disabled = isBusy;
    maxWidth.disabled = isBusy;
    maxHeight.disabled = isBusy;
    outputFormat.disabled = isBusy;
    outputQuality.disabled = isBusy;
    createButton.disabled = isBusy;
    dropZone.classList.toggle('is-busy', isBusy);
}

function clearOutput() {
    resultPreview.hidden = true;
    resultPreview.removeAttribute('src');
    resultPlaceholder.hidden = false;
    resultDetails.textContent = 'Waiting for output';
    sizeChange.hidden = true;
    sizeChange.textContent = '';
    downloadLink.hidden = true;
    downloadLink.removeAttribute('href');
    downloadLink.removeAttribute('download');
    if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
        outputUrl = null;
    }
}

function clearSource() {
    clearOutput();
    originalPreview.removeAttribute('src');
    originalDetails.textContent = '';
    sourceFile = null;
    sourceImage = null;
    workspace.hidden = true;
    if (sourceUrl) {
        URL.revokeObjectURL(sourceUrl);
        sourceUrl = null;
    }
}

function sourceType(file) {
    if (SUPPORTED_TYPES.has(file.type)) return file.type;
    if (file.type) return null;
    const extension = file.name.split('.').pop().toLowerCase();
    return EXTENSION_TYPES.get(extension) || null;
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('This file could not be opened as an image.'));
        image.src = url;
    });
}

function updateFormatControls() {
    const isPng = outputFormat.value === 'image/png';
    qualityField.hidden = isPng;
    formatNote.hidden = outputFormat.value !== 'image/jpeg';
}

function fitWithin(sourceWidth, sourceHeight, requestedWidth, requestedHeight) {
    const scale = Math.min(
        1,
        requestedWidth / sourceWidth,
        requestedHeight / sourceHeight,
        MAX_SIDE / sourceWidth,
        MAX_SIDE / sourceHeight,
        Math.sqrt(MAX_OUTPUT_PIXELS / (sourceWidth * sourceHeight))
    );
    return {
        width: Math.max(1, Math.floor(sourceWidth * scale)),
        height: Math.max(1, Math.floor(sourceHeight * scale))
    };
}

async function selectFile(file) {
    if (busy) return;
    clearSource();

    if (!file) {
        setStatus('Choose an image to begin.');
        return;
    }
    const type = sourceType(file);
    if (!type) {
        setStatus('Choose a PNG, JPEG, or WebP image.', true);
        return;
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
        setStatus('Choose an image larger than 0 bytes and no more than 25 MB.', true);
        return;
    }

    setBusy(true);
    setStatus('Opening image…');
    let nextUrl = null;
    try {
        nextUrl = URL.createObjectURL(file);
        const image = await loadImage(nextUrl);
        const pixels = image.naturalWidth * image.naturalHeight;
        if (!pixels || pixels > MAX_SOURCE_PIXELS) {
            throw new Error('This image is too large to process. The limit is 40 megapixels.');
        }

        sourceFile = file;
        sourceImage = image;
        sourceUrl = nextUrl;
        originalPreview.src = nextUrl;
        originalPreview.alt = `Preview of ${file.name}`;
        originalDetails.textContent = `${image.naturalWidth} × ${image.naturalHeight} px · ${formatBytes(file.size)} · ${SUPPORTED_TYPES.get(type).label}`;
        maxWidth.value = Math.min(image.naturalWidth, MAX_SIDE);
        maxHeight.value = Math.min(image.naturalHeight, MAX_SIDE);
        outputFormat.value = type;
        updateFormatControls();
        workspace.hidden = false;
        setStatus(`${file.name} is ready. Set the output options and create your image.`);
    } catch (error) {
        if (nextUrl) URL.revokeObjectURL(nextUrl);
        setStatus(error.message || 'This image could not be opened.', true);
    } finally {
        setBusy(false);
    }
}

function outputName(fileName, extension) {
    const base = fileName.replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 80);
    return `${base || 'image'}-resized.${extension}`;
}

async function createImage(event) {
    event.preventDefault();
    if (busy || !sourceImage || !sourceFile) return;

    const requestedWidth = Number(maxWidth.value);
    const requestedHeight = Number(maxHeight.value);
    if (!Number.isInteger(requestedWidth) || !Number.isInteger(requestedHeight) ||
        requestedWidth < 1 || requestedHeight < 1 ||
        requestedWidth > MAX_SIDE || requestedHeight > MAX_SIDE) {
        setStatus('Enter a maximum width and height from 1 to 8192 pixels.', true);
        return;
    }

    const type = outputFormat.value;
    const details = SUPPORTED_TYPES.get(type);
    if (!details) {
        setStatus('Choose a supported output format.', true);
        return;
    }

    clearOutput();
    setBusy(true);
    setStatus('Creating image…');
    const canvas = document.createElement('canvas');
    try {
        const dimensions = fitWithin(
            sourceImage.naturalWidth,
            sourceImage.naturalHeight,
            requestedWidth,
            requestedHeight
        );
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser could not prepare the image.');

        if (type === 'image/jpeg') {
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        const quality = Number(outputQuality.value) / 100;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
        if (!blob || blob.type !== type) {
            throw new Error(`This browser could not create a ${details.label} file. Try another format.`);
        }

        outputUrl = URL.createObjectURL(blob);
        resultPreview.src = outputUrl;
        resultPreview.hidden = false;
        resultPlaceholder.hidden = true;
        resultDetails.textContent = `${dimensions.width} × ${dimensions.height} px · ${formatBytes(blob.size)} · ${details.label}`;
        const difference = sourceFile.size - blob.size;
        if (difference === 0) {
            sizeChange.textContent = 'Same file size as the original.';
        } else {
            const percent = (Math.abs(difference) / sourceFile.size * 100).toFixed(1);
            sizeChange.textContent = difference > 0
                ? `${percent}% smaller than the original (${formatBytes(Math.abs(difference))} saved).`
                : `${percent}% larger than the original (${formatBytes(Math.abs(difference))} added).`;
        }
        sizeChange.hidden = false;
        downloadLink.href = outputUrl;
        downloadLink.download = outputName(sourceFile.name, details.extension);
        downloadLink.hidden = false;
        setStatus('Image ready. Review the result and download it.');
    } catch (error) {
        clearOutput();
        setStatus(error.message || 'The image could not be created.', true);
    } finally {
        canvas.width = 0;
        canvas.height = 0;
        setBusy(false);
    }
}

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    selectFile(file);
});

dropZone.addEventListener('dragenter', (event) => {
    event.preventDefault();
    if (!busy) dropZone.classList.add('is-dragging');
});
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (!busy) dropZone.classList.add('is-dragging');
});
dropZone.addEventListener('dragleave', (event) => {
    if (!dropZone.contains(event.relatedTarget)) dropZone.classList.remove('is-dragging');
});
dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
    if (busy) return;
    selectFile(event.dataTransfer.files[0]);
});

[maxWidth, maxHeight, outputQuality].forEach((control) => {
    control.addEventListener('input', () => {
        qualityValue.textContent = `${outputQuality.value}%`;
        if (sourceFile) {
            clearOutput();
            setStatus('Settings changed. Create the image to update the result.');
        }
    });
});
outputFormat.addEventListener('change', () => {
    updateFormatControls();
    if (sourceFile) {
        clearOutput();
        setStatus('Settings changed. Create the image to update the result.');
    }
});
form.addEventListener('submit', createImage);
window.addEventListener('pagehide', clearSource);
