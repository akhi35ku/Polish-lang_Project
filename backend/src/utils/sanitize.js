// Input sanitization: strip characters that enable stored XSS when values are
// later rendered. React escapes by default, but defense-in-depth costs nothing.
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function cleanString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return escapeHtml(str.trim().slice(0, maxLen));
}

module.exports = { escapeHtml, cleanString };
