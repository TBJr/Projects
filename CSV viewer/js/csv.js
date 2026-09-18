// CSV parsing for the CSV Viewer by Thomas Brown (thomasbrown.app).
(function () {
  'use strict';

  const DELIMITERS = [',', ';', '\t'];

  function checkText(text) {
    if (typeof text !== 'string') {
      throw new TypeError('CSV input must be a string.');
    }
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  }

  function detectDelimiter(text) {
    text = checkText(text);

    const records = [];
    let counts = [0, 0, 0];
    let inQuotes = false;
    let hasContent = false;
    const scanLength = Math.min(text.length, 65536);

    function finishRecord() {
      if (hasContent) records.push(counts);
      counts = [0, 0, 0];
      hasContent = false;
    }

    for (let i = 0; i < scanLength && records.length < 20; i += 1) {
      const char = text[i];
      if (char === '"') {
        hasContent = true;
        if (inQuotes && text[i + 1] === '"') {
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (!inQuotes && (char === '\r' || char === '\n')) {
        finishRecord();
        if (char === '\r' && text[i + 1] === '\n') i += 1;
      } else {
        hasContent = true;
        if (!inQuotes) {
          const index = DELIMITERS.indexOf(char);
          if (index !== -1) counts[index] += 1;
        }
      }
    }
    if (hasContent && records.length < 20) finishRecord();

    let bestIndex = 0;
    let bestScore = [-1, -1, -1, -1];
    for (let index = 0; index < DELIMITERS.length; index += 1) {
      const frequencies = new Map();
      let populatedRecords = 0;
      let total = 0;
      for (const record of records) {
        const count = record[index];
        if (count === 0) continue;
        populatedRecords += 1;
        total += count;
        frequencies.set(count, (frequencies.get(count) || 0) + 1);
      }
      const consistentRecords = Math.max(0, ...frequencies.values());
      const score = [populatedRecords, consistentRecords, total, -index];
      if (score.some((value, part) =>
        value > bestScore[part] &&
        score.slice(0, part).every((earlier, previous) => earlier === bestScore[previous])
      )) {
        bestScore = score;
        bestIndex = index;
      }
    }
    return DELIMITERS[bestIndex];
  }

  function parseCsv(text, delimiter, { maxRows = 20000, maxColumns = 100 } = {}) {
    text = checkText(text);
    if (!DELIMITERS.includes(delimiter)) {
      throw new TypeError('CSV delimiter must be a comma, semicolon, or tab.');
    }
    if (!Number.isSafeInteger(maxRows) || maxRows < 1) {
      throw new RangeError('maxRows must be a positive integer.');
    }
    if (!Number.isSafeInteger(maxColumns) || maxColumns < 1) {
      throw new RangeError('maxColumns must be a positive integer.');
    }
    if (text.length === 0) return [];

    const rows = [];
    let row = [];
    let field = '';
    let state = 'start';
    let rowStarted = false;

    function finishField() {
      if (row.length >= maxColumns) {
        throw new RangeError(`CSV exceeds the ${maxColumns} column limit on row ${rows.length + 1}.`);
      }
      row.push(field);
      field = '';
      state = 'start';
    }

    function finishRow() {
      if (rows.length >= maxRows) {
        throw new RangeError(`CSV exceeds the ${maxRows} row limit.`);
      }
      rows.push(row);
      row = [];
      rowStarted = false;
    }

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];

      if (state === 'quoted') {
        if (char === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 1;
          } else {
            state = 'afterQuote';
          }
        } else {
          field += char;
        }
        continue;
      }

      if (char === delimiter) {
        finishField();
        rowStarted = true;
      } else if (char === '\r' || char === '\n') {
        finishField();
        finishRow();
        if (char === '\r' && text[i + 1] === '\n') i += 1;
      } else if (char === '"') {
        if (state === 'start') {
          state = 'quoted';
          rowStarted = true;
        } else {
          throw new SyntaxError(`Malformed CSV: unexpected quote at character ${i + 1}.`);
        }
      } else if (state === 'afterQuote') {
        throw new SyntaxError(`Malformed CSV: unexpected character after closing quote at character ${i + 1}.`);
      } else {
        field += char;
        state = 'unquoted';
        rowStarted = true;
      }
    }

    if (state === 'quoted') {
      throw new SyntaxError(`Malformed CSV: unterminated quoted field on row ${rows.length + 1}.`);
    }
    if (rowStarted) {
      finishField();
      finishRow();
    }
    return rows;
  }

  window.CsvParser = Object.freeze({ parseCsv, detectDelimiter });
}());
