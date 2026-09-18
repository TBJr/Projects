/*
 * CSV Viewer
 * Author: Thomas Brown
 * Website: https://thomasbrown.app
 */

(() => {
    "use strict";

    const MAX_FILE_BYTES = 5 * 1024 * 1024;
    const PAGE_SIZE = 25;
    const SAMPLE_CSV = [
        "Item,Category,Location,Quantity,Unit price,Status",
        '"Notebook, dotted",Stationery,Paris,24,8.50,In stock',
        "Desk lamp,Lighting,Lyon,7,32.00,Low stock",
        "Canvas tote,Accessories,Bordeaux,41,14.00,In stock",
        "Ceramic mug,Kitchen,Nantes,18,12.50,In stock",
        "Wall calendar,Stationery,Lille,0,9.00,Out of stock",
        "Plant pot,Home,Toulouse,13,16.00,In stock",
        "Pencil set,Stationery,Marseille,63,6.75,In stock",
        "Travel bottle,Accessories,Nice,5,11.00,Low stock"
    ].join("\n");

    const elements = {
        dropZone: document.getElementById("drop-zone"),
        fileInput: document.getElementById("file-input"),
        sampleButton: document.getElementById("sample-button"),
        clearButton: document.getElementById("clear-button"),
        sourceMeta: document.getElementById("source-meta"),
        sourceName: document.getElementById("source-name"),
        sourceDetails: document.getElementById("source-details"),
        delimiterSelect: document.getElementById("delimiter-select"),
        firstRowHeader: document.getElementById("first-row-header"),
        searchInput: document.getElementById("search-input"),
        errorMessage: document.getElementById("error-message"),
        emptyState: document.getElementById("empty-state"),
        emptyTitle: document.getElementById("empty-title"),
        emptyDescription: document.getElementById("empty-description"),
        resultsBar: document.getElementById("results-bar"),
        resultsCount: document.getElementById("results-count"),
        columnCount: document.getElementById("column-count"),
        tableFrame: document.getElementById("table-frame"),
        tableCaption: document.getElementById("table-caption"),
        tableHead: document.getElementById("table-head"),
        tableBody: document.getElementById("table-body"),
        pagination: document.getElementById("pagination"),
        previousPage: document.getElementById("previous-page"),
        nextPage: document.getElementById("next-page"),
        pageLabel: document.getElementById("page-label"),
        viewerStatus: document.getElementById("viewer-status")
    };

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    const numberFormat = new Intl.NumberFormat();
    const state = {
        sourceText: null,
        sourceName: "",
        rows: [],
        columns: [],
        dataRows: [],
        delimiter: ",",
        sortIndex: null,
        sortDirection: "ascending",
        page: 1,
        loadId: 0
    };

    function count(value) {
        return numberFormat.format(value);
    }

    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.hidden = false;
    }

    function clearError() {
        elements.errorMessage.textContent = "";
        elements.errorMessage.hidden = true;
    }

    function showEmpty(title, description) {
        elements.emptyTitle.textContent = title;
        elements.emptyDescription.textContent = description;
        elements.emptyState.hidden = false;
        elements.tableFrame.hidden = true;
    }

    function delimiterName(delimiter) {
        return delimiter === "\t" ? "Tab" : delimiter === ";" ? "Semicolon" : "Comma";
    }

    function selectedDelimiter() {
        const selection = elements.delimiterSelect.value;
        if (selection === "auto") {
            return window.CsvParser.detectDelimiter(state.sourceText);
        }
        return selection === "tab" ? "\t" : selection;
    }

    function resetView() {
        state.rows = [];
        state.columns = [];
        state.dataRows = [];
        state.sortIndex = null;
        state.page = 1;
        elements.searchInput.disabled = true;
        elements.searchInput.value = "";
        elements.resultsBar.hidden = true;
        elements.pagination.hidden = true;
        elements.tableHead.replaceChildren();
        elements.tableBody.replaceChildren();
        elements.viewerStatus.textContent = "";
        showEmpty("Your table will appear here.", "Choose a file or open the sample to get started.");
    }

    function updateSourceMeta() {
        const hasSource = state.sourceText !== null;
        elements.sourceMeta.hidden = !hasSource;
        elements.clearButton.hidden = !hasSource;
        if (hasSource) {
            elements.sourceName.textContent = state.sourceName;
            elements.sourceDetails.textContent = state.rows.length
                ? `${count(state.dataRows.length)} data rows · ${count(state.columns.length)} columns · ${delimiterName(state.delimiter)} separated`
                : "Preview unavailable.";
        } else {
            elements.sourceName.textContent = "";
            elements.sourceDetails.textContent = "";
        }
    }

    function buildColumns() {
        const hasHeader = elements.firstRowHeader.checked;
        const width = Math.max(...state.rows.map(row => row.length));
        const header = hasHeader ? state.rows[0] : [];
        state.columns = Array.from({ length: width }, (_, index) => header[index] || `Column ${index + 1}`);
        state.dataRows = hasHeader ? state.rows.slice(1) : state.rows.slice();
        state.sortIndex = null;
        state.page = 1;
        elements.searchInput.disabled = false;
        updateSourceMeta();
        render();
    }

    function parseSource() {
        if (state.sourceText === null) return;

        clearError();
        try {
            state.delimiter = selectedDelimiter();
            state.rows = window.CsvParser.parseCsv(state.sourceText, state.delimiter, {
                maxRows: 20000,
                maxColumns: 100
            });
            if (state.rows.length === 0) {
                throw new Error("This file is empty.");
            }
            buildColumns();
        } catch (error) {
            resetView();
            updateSourceMeta();
            showEmpty("Could not preview this file.", "Check the separator or choose another file.");
            showError(error instanceof Error ? error.message : "This file could not be read.");
        }
    }

    function renderHead() {
        const row = document.createElement("tr");
        state.columns.forEach((heading, index) => {
            const cell = document.createElement("th");
            cell.scope = "col";
            cell.setAttribute("aria-sort", state.sortIndex === index ? state.sortDirection : "none");

            const button = document.createElement("button");
            button.type = "button";
            button.className = "sort-button";
            const nextDirection = state.sortIndex === index && state.sortDirection === "ascending" ? "descending" : "ascending";
            button.setAttribute("aria-label", `Sort by ${heading}, ${nextDirection}`);

            const label = document.createElement("span");
            label.textContent = heading;
            const arrow = document.createElement("span");
            arrow.className = "sort-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = state.sortIndex === index ? (state.sortDirection === "ascending" ? "↑" : "↓") : "↕";
            button.append(label, arrow);
            button.addEventListener("click", () => {
                if (state.sortIndex === index) {
                    state.sortDirection = state.sortDirection === "ascending" ? "descending" : "ascending";
                } else {
                    state.sortIndex = index;
                    state.sortDirection = "ascending";
                }
                state.page = 1;
                render();
                elements.tableHead.querySelectorAll("button")[index].focus();
            });
            cell.append(button);
            row.append(cell);
        });
        elements.tableHead.replaceChildren(row);
    }

    function renderBody(rows) {
        const fragment = document.createDocumentFragment();
        rows.forEach(({ values }) => {
            const row = document.createElement("tr");
            state.columns.forEach((_, index) => {
                const cell = document.createElement("td");
                cell.textContent = values[index] ?? "";
                row.append(cell);
            });
            fragment.append(row);
        });
        elements.tableBody.replaceChildren(fragment);
    }

    function render() {
        const query = elements.searchInput.value.trim().toLocaleLowerCase();
        let matching = state.dataRows
            .map((values, index) => ({ values, index }))
            .filter(({ values }) => !query || values.some(value => value.toLocaleLowerCase().includes(query)));

        if (state.sortIndex !== null) {
            const column = state.sortIndex;
            const direction = state.sortDirection === "ascending" ? 1 : -1;
            matching.sort((left, right) => {
                const comparison = collator.compare(left.values[column] ?? "", right.values[column] ?? "");
                return comparison * direction || left.index - right.index;
            });
        }

        const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
        state.page = Math.min(state.page, pages);
        const first = (state.page - 1) * PAGE_SIZE;
        const visible = matching.slice(first, first + PAGE_SIZE);

        elements.resultsBar.hidden = false;
        elements.resultsCount.textContent = query
            ? `${count(matching.length)} of ${count(state.dataRows.length)} rows match`
            : `${count(state.dataRows.length)} data rows`;
        elements.columnCount.textContent = `${count(state.columns.length)} columns`;
        elements.tableCaption.textContent = `Preview of ${state.sourceName}`;

        if (matching.length === 0) {
            showEmpty(
                query ? "No matching rows." : "No data rows yet.",
                query ? "Try a different search term." : "This source only contains headings. Try another file or turn off the heading option."
            );
            elements.pagination.hidden = true;
            elements.tableHead.replaceChildren();
            elements.tableBody.replaceChildren();
            elements.viewerStatus.textContent = query ? "No rows match your search." : "No data rows to display.";
            return;
        }

        elements.emptyState.hidden = true;
        elements.tableFrame.hidden = false;
        renderHead();
        renderBody(visible);
        elements.pagination.hidden = pages <= 1;
        elements.previousPage.disabled = state.page === 1;
        elements.nextPage.disabled = state.page === pages;
        elements.pageLabel.textContent = `Page ${count(state.page)} of ${count(pages)}`;
        elements.viewerStatus.textContent = `Showing rows ${count(first + 1)}–${count(first + visible.length)} of ${count(matching.length)}${query ? " matching" : ""}.`;
    }

    async function loadFile(file) {
        const loadId = ++state.loadId;
        clearError();
        if (!file) return;
        state.sourceText = null;
        state.sourceName = "";
        resetView();
        updateSourceMeta();
        if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
            showEmpty("Choose another file.", "This viewer accepts CSV, TSV, and TXT files.");
            showError("Choose a CSV, TSV, or TXT file.");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            showEmpty("Choose a smaller file.", "The selected file is over the 5 MB limit.");
            showError("Choose a file no larger than 5 MB.");
            return;
        }

        elements.viewerStatus.textContent = "Reading file…";
        try {
            const text = await file.text();
            if (loadId !== state.loadId) return;
            state.sourceText = text;
            state.sourceName = file.name;
            elements.searchInput.value = "";
            parseSource();
        } catch {
            if (loadId === state.loadId) {
                elements.viewerStatus.textContent = "";
                showEmpty("Could not read this file.", "Choose another file and try again.");
                showError("This file could not be read. Try another file.");
            }
        } finally {
            elements.fileInput.value = "";
        }
    }

    elements.fileInput.addEventListener("change", event => loadFile(event.target.files[0]));
    elements.sampleButton.addEventListener("click", () => {
        ++state.loadId;
        state.sourceText = SAMPLE_CSV;
        state.sourceName = "sample-inventory.csv";
        elements.searchInput.value = "";
        parseSource();
    });
    elements.clearButton.addEventListener("click", () => {
        ++state.loadId;
        state.sourceText = null;
        state.sourceName = "";
        elements.fileInput.value = "";
        clearError();
        resetView();
        updateSourceMeta();
    });
    elements.delimiterSelect.addEventListener("change", parseSource);
    elements.firstRowHeader.addEventListener("change", () => {
        if (state.rows.length) buildColumns();
    });
    elements.searchInput.addEventListener("input", () => {
        state.page = 1;
        render();
    });
    elements.previousPage.addEventListener("click", () => {
        if (state.page > 1) {
            --state.page;
            render();
        }
    });
    elements.nextPage.addEventListener("click", () => {
        ++state.page;
        render();
    });

    elements.dropZone.addEventListener("dragover", event => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        elements.dropZone.classList.add("is-dragging");
    });
    elements.dropZone.addEventListener("dragleave", event => {
        if (!elements.dropZone.contains(event.relatedTarget)) {
            elements.dropZone.classList.remove("is-dragging");
        }
    });
    elements.dropZone.addEventListener("drop", event => {
        event.preventDefault();
        elements.dropZone.classList.remove("is-dragging");
        loadFile(event.dataTransfer.files[0]);
    });

    resetView();
    updateSourceMeta();
})();
