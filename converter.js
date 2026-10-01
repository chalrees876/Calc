// Conversion helpers between decimal feet and feet-inches with fractional inches.
(function (root) {
  function gcd(a, b) {
    while (b) { const t = b; b = a % b; a = t; }
    return a;
  }

  // Decimal feet -> { sign, feet, inches, num, den } rounded to the nearest 1/precision inch.
  function decimalToFtIn(decimalFeet, precision) {
    precision = precision || 16;
    const sign = decimalFeet < 0 ? -1 : 1;
    const totalUnits = Math.round(Math.abs(decimalFeet) * 12 * precision);
    const unitsPerFoot = 12 * precision;
    const feet = Math.floor(totalUnits / unitsPerFoot);
    const rem = totalUnits % unitsPerFoot;
    const inches = Math.floor(rem / precision);
    let num = rem % precision;
    let den = precision;
    if (num === 0) {
      den = 1;
    } else {
      const g = gcd(num, den);
      num /= g;
      den /= g;
    }
    return { sign: totalUnits === 0 ? 1 : sign, feet, inches, num, den };
  }

  // Parse a fraction string like "3/8", "0.375", "" -> decimal inches. Returns NaN if invalid.
  function parseFraction(text) {
    const s = String(text == null ? '' : text).trim();
    if (s === '') return 0;
    const m = s.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (m) {
      const d = Number(m[2]);
      return d === 0 ? NaN : Number(m[1]) / d;
    }
    return /^\d*\.?\d+$/.test(s) ? Number(s) : NaN;
  }

  // Feet, inches and fraction-of-inch parts -> decimal feet.
  function ftInToDecimal(feet, inches, fraction, negative) {
    const total = (Number(feet) || 0) + ((Number(inches) || 0) + (fraction || 0)) / 12;
    return negative ? -total : total;
  }

  // Parse a free-form ft-in string such as 5' 3-1/2", 5 ft 3 1/2 in, 5'3.5", 3 1/2", 5'.
  function parseFtIn(text) {
    let s = String(text).trim().toLowerCase();
    if (s === '') return NaN;
    let negative = false;
    if (s[0] === '-') { negative = true; s = s.slice(1).trim(); }
    s = s.replace(/feet|foot|ft/g, "'").replace(/inches|inch|in/g, '"').replace(/[’′]/g, "'").replace(/[”″]/g, '"');

    let feet = 0;
    let inchPart = s;
    const fi = s.indexOf("'");
    if (fi !== -1) {
      const f = s.slice(0, fi).trim();
      if (f !== '' && !/^\d*\.?\d+$/.test(f)) return NaN;
      feet = f === '' ? 0 : Number(f);
      inchPart = s.slice(fi + 1);
    } else if (!s.includes('"')) {
      // No markers: "5 3 1/2" -> feet inches fraction
      const parts = s.split(/[\s-]+/).filter(Boolean);
      if (parts.length === 0 || !/^\d*\.?\d+$/.test(parts[0])) return NaN;
      feet = Number(parts[0]);
      inchPart = parts.slice(1).join(' ');
    }

    inchPart = inchPart.replace(/"/g, '').trim();
    let inches = 0;
    if (inchPart !== '') {
      const m = inchPart.match(/^(\d*\.?\d+)?(?:[\s-]+)?(\d+\s*\/\s*\d+)?$/);
      if (!m || (!m[1] && !m[2])) return NaN;
      inches = m[1] ? Number(m[1]) : 0;
      if (m[2]) {
        const frac = parseFraction(m[2]);
        if (isNaN(frac)) return NaN;
        inches += frac;
      }
    }
    return ftInToDecimal(feet, inches, 0, negative);
  }

  function formatFtIn(r) {
    const frac = r.num ? (r.inches ? '-' : '') + r.num + '/' + r.den : '';
    const inchText = (r.inches || !r.num ? String(r.inches) : '') + frac;
    return (r.sign < 0 ? '-' : '') + r.feet + "' " + inchText + '"';
  }

  const api = { decimalToFtIn, ftInToDecimal, parseFraction, parseFtIn, formatFtIn };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Converter = api;
})(this);
