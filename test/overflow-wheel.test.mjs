// Overflow Wheel tests — the seams of all four integral types, driven through
// the UI. Ground truth is computed independently with BigInt.asIntN.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage, byId, setInput, setSelect, clickPreset, MINUS } from "./helpers.mjs";

const LIMITS = {
  8: { min: -128n, max: 127n },
  16: { min: -32768n, max: 32767n },
  32: { min: -2147483648n, max: 2147483647n },
  64: { min: -(2n ** 63n), max: 2n ** 63n - 1n },
};

function readout(dom) {
  return byId(dom, "ow-readout").innerHTML;
}
function storedValue(dom) {
  const m = readout(dom).match(/<strong>([\d,]+|−[\d,]+)<\/strong>/u);
  assert.ok(m, "readout shows a stored value");
  return BigInt(m[1].replaceAll(",", "").replace(MINUS, "-"));
}

test("byte seam: 127 + 1 wraps to −128 (the default demo)", () => {
  const dom = loadPage();
  assert.equal(storedValue(dom), -128n);
  assert.match(readout(dom), /OVERFLOW/);
});

test("every type's MAX + 1 wraps to its MIN — verified against BigInt.asIntN", () => {
  for (const bits of [8, 16, 32, 64]) {
    const dom = loadPage();
    setSelect(dom, "ow-type", bits);
    clickPreset(dom, "maxplus1");
    const expected = BigInt.asIntN(bits, LIMITS[bits].max + 1n);
    assert.equal(storedValue(dom), expected, `${bits}-bit MAX+1`);
    assert.equal(expected, LIMITS[bits].min, "wraps exactly to MIN");
    assert.match(readout(dom), /OVERFLOW/);
  }
});

test("every type's MIN − 1 wraps to its MAX", () => {
  for (const bits of [8, 16, 32, 64]) {
    const dom = loadPage();
    setSelect(dom, "ow-type", bits);
    clickPreset(dom, "minminus1");
    assert.equal(storedValue(dom), LIMITS[bits].max, `${bits}-bit MIN-1`);
  }
});

test("long MAX + MAX = −2, exact at 64 bits (no float precision loss)", () => {
  const dom = loadPage();
  setSelect(dom, "ow-type", 64);
  clickPreset(dom, "maxmax");
  assert.equal(storedValue(dom), -2n);
  // the mathematical (unwrapped) result must also be shown exactly
  assert.ok(readout(dom).includes("18,446,744,073,709,551,614"));
});

test("the full-carry boundary: −1 + 1 = 0 with no overflow", () => {
  const dom = loadPage();
  clickPreset(dom, "carry");
  assert.equal(storedValue(dom), 0n);
  assert.match(readout(dom), /NO OVERFLOW/);
});

test("in-range boundary neighbours do not overflow: MAX−1 + 1 = MAX", () => {
  const dom = loadPage();
  setSelect(dom, "ow-type", 32);
  setInput(dom, "ow-a", "2147483646");
  setInput(dom, "ow-b", "1");
  assert.equal(storedValue(dom), 2147483647n);
  assert.match(readout(dom), /NO OVERFLOW/);
});

test("operand range guard: value outside the selected type is refused", () => {
  const dom = loadPage();
  setSelect(dom, "ow-type", 8);
  setInput(dom, "ow-a", "128"); // byte max + 1 as an *operand*
  assert.match(byId(dom, "ow-err").textContent, /must fit in byte/);
});

test("operands exactly at MIN and MAX are accepted (inclusive bounds)", () => {
  const dom = loadPage();
  setSelect(dom, "ow-type", 8);
  setInput(dom, "ow-a", "-128");
  setInput(dom, "ow-b", "127");
  assert.equal(byId(dom, "ow-err").textContent, "");
  assert.equal(storedValue(dom), -1n);
});

test("garbage input is refused without crashing", () => {
  const dom = loadPage();
  setInput(dom, "ow-a", "12.5");
  assert.match(byId(dom, "ow-err").textContent, /integer/i);
  setInput(dom, "ow-a", "not a number");
  assert.match(byId(dom, "ow-err").textContent, /integer/i);
});

test("wheel SVG marks the overflow seam and both operand/result points", () => {
  const dom = loadPage();
  const svg = byId(dom, "wheel-svg").innerHTML;
  assert.ok(svg.includes("OVERFLOW SEAM"));
  assert.ok(svg.includes(">a<"), "operand marker");
  assert.ok(svg.includes(">a+b<"), "result marker");
});
