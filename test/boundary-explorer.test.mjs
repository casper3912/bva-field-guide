// Boundary Explorer tests — three-value BVA applied to the widget that
// teaches three-value BVA. The interesting inputs are, of course, its edges.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage, byId, setInput } from "./helpers.mjs";

function tableCells(dom) {
  return [...byId(dom, "bva-table-wrap").querySelectorAll("tbody tr")].map(
    (tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent.trim())
  );
}

test("default range 18–65 renders the canonical 7-point, 3-value BVA set", () => {
  const dom = loadPage();
  const rows = tableCells(dom);
  assert.equal(rows.length, 7, "seven test points");
  const values = rows.map((r) => Number(r[1]));
  assert.deepEqual(values, [17, 18, 19, 42, 64, 65, 66]); // nominal = round(41.5)
  assert.equal(byId(dom, "bva-err").textContent, "");
});

test("expected outcomes classify each point correctly at the seam", () => {
  const dom = loadPage();
  const expectByValue = Object.fromEntries(
    tableCells(dom).map((r) => [Number(r[1]), r[4]])
  );
  assert.equal(expectByValue[17], "Reject", "min-1 rejected");
  assert.equal(expectByValue[18], "Accept", "min accepted (inclusive)");
  assert.equal(expectByValue[65], "Accept", "max accepted (inclusive)");
  assert.equal(expectByValue[66], "Reject", "max+1 rejected");
});

test("boundary of the widget itself: max = min + 2 is the smallest legal range", () => {
  const dom = loadPage();
  // min+1 (invalid for the widget): no nominal interior value exists
  setInput(dom, "bva-min", 10);
  setInput(dom, "bva-max", 11);
  assert.match(byId(dom, "bva-err").textContent, /min \+ 2/);

  // min+2 (the widget's own "min" boundary): renders with de-duplication
  setInput(dom, "bva-max", 12);
  assert.equal(byId(dom, "bva-err").textContent, "");
  const values = tableCells(dom).map((r) => Number(r[1]));
  assert.deepEqual(values, [9, 10, 11, 12, 13], "overlapping roles collapse");
});

test("merged roles are labelled when points coincide", () => {
  const dom = loadPage();
  setInput(dom, "bva-min", 1);
  setInput(dom, "bva-max", 3);
  const roleFor2 = tableCells(dom).find((r) => Number(r[1]) === 2)[2];
  // min+1, nominal and max-1 all land on 2
  assert.match(roleFor2, /min\+1/);
  assert.match(roleFor2, /nominal/);
  assert.match(roleFor2, /max−1/);
});

test("negative and zero-spanning ranges work", () => {
  const dom = loadPage();
  setInput(dom, "bva-min", -10);
  setInput(dom, "bva-max", -5);
  const values = tableCells(dom).map((r) => Number(r[1]));
  // Nominal is Math.round(-7.5) = -7: JS rounds .5 toward +Infinity —
  // itself a boundary behavior (Java's Math.round agrees; banker's rounding differs).
  assert.deepEqual(values, [-11, -10, -9, -7, -6, -5, -4]);
});

test("non-numeric input produces an error, not a crash", () => {
  const dom = loadPage();
  setInput(dom, "bva-min", "abc");
  assert.match(byId(dom, "bva-err").textContent, /integer/i);
});

test("inverted range (max < min) is rejected", () => {
  const dom = loadPage();
  setInput(dom, "bva-min", 65);
  setInput(dom, "bva-max", 18);
  assert.notEqual(byId(dom, "bva-err").textContent, "");
});

test("SVG number line renders every point and both partitions", () => {
  const dom = loadPage();
  const svg = byId(dom, "numline").innerHTML;
  for (const v of [17, 18, 19, 42, 64, 65, 66]) {
    assert.ok(svg.includes(`>${v}<`), `point ${v} labelled on the line`);
  }
  assert.ok(svg.includes("VALID [18"), "valid partition band labelled");
  assert.ok(svg.includes("INVALID"), "invalid partition band labelled");
});
