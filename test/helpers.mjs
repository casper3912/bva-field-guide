// Shared helpers: load index.html into jsdom with its inline scripts running,
// and drive the interactive controls the way a user would.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const HTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");

/** Load a fresh instance of the page with scripts executed. */
export function loadPage() {
  return new JSDOM(HTML, { runScripts: "dangerously" });
}

/** Return the raw page source (for structural assertions). */
export function pageSource() {
  return HTML;
}

export function byId(dom, id) {
  const el = dom.window.document.getElementById(id);
  if (!el) throw new Error(`No element with id "${id}"`);
  return el;
}

/** Set a text/number input's value and fire the "input" event. */
export function setInput(dom, id, value) {
  const el = byId(dom, id);
  el.value = String(value);
  el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}

/** Set a <select>'s value and fire the "change" event. */
export function setSelect(dom, id, value) {
  const el = byId(dom, id);
  el.value = String(value);
  el.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
}

/** Click the Overflow Wheel preset button carrying the given data-preset. */
export function clickPreset(dom, preset) {
  const btn = dom.window.document.querySelector(
    `.presets button[data-preset="${preset}"]`
  );
  if (!btn) throw new Error(`No preset button "${preset}"`);
  btn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
}

/** The Unicode minus the page uses for display. */
export const MINUS = "\u2212";
