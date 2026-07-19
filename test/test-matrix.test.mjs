// Test Matrix tests — the combinatorics displayed by the widget, re-derived
// from first principles in the test so the page can never drift from the math.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage, byId, setSelect } from "./helpers.mjs";

const INT_MIN = -2147483648n;
const INT_MAX = 2147483647n;
const SEVEN = [INT_MIN, INT_MIN + 1n, -1n, 0n, 1n, INT_MAX - 1n, INT_MAX];

/** Independent ground truth: enumerate the full cross product. */
function groundTruth(boxed, n) {
  const set = boxed ? [...SEVEN, null] : SEVEN;
  const size = set.length;
  const total = size ** n;
  let npe = 0, ovf = 0, ok = 0;
  for (let idx = 0; idx < total; idx++) {
    let rem = idx;
    const combo = [];
    for (let d = 0; d < n; d++) { combo.push(set[rem % size]); rem = Math.floor(rem / size); }
    if (combo.includes(null)) { npe++; continue; }
    const sum = combo.reduce((a, b) => a + b, 0n);
    if (sum < INT_MIN || sum > INT_MAX) ovf++; else ok++;
  }
  return { total, npe, ovf, ok };
}

function counts(dom) {
  return byId(dom, "mx-counts").innerHTML;
}
function gridRects(dom) {
  return (byId(dom, "mx-grid").innerHTML.match(/<rect/g) || []).length;
}

test("primitive, 2 operands: 49 combinations, zero NPE paths", () => {
  const dom = loadPage();
  const gt = groundTruth(false, 2);
  assert.equal(gt.total, 49);
  assert.equal(gt.npe, 0);
  assert.ok(counts(dom).includes("<strong>49</strong>"));
  assert.ok(counts(dom).includes("0 NPE paths"));
  assert.equal(gridRects(dom), 49, "7×7 grid cells");
});

test("overflow count for a+b over the seven canonical int values matches enumeration", () => {
  const dom = loadPage();
  const gt = groundTruth(false, 2);
  assert.equal(gt.ovf, 12, "twelve seam-crossing corner combinations");
  assert.ok(counts(dom).includes(`(${gt.ovf} overflow)`));
});

test("boxing adds the null row: 2 operands become 64 combos with 15 NPE (23%)", () => {
  const dom = loadPage();
  setSelect(dom, "mx-boxed", "1");
  const gt = groundTruth(true, 2);
  assert.equal(gt.total, 64);
  assert.equal(gt.npe, 15);
  assert.ok(counts(dom).includes("<strong>64</strong>"));
  assert.ok(counts(dom).includes("15 NPE paths (23%)"));
  assert.equal(gridRects(dom), 64, "8×8 grid cells");
});

test("combinatorial growth across operand counts matches ground truth", () => {
  for (const n of [2, 3, 4]) {
    const dom = loadPage();
    setSelect(dom, "mx-boxed", "1");
    setSelect(dom, "mx-n", n);
    const gt = groundTruth(true, n);
    const withCommas = gt.total.toLocaleString("en-US");
    assert.ok(counts(dom).includes(`<strong>${withCommas}</strong>`), `total at n=${n}`);
    const pct = Math.round((gt.npe / gt.total) * 100);
    assert.ok(
      counts(dom).includes(`${gt.npe.toLocaleString("en-US")} NPE paths (${pct}%)`),
      `NPE count at n=${n}`
    );
  }
});

test("boxed 4-operand product is 4,096 with 1,695 NPE paths — the page's prose claim", () => {
  const gt = groundTruth(true, 4);
  assert.equal(gt.total, 4096);
  assert.equal(gt.npe, 1695);
  assert.ok(gt.npe / gt.total > 0.4, "over 40%, as stated in the prose");
});

test("null row and column are labelled in the boxed grid", () => {
  const dom = loadPage();
  setSelect(dom, "mx-boxed", "1");
  const grid = byId(dom, "mx-grid").innerHTML;
  assert.equal((grid.match(/>null</g) || []).length, 2, "one axis label each for a and b");
});

test("pairwise alternative line scales with value-set size, not operand count", () => {
  const dom = loadPage();
  setSelect(dom, "mx-boxed", "1");
  setSelect(dom, "mx-n", 4);
  assert.ok(counts(dom).includes("64"), "8² pairwise bound shown even at n=4");
});
