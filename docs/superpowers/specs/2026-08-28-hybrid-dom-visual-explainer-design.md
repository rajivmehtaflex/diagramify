# Design Spec: Hybrid DOM Shell with Embedded Vector Plots for Visual Explainers

- **Author**: Antigravity Assistant & Rajiv Mehta
- **Status**: Approved
- **Date**: 2026-08-28
- **Topic**: Visual Explainer (`explainer-steps`) Dynamic Document Outline & Responsive Hybrid Architecture

---

## 1. Context & Motivation

The existing `explainer-steps` renderer in Diagramify compiles structured JSON specifications into a single fixed-coordinate SVG artboard (`VIEWBOX_WIDTH = 760`, fixed 632px single-column card stack). While this ensures consistent vector drawing, it has key limitations when presenting long-form technical explainers:
1. **Static Document Outline**: Lacks a Table of Contents (TOC), sticky sidebar navigation, or scroll-tracking progress.
2. **Rigid Single-Column Layout**: Cannot adapt across desktop viewports (e.g. side-by-side comparison cards or multi-column grids).
3. **Monolithic Vertical Scroll**: No progressive disclosure (accordions, tabs, or collapsible derivations).
4. **SVG-Drawn Controls**: Interactive sliders and buttons are rendered as SVG shapes rather than fluid HTML5 form controls.

This design upgrades `explainer-steps` into a **Hybrid DOM Shell** architecture inspired by modern interactive document frameworks (e.g., Claude Artifacts, Distill.pub), combining fluid HTML/CSS document layouts with high-precision SVG vector charts.

---

## 2. Architecture & Layout System

```
+-----------------------------------------------------------------------------------+
| Top Navigation Bar: Title, Theme Toggle (Light/Dark), Preset, Export Menu         |
+-----------------------------------------------------------------------------------+
| [Sticky Outline TOC (Left Rail)]     | [Main Responsive Article Canvas]           |
|                                      |                                            |
| * Document Title                     | +-- Section 1: TL;DR Takeaways ---------+ |
| * Reading Progress Indicator [==== ] | | * Bullet 1                            | |
|                                      | | * Bullet 2                            | |
| * §01 Overview                       | +---------------------------------------+ |
| * §02 Interactive Simulator          |                                            |
| * §03 Complexity Analysis (Active)   | +-- Section 2: Interactive Simulator ---+ |
| * §04 Parametric Sizing              | | [Step 1] [Step 2] [Step 3]            | |
| * §05 Comparative Taxonomy           | | Metric Cards | Native Play/Reset      | |
|                                      | +---------------------------------------+ |
| [Chapter Filter Tabs]                |                                            |
| [All] [Visual Lab] [Math] [Taxonomy] | +-- Section 3: Vector Chart + Curves ---+ |
|                                      | | Interactive SVG Coordinate Splines    | |
|                                      | +---------------------------------------+ |
|                                      |                                            |
|                                      | +-- Section 4: Parametric Calculator ---+ |
|                                      | | Native HTML5 Range Sliders            | |
|                                      | | Real-time Output Metric Badges        | |
|                                      | +---------------------------------------+ |
|                                      |                                            |
|                                      | +-- Section 5: Responsive Grid Cards ---+ |
|                                      | | [ Card A ]    [ Card B ]    [ Card C ]| |
|                                      | +---------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

### 2.1 Left Rail: Sticky Outline & Scroll-Spy Table of Contents (TOC)
- **Width**: `240px` on desktop (`>= 1024px`), accessible as a slide-out drawer on tablet/mobile (`< 1024px`).
- **Reading Progress Indicator**: A horizontal progress bar reflecting document scroll completion.
- **Scroll-Spy**: Uses browser `IntersectionObserver` to track which section is currently active and highlight its TOC entry in real time.
- **Direct Section Anchoring**: Clicking any entry smoothly scrolls to `#section-<id>` and updates the browser URL hash.
- **Chapter Filter Tabs**: Allows users to filter visible sections by tag or category (`All`, `Concept`, `Interactive Lab`, `Math & Sizing`, `Comparison`).

### 2.2 Main Canvas: Responsive Fluid Layout
- **Container**: Max width `1020px` centered with fluid margins and responsive padding.
- **Grid Layout**:
  - `grid_cards`: 2-column or 3-column responsive CSS grid (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`).
  - `tldr` & `narrative`: Fluid typography with native CSS line wrapping and font hierarchy.
  - `details` (Accordions): Collapsible `<details><summary>` wrappers for deep-dive mathematical proofs or raw code blocks.

---

## 3. Component Specifications

### 3.1 Simulator Block
- **Container**: Elevated card frame with responsive padding.
- **Step Chips Strip**: Horizontal scrollable/flex chip row with active focus styling (`border-color: var(--frontend-stroke)`).
- **Controls**: Native HTML `<button>` elements with hover and active states (`▶ Play`, `⏸ Pause`, `Reset`).
- **Metric Cards**: 3-column responsive stat grid with color-coded tokens (`frontend`, `cloud`, `database`, `security`).
- **Live State**: JavaScript scheduler updates active stage, computes live metrics, and highlights corresponding chips.

### 3.2 Complexity Chart Block
- **Container**: SVG vector canvas embedded within the responsive card container (`width: 100%`, `viewBox: 0 0 680 180`).
- **Curve Math**: Evaluates mathematical spline curves (`constant`, `logarithmic`, `linear`, `quadratic`, `exponential`).
- **Legend**: Color-coded SVG badges mapping to curve labels.

### 3.3 Parametric Calculator Block
- **Container**: Interactive card frame.
- **Input Controls**: Native HTML5 range inputs (`<input type="range">`) paired with live value indicators.
- **Output Metrics**: Grid cards showing calculated values with animated transitions on change.
- **Summary Note**: Responsive markdown callout explaining calculation takeaways.

---

## 4. IR Schema & Backward Compatibility

- The underlying JSON IR schema (`diagramify/schemas/explainer-steps.schema.json`) remains 100% backward-compatible.
- Existing JSON files (e.g. `explainer-kv-cache.json`, `attention-mechanism.explainer-steps.json`) compile seamlessly into the new responsive layout.

---

## 5. Verification Plan

1. **Unit Tests**:
   - Verify that delivered HTML outputs include the sticky outline TOC (`.explainer-toc`), scroll-spy data attributes, responsive section wrappers, and embedded SVG charts.
2. **Visual & Containment Regression**:
   - Verify layout containment across desktop (1440×900, 1920×1080) and mobile viewports (375×812) using `node bin/diagramify.mjs visual-check`.
3. **Full Test Suite**:
   - Run `node scripts/run-tests.mjs` to ensure 100% pass across all 739+ tests.
