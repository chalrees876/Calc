const assert = require('assert');
const C = require('./converter');

const cases = [
  [5.25, 16, "5' 3\""],
  [5.3, 16, "5' 3-5/8\""],
  [0.5, 16, "0' 6\""],
  [10.9999, 16, "11' 0\""],
  [1.0625, 16, "1' 3/4\""],
  [0.01, 16, "0' 1/8\""],
  [-2.5, 16, "-2' 6\""],
  [5.3, 8, "5' 3-5/8\""],
  [5.3, 2, "5' 3-1/2\""],
];
for (const [dec, p, expected] of cases) {
  assert.strictEqual(C.formatFtIn(C.decimalToFtIn(dec, p)), expected, `${dec} @1/${p}`);
}

const parses = [
  ["5' 3-1/2\"", 5 + 3.5 / 12],
  ["5 ft 3 1/2 in", 5 + 3.5 / 12],
  ["5'3.5\"", 5 + 3.5 / 12],
  ["5'", 5],
  ["3 1/2\"", 3.5 / 12],
  ["5 3 1/2", 5 + 3.5 / 12],
  ["-2' 6\"", -2.5],
  ["0' 1/8\"", 0.125 / 12],
];
for (const [text, expected] of parses) {
  assert.ok(Math.abs(C.parseFtIn(text) - expected) < 1e-12, `parse ${text} -> ${C.parseFtIn(text)}`);
}
assert.ok(isNaN(C.parseFtIn('abc')));
assert.ok(isNaN(C.parseFtIn("5' 3/0\"")));
assert.strictEqual(C.parseFraction('3/8'), 0.375);
assert.ok(isNaN(C.parseFraction('x')));
console.log('All tests passed');
