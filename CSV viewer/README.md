# CSV Viewer

A browser-based table preview for CSV, TSV, and other delimited text files. Open [`index.html`](index.html) directly or launch it from the [project gallery](../index.html). No installation or server is needed.

## Use it

1. Drop a file onto the page, choose one from your device, or select **Try sample data**.
2. Leave the column separator on **Auto-detect**, or choose comma, semicolon, or tab.
3. Set whether the first row contains column headings.
4. Search across all columns, select a heading to sort, and use the page controls to browse larger files.

The viewer supports quoted fields containing separators or line breaks, doubled quotes, and UTF-8 files with a byte-order mark. Empty cells and leading spaces are preserved. Auto-detection is a best guess; select the separator manually if the columns look wrong.

Files are read in the browser and kept in memory while the page is open. The viewer does not upload or persist their contents. It accepts files up to 5 MB and previews up to 20,000 records and 100 columns, with 25 rows per page. The record limit includes a heading row when that option is enabled.
