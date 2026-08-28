# Hybrid DOM Shell with Embedded Vector Plots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform `explainer-steps` into a modern, responsive Hybrid DOM Shell featuring a sticky Table of Contents (TOC) sidebar, live scroll-spy, progressive disclosure accordions, responsive multi-column layouts, and native HTML5 controls with embedded vector SVG charts.

**Architecture:** The renderer outputs a structured HTML document shell with a 240px sticky TOC navigation rail and a responsive main content area. Sections are rendered as fluid HTML cards with native form controls, embedding standalone vector SVG canvases only for mathematical curves and animated state machines.

**Tech Stack:** JavaScript (ESM), HTML5, CSS Grid/Flexbox, SVG, Browser `IntersectionObserver` API, Node.js Test Runner.

## Global Constraints
- Must remain 100% backward-compatible with all existing `explainer-steps` JSON IR inputs.
- Must run cleanly with zero external runtime dependencies.
- Must pass all tests across `diagramify` and `integrations/deepseek-harness` (100% pass rate).

---

### Task 1: TOC & Outline Generation in Renderer

**Files:**
- Modify: `diagramify/renderers/explainer-steps/render-explainer-steps.mjs`
- Test: `diagramify/test/explorable-explainer.test.mjs`

**Interfaces:**
- Consumes: `explainer.sections[]`
- Produces: `<nav class="explainer-toc">` markup containing section index, title, tags, and reading progress bar.

- [ ] **Step 1: Write the failing test**
Add assertion in `explorable-explainer.test.mjs` verifying `<nav class="explainer-toc">` with section anchors and progress indicator exists in generated output.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: FAIL (missing `.explainer-toc`)

- [ ] **Step 3: Implement TOC generation**
In `render-explainer-steps.mjs`, build `renderTocSidebar(sections)` returning the sticky outline navigation HTML.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add diagramify/renderers/explainer-steps/render-explainer-steps.mjs diagramify/test/explorable-explainer.test.mjs
git commit -m "feat(explainer-steps): add sticky TOC sidebar and outline generation"
```

---

### Task 2: Responsive Split-Pane Layout & Accordions CSS

**Files:**
- Modify: `diagramify/assets/template.html`
- Modify: `diagramify/renderers/explainer-steps/render-explainer-steps.mjs`
- Test: `diagramify/test/explorable-explainer.test.mjs`

**Interfaces:**
- Consumes: `.explainer-layout`, `.explainer-sidebar`, `.explainer-content`, `<details class="explainer-accordion">`
- Produces: Fluid desktop split-pane (`grid-template-columns: 240px 1fr`) and collapsible mobile drawer.

- [ ] **Step 1: Write test for responsive layout classes and accordions**
Add assertion in `explorable-explainer.test.mjs` checking `.explainer-layout` and `.explainer-accordion` containers.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: FAIL

- [ ] **Step 3: Implement responsive layout CSS in `template.html` and renderer**
Add `.explainer-layout` CSS rules with desktop 2-pane split and mobile media queries in `template.html`. Support `details` / `summary` accordion rendering for deep-dive sections.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add diagramify/assets/template.html diagramify/renderers/explainer-steps/render-explainer-steps.mjs diagramify/test/explorable-explainer.test.mjs
git commit -m "feat(explainer-steps): implement responsive split-pane layout and accordion styles"
```

---

### Task 3: Interactive Scroll-Spy, TOC Jump & Chapter Filters

**Files:**
- Modify: `diagramify/assets/template.html`
- Test: `diagramify/test/explorable-explainer.test.mjs`

**Interfaces:**
- Consumes: `IntersectionObserver`, `window.location.hash`, `[data-chapter-tag]`
- Produces: Live TOC highlight on scroll, 1-click smooth jump, reading progress updates, and chapter filtering.

- [ ] **Step 1: Write test verifying client-side scroll-spy scripts**
Ensure `initExplainerToc` function is present and attached to `.explainer-toc`.

- [ ] **Step 2: Run test to verify**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`

- [ ] **Step 3: Implement `initExplainerToc` in `template.html`**
Write `IntersectionObserver` scroll-spy logic, reading progress calculation on scroll, URL hash synchronization, and chapter tag filtering.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add diagramify/assets/template.html diagramify/test/explorable-explainer.test.mjs
git commit -m "feat(explainer-steps): add client-side scroll-spy, TOC jump, and chapter filter script"
```

---

### Task 4: Native HTML5 Form Controls for Calculator & Simulator

**Files:**
- Modify: `diagramify/renderers/explainer-steps/render-explainer-steps.mjs`
- Modify: `diagramify/assets/template.html`
- Test: `diagramify/test/explorable-explainer.test.mjs`

**Interfaces:**
- Consumes: `<input type="range">`, `<button>`, live calculation event listeners
- Produces: Real-time slider and playback step synchronization.

- [ ] **Step 1: Write test verifying native range inputs and buttons**
Assert presence of `<input type="range">` in calculator and `<button class="sim-btn">` in simulator.

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: FAIL

- [ ] **Step 3: Implement native HTML5 controls**
Update `renderCalculatorBlock` and `renderSimulatorBlock` to output native interactive controls alongside clean SVG vector plots.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test diagramify/test/explorable-explainer.test.mjs`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add diagramify/renderers/explainer-steps/render-explainer-steps.mjs diagramify/assets/template.html diagramify/test/explorable-explainer.test.mjs
git commit -m "feat(explainer-steps): add native HTML5 range sliders and interactive buttons"
```

---

### Task 5: Full Regression, Golden Re-renders & CI Verification

**Files:**
- Modify: `docs/gallery.html`, `examples/*`
- Test: `scripts/run-tests.mjs`

- [ ] **Step 1: Re-render all golden examples**
Execute golden render script and verify zero diff on existing architecture/workflow/dataflow/sequence diagrams.

- [ ] **Step 2: Rebuild gallery and showcase**
Run: `node scripts/build-gallery.mjs && node scripts/build-readme-showcase.mjs`

- [ ] **Step 3: Run full test suite**
Run: `node scripts/run-tests.mjs`
Expected: 100% pass across all 739+ tests.

- [ ] **Step 4: Commit and push**
```bash
git add .
git commit -m "chore(explainer-steps): update golden examples and verified 100% test pass"
git push origin main
```
