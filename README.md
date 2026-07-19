# Boundary Value Analysis — A Field Guide

A **single-file, self-contained webpage** covering boundary value analysis (BVA) in software
testing: the technique itself, its relationship to cyclomatic complexity, Java's type-level
boundaries (overflow seams, boxed `null`, floating-point traps), and practical application in
Java, mobile, and Angular development — plus how AI assistants change the economics of both
boundary analysis and complexity management.

`index.html` has **zero external dependencies** — no CDNs, no webfonts, no build step. It can be
opened from disk, attached to an email, or hosted anywhere static files are served. A test in the
suite enforces this property.

## Contents of the page

| Section | What's inside |
|---|---|
| **Fundamentals** | BVA, equivalence partitioning, 2-value vs 3-value BVA, and the interactive **Boundary Explorer** (set min/max, get the 7-point test set on a live number line) |
| **Cyclomatic Complexity** | V(G), basis path testing, and why every range predicate is simultaneously a complexity point and a boundary — with an annotated control-flow graph |
| **Type Boundaries** | Java's integral type ladder, the ≥5 boundary values of plain `a + b`, the interactive **Overflow Wheel** (two's complement as a ring), boxed types adding `null`, the interactive **Test Matrix** (combinatorial explosion, live counts), and floating-point special values |
| **Java** | JUnit 5 `@ParameterizedTest`/`@CsvSource` boundary tables, PIT mutation testing, JaCoCo, complexity tooling |
| **Mobile** | Input boundaries in Espresso/XCUITest plus the environmental boundary classes unique to devices |
| **Angular** | `Validators.min/max` as boundaries-as-code, `FormControl` boundary specs, custom validators, layered checks |
| **AI Tools** | Using Copilot/Claude to derive boundary tables and refactor high-V(G) code — with the published evidence on AI-generated complexity and the guardrails that keep the loop honest |
| **Resources** | ~35 curated links across all topics |

## Running locally

No build required:

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

or serve it:

```bash
npx serve .
```

## Tests

The suite loads `index.html` into [jsdom](https://github.com/jsdom/jsdom) with its inline scripts
executing, then drives the widgets through real DOM events — and, fittingly, the tests practice
what the page preaches: they probe the widgets **at their own boundaries** (smallest legal range,
inclusive limits, out-of-range operands, every type's overflow seam), and re-derive the Test
Matrix combinatorics from first principles so the page can never drift from the math.

```bash
npm install
npm test
```

Test files (Node's built-in `node:test` runner, jsdom as the only dev dependency):

- `test/boundary-explorer.test.mjs` — 7-point set generation, de-duplication, error handling
- `test/overflow-wheel.test.mjs` — all four integral seams verified against `BigInt.asIntN`
- `test/test-matrix.test.mjs` — cross-product, NPE, and overflow counts vs. independent enumeration
- `test/page-structure.test.mjs` — nav anchors, self-containment, https links, ARIA roles, content markers

## Hosting on GitHub Pages

The included workflow (`.github/workflows/ci.yml`) runs the tests on every push and PR, and
deploys the repo root to GitHub Pages when tests pass on `main`. One-time setup after pushing:

1. Repository **Settings → Pages**
2. Set **Source** to **GitHub Actions**

The page will be live at `https://<username>.github.io/<repo>/`.

## Contributing

The page is intentionally one file. When changing widget logic, keep the corresponding boundary
tests in sync — and if you find a boundary the suite doesn't probe, that's the most welcome PR
of all.

## Provenance

Researched, written, and built with AI assistance (Claude). All statistics in the AI section are
paraphrased from the published studies linked in the page's Resources section.

## License

[MIT](LICENSE)
