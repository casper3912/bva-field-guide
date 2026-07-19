// Page structure tests — the properties that make the file emailable,
// navigable, and accessible. These guard the artifact's contract:
// one file, zero external dependencies, working internal navigation.
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPage, pageSource } from "./helpers.mjs";

test("every navigation anchor resolves to a section id", () => {
  const dom = loadPage();
  const doc = dom.window.document;
  const anchors = [...doc.querySelectorAll('nav a[href^="#"]')];
  assert.ok(anchors.length >= 7, "nav has all section links");
  for (const a of anchors) {
    const id = a.getAttribute("href").slice(1);
    assert.ok(doc.getElementById(id), `#${id} exists for nav link "${a.textContent}"`);
  }
});

test("self-containment: no external scripts, stylesheets, fonts, or images", () => {
  const src = pageSource();
  assert.ok(!/<script[^>]+src=/i.test(src), "no external <script src>");
  assert.ok(!/<link[^>]+rel=["']stylesheet/i.test(src), "no external stylesheets");
  assert.ok(!/<img/i.test(src), "no <img> tags (all visuals are inline SVG)");
  assert.ok(!/@import/.test(src), "no CSS @import");
  assert.ok(!/fonts\.googleapis/.test(src), "no webfont dependency");
});

test("all resource links are absolute https URLs", () => {
  const dom = loadPage();
  const links = [...dom.window.document.querySelectorAll(".res-list a")];
  assert.ok(links.length >= 25, "resource library is populated");
  for (const a of links) {
    assert.match(a.href, /^https:\/\//, `${a.textContent} uses https`);
  }
});

test("document metadata is present for sharing", () => {
  const dom = loadPage();
  const doc = dom.window.document;
  assert.match(doc.title, /Boundary Value Analysis/);
  const desc = doc.querySelector('meta[name="description"]');
  assert.ok(desc && desc.content.length > 50, "meta description present");
  assert.equal(doc.documentElement.getAttribute("lang"), "en");
});

test("interactive widgets expose accessible roles and labels", () => {
  const dom = loadPage();
  const doc = dom.window.document;
  for (const id of ["numline", "wheel-svg", "mx-grid"]) {
    const svg = doc.getElementById(id);
    assert.equal(svg.getAttribute("role"), "img", `#${id} has role=img`);
    assert.ok(svg.getAttribute("aria-label"), `#${id} has an aria-label`);
  }
  for (const id of ["bva-err", "ow-err"]) {
    assert.equal(doc.getElementById(id).getAttribute("role"), "alert", `#${id} announces errors`);
  }
});

test("core content markers exist in every section", () => {
  const text = pageSource();
  const markers = [
    "equivalence partitioning",          // fundamentals
    "V(G) = E − N + 2",                  // cyclomatic complexity
    "Integer.MIN_VALUE",                 // type boundaries
    "@ParameterizedTest",                // java
    "XCUITest",                          // mobile
    "Validators.min",                    // angular
    "CONDITIONALS_BOUNDARY",             // mutation testing thread
    "@NullSource",                       // boxed/null thread
    "GitHub Copilot",                    // AI section
  ];
  for (const m of markers) {
    assert.ok(text.includes(m), `content marker present: ${m}`);
  }
});

test("reduced motion preference is respected", () => {
  assert.match(pageSource(), /prefers-reduced-motion:\s*reduce/);
});
