// RFC-4180 CSV: quote fields containing commas/quotes/newlines, double inner quotes.
function csvEscape(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(headers, rows) {
  const head = headers.map(csvEscape).join(',');
  const body = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  return `${head}\n${body}\n`;
}

module.exports = { toCsv };
