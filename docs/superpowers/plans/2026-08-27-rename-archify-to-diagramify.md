# Repository & Package Rename: Archify to Diagramify Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fully rename the "Archify" repository and skill package to "Diagramify" (owner `tt-a1i` -> `rajivmehtaflex`), updating directory structure, package identities, CLI binary, DeepSeek Harness adapter, runtime identifiers, documentation, and CI workflows, while strictly preserving MIT copyright notices in LICENSE files and keeping binary image assets untouched.

**Architecture:** The project consists of a core Node.js rendering engine in the primary skill directory (`diagramify/`), DeepSeek Harness adapter integration (`integrations/deepseek-harness/`), verification & build tooling (`scripts/`), documentation site (`docs/`), and GitHub Actions automation (`.github/`). The renaming transitions each layer methodically: directory restructuring, package manifests and binaries, adapter integration, skill definitions, internal runtime sentinels/globals/CSS/env vars, documentation and branding, GitHub workflows and CODEOWNERS, deterministic zip generation, LICENSE preservation validation, and full-repo residual scanning.

**Tech Stack:** Node.js (v22+), ES Modules, Node.js Native Test Runner (`node --test`), Shell (`bash`), HTML5/CSS3/SVG, Git.

## Global Constraints

- **Git Branch:** All work occurs on `rename/archify-to-diagramify`.
- **Owner Identity:** New owner namespace is `rajivmehtaflex` (formerly `tt-a1i`).
- **Package Identity:** Skill package name is `diagramify` (formerly `archify`), DSH package is `@rajivmehtaflex/diagramify-dsh` (formerly `@tt-a1i/archify-dsh`).
- **Binary Image Preservation:** All 69 binary image assets (PNG, JPG, GIF in `docs/assets/`, `docs/`, `docs/issue-52-visual-evidence/`, `experiments/`) must remain untouched with unmodified filenames.
- **LICENSE Preservation:** MIT Copyright notices (`Copyright (c) 2026 tt-a1i (Archify)` and `Copyright (c) 2025 Cocoon AI (original "architecture-diagram-generator")`) in `LICENSE` and `diagramify/LICENSE` must remain 100% verbatim.
- **README Synchronization:** `README_EN.md` must remain strictly byte-identical to `README.md` at all times.
- **Task 11 Gating:** Remote repository transfer and origin updates are gated and deferred.

---

### Task 0: Branch Setup, Plan Placement, and Baseline Verification

**Files:**
- Create: `docs/superpowers/plans/2026-08-27-rename-archify-to-diagramify.md`

**Interfaces:**
- Consumes: Baseline repository state on `main`
- Produces: Active branch `rename/archify-to-diagramify` and saved plan file

- [ ] **Step 1: Check out feature branch**

```bash
git checkout -b rename/archify-to-diagramify
```

- [ ] **Step 2: Create implementation plan file**

Save complete implementation plan to `docs/superpowers/plans/2026-08-27-rename-archify-to-diagramify.md`.

- [ ] **Step 3: Verify baseline test runner passes**

```bash
node scripts/run-tests.mjs
```
Expected: All 84 test suites pass.

- [ ] **Step 4: Commit baseline setup**

```bash
git add docs/superpowers/plans/2026-08-27-rename-archify-to-diagramify.md
git commit -m "docs: add archify to diagramify implementation plan"
```

---

### Task 1: Rename Source Directory & Update Root Tooling and CI Workflows

**Files:**
- Move: `archify/` -> `diagramify/`
- Modify:
  - `scripts/run-tests.mjs`
  - `scripts/build-gallery.mjs`
  - `scripts/build-guide.mjs`
  - `scripts/build-start.mjs`
  - `scripts/build-readme-showcase.mjs`
  - `scripts/package-smoke.mjs`
  - `scripts/check-release-identity.mjs`
  - `scripts/build-zip.sh`
  - `.gitattributes`
  - `.github/workflows/ci.yml`
  - `.github/workflows/release.yml`
  - `.github/workflows/dsh.yml`
  - `integrations/deepseek-harness/scripts/pack.mjs`

**Interfaces:**
- Consumes: Directory `archify/`
- Produces: Directory `diagramify/` with all root scripts and CI workflows targeting `diagramify/`

- [ ] **Step 1: Perform git directory rename**

```bash
git mv archify diagramify
```

- [ ] **Step 2: Update `.gitattributes`**

Update `/archify/` paths to `/diagramify/`:
```gitattributes
/diagramify/examples/*.html linguist-generated=true
/diagramify/renderers/shared/generated-brand-marks.mjs linguist-generated=true
/diagramify/renderers/shared/generated-validators.mjs linguist-generated=true
```

- [ ] **Step 3: Update root scripts in `scripts/` referencing `archify/`**

1. `scripts/run-tests.mjs`: `path.join(repoRoot, 'archify')` -> `path.join(repoRoot, 'diagramify')`
2. `scripts/build-gallery.mjs`: `path.join(repoRoot, 'archify')` -> `path.join(repoRoot, 'diagramify')`
3. `scripts/build-guide.mjs`: `../archify/recipes/scenarios.mjs` -> `../diagramify/recipes/scenarios.mjs`, `archify/package.json` -> `diagramify/package.json`
4. `scripts/build-start.mjs`: `../archify/recipes/scenarios.mjs` -> `../diagramify/recipes/scenarios.mjs`, `archify/package.json` -> `diagramify/package.json`
5. `scripts/package-smoke.mjs`: Default fallback path and runner temp path to `diagramify`
6. `scripts/check-release-identity.mjs`: Update check paths from `archify/` to `diagramify/`
7. `scripts/build-zip.sh`: Update staging source and git ls-files to target `diagramify`

- [ ] **Step 4: Update CI workflows and DSH pack script**

1. `.github/workflows/ci.yml`: Update `working-directory: diagramify` and `cache-dependency-path: diagramify/package-lock.json`.
2. `.github/workflows/release.yml`: Update `working-directory: diagramify` and `diagramify/package.json`.
3. `.github/workflows/dsh.yml`: Update triggers and reference tags.
4. `integrations/deepseek-harness/scripts/pack.mjs`: Update `archify` source references to `diagramify`.

- [ ] **Step 5: Verify test runner against renamed directory**

```bash
node scripts/run-tests.mjs
```
Expected: Tests execute targeting `diagramify/`.

- [ ] **Step 6: Commit Task 1 changes**

```bash
git add .
git commit -m "refactor: rename archify directory to diagramify and update root tooling"
```

---

### Task 2: Rename CLI Binary & Package Identity

**Files:**
- Move: `diagramify/bin/archify.mjs` -> `diagramify/bin/diagramify.mjs`
- Modify:
  - `diagramify/package.json`
  - `diagramify/package-lock.json`
  - `diagramify/bin/diagramify.mjs`
  - `diagramify/bin/preview.mjs`
  - `diagramify/bin/visual-check.mjs`
  - `diagramify/test/cli.test.mjs`
  - `diagramify/test/desktop-reader-browser.test.mjs`
  - `scripts/package-smoke.mjs`

**Interfaces:**
- Consumes: `diagramify/bin/archify.mjs`, package name `archify`
- Produces: CLI binary `bin/diagramify.mjs`, package name `diagramify`, binary mapping `"diagramify": "./bin/diagramify.mjs"`

- [ ] **Step 1: Rename CLI binary with git mv**

```bash
git mv diagramify/bin/archify.mjs diagramify/bin/diagramify.mjs
```

- [ ] **Step 2: Update package manifests**

In `diagramify/package.json`:
```json
"name": "diagramify",
"bin": {
  "diagramify": "./bin/diagramify.mjs"
}
```
In `diagramify/package-lock.json`: Update top-level and packages[""] name to `diagramify` and bin entry to `"diagramify": "bin/diagramify.mjs"`.

- [ ] **Step 3: Update CLI usage text and internal references**

In `diagramify/bin/diagramify.mjs`:
Update usage header and command strings (`diagramify render`, `diagramify compare`, `diagramify deliver`, `diagramify preview`, `diagramify validate`, `diagramify inspect`, `diagramify check`, `diagramify visual-check`, `diagramify guide`, `diagramify brands`, `diagramify examples`, `diagramify doctor`, `diagramify demo`).
Update doctor output: `Diagramify doctor`, `Diagramify is ready.`

In `diagramify/bin/preview.mjs`:
Update cliPath to `diagramify.mjs`, titles to `Diagramify Live Preview`, brand to `Diagramify Preview`.

- [ ] **Step 4: Update test files targeting CLI path**

Update spawn paths and assertions in `diagramify/test/cli.test.mjs`, `diagramify/test/desktop-reader-browser.test.mjs`, and `scripts/package-smoke.mjs`.

- [ ] **Step 5: Verify CLI and unit tests**

```bash
node diagramify/bin/diagramify.mjs doctor
node --test diagramify/test/cli.test.mjs
```
Expected: Doctor outputs "Diagramify is ready." and CLI tests pass.

- [ ] **Step 6: Commit Task 2 changes**

```bash
git add .
git commit -m "feat: rename CLI binary and package identity to diagramify"
```

---

### Task 3: Rename DeepSeek Harness Adapter Package (@rajivmehtaflex/diagramify-dsh)

**Files:**
- Modify:
  - `integrations/deepseek-harness/package.json`
  - `integrations/deepseek-harness/lib/index.js`
  - `integrations/deepseek-harness/cordis.patch.yml`
  - `integrations/deepseek-harness/README.md`
  - `integrations/deepseek-harness/scripts/pack.mjs`
  - `integrations/deepseek-harness/scripts/distribution-acceptance.mjs`
  - `integrations/deepseek-harness/test/adapter-security.test.mjs`
  - `integrations/deepseek-harness/test/docs-contract.test.mjs`
  - `integrations/deepseek-harness/test/package-contract.test.mjs`
  - `integrations/deepseek-harness/test/probe-skills.mjs`
  - `integrations/deepseek-harness/test/probe-skills.test.mjs`
  - `integrations/deepseek-harness/test/tarball-contract.test.mjs`
  - `integrations/deepseek-harness/test/zero-regression.test.mjs`

**Interfaces:**
- Consumes: Package `@tt-a1i/archify-dsh`
- Produces: Package `@rajivmehtaflex/diagramify-dsh`, exported function `resolveDiagramifySkillRoot`, patch `diagramify-skill-filesystem`

- [ ] **Step 1: Update DSH package.json and lib/index.js**

In `integrations/deepseek-harness/package.json`:
```json
"name": "@rajivmehtaflex/diagramify-dsh",
"description": "DeepSeek Harness skill adapter for Diagramify",
"repository": {
  "type": "git",
  "url": "git+https://github.com/rajivmehtaflex/diagramify.git",
  "directory": "integrations/deepseek-harness"
}
```
In `integrations/deepseek-harness/lib/index.js`:
Export `name = 'diagramify-dsh'`, `PACKAGE_NAME = '@rajivmehtaflex/diagramify-dsh'`, `resolveDiagramifySkillRoot` resolving `skills/diagramify`.

- [ ] **Step 2: Update cordis.patch.yml & README.md**

In `cordis.patch.yml`: Set id to `diagramify-skill-filesystem`, providerName to `diagramify-plugin`, and resolve `@rajivmehtaflex/diagramify-dsh/package.json` with `skills/diagramify`.
In `README.md`: Update title to `# @rajivmehtaflex/diagramify-dsh` and commands to `dsh install @rajivmehtaflex/diagramify-dsh`.

- [ ] **Step 3: Update DSH scripts and test contracts**

Update `distribution-acceptance.mjs` and all contract tests in `test/` to assert new package name, tarball name (`rajivmehtaflex-diagramify-dsh-0.1.0.tgz`), and skill paths.

- [ ] **Step 4: Verify DSH test suite**

```bash
cd integrations/deepseek-harness && npm test && cd ../..
```
Expected: All package contract, security, and docs tests pass.

- [ ] **Step 5: Commit Task 3 changes**

```bash
git add integrations/deepseek-harness
git commit -m "feat(dsh): rename adapter package to @rajivmehtaflex/diagramify-dsh"
```

---

### Task 4: Rename SKILL.md Identity & Scenario Recipes

**Files:**
- Modify:
  - `diagramify/SKILL.md`
  - `diagramify/recipes/scenarios.mjs`

**Interfaces:**
- Consumes: `diagramify/SKILL.md` with old name `archify`
- Produces: `SKILL.md` frontmatter `name: diagramify`, `author: rajivmehtaflex`, and recipes referencing `diagramify`

- [ ] **Step 1: Update `diagramify/SKILL.md`**

Update frontmatter:
```yaml
---
name: diagramify
description: ...
author: rajivmehtaflex
---
```
Update H1 to `# Diagramify`, CLI examples to `bin/diagramify.mjs`, and all reference examples.

- [ ] **Step 2: Update `diagramify/recipes/scenarios.mjs`**

Update prompt strings across all 11 scenarios (system-overview, agent-tool-call, api-request, event-stream, object-lifecycle, auth-flow, deployment-ownership, product-analytics, agent-run, release-delivery, incident-response) in English and Chinese to use "Diagramify" / "diagramify".
Update guide help outputs to `diagramify guide`.

- [ ] **Step 3: Verify recipe & skill tests**

```bash
node --test diagramify/test/scenario-recipes.test.mjs diagramify/test/golden.mjs
```
Expected: Tests pass cleanly.

- [ ] **Step 4: Commit Task 4 changes**

```bash
git add diagramify/SKILL.md diagramify/recipes/scenarios.mjs
git commit -m "docs(skill): update SKILL.md identity and scenario recipes for diagramify"
```

---

### Task 5: Rename Internal Runtime Identifiers (Env Vars, Globals, Sentinels, Theme, CSS)

**Files:**
- Modify:
  - `diagramify/assets/template.html`
  - `diagramify/renderers/shared/raster-capture.mjs`
  - `diagramify/renderers/shared/brand-capture.mjs`
  - `diagramify/renderers/shared/diagnostics.mjs`
  - `diagramify/renderers/shared/output-path.mjs`
  - `diagramify/renderers/shared/system-open.mjs`
  - `diagramify/renderers/shared/utils.mjs`
  - `diagramify/renderers/shared/i18n.mjs`
  - `diagramify/renderers/architecture/render-architecture.mjs`
  - `diagramify/renderers/workflow/render-workflow.mjs`
  - `diagramify/renderers/sequence/render-sequence.mjs`
  - `diagramify/renderers/dataflow/render-dataflow.mjs`
  - `diagramify/renderers/lifecycle/render-lifecycle.mjs`
  - `diagramify/renderers/explainer-steps/render-explainer-steps.mjs`
  - `diagramify/delta/architecture-delta.mjs`
  - `diagramify/test/*.test.mjs`

**Interfaces:**
- Consumes: `ARCHIFY_*` env vars, `window.Archify`, `archify-theme`, `<!-- ARCHIFY:* -->`
- Produces: `DIAGRAMIFY_*` env vars, `window.Diagramify`, `diagramify-theme`, `<!-- DIAGRAMIFY:* -->`, `--diagramify-*` CSS variables, `.diagramify-toast`

- [ ] **Step 1: Rename environment variables**

Replace all `ARCHIFY_CHROME`, `ARCHIFY_CHROME_NO_SANDBOX`, `ARCHIFY_BRAND_ALLOW_PRIVATE`, `ARCHIFY_BRAND_CAPTURE_TIMEOUT_MS`, `ARCHIFY_DIAGNOSTIC_FORMAT`, `ARCHIFY_QUALITY_PROFILE`, `ARCHIFY_REPO_ROOT`, `ARCHIFY_TEST_RENDER_STARTED`, `ARCHIFY_TEST_OPEN_LOG`, `ARCHIFY_FFMPEG`, `ARCHIFY_REACH_CARD_*` with their `DIAGRAMIFY_*` equivalents.

- [ ] **Step 2: Update HTML template sentinels, DOM IDs, globals, and theme storage**

In `diagramify/assets/template.html` and `renderers/shared/utils.mjs`:
- Sentinels: `<!-- DIAGRAMIFY:SVG_SLOT_START -->`, `<!-- DIAGRAMIFY:SVG_SLOT_END -->`, `<!-- DIAGRAMIFY:CARDS_SLOT_START -->`, `<!-- DIAGRAMIFY:CARDS_SLOT_END -->`, `<!-- DIAGRAMIFY:GUIDED_VIEWS_DATA -->`, `<!-- DIAGRAMIFY:SOURCE_EVIDENCE_DATA -->`, `<!-- DIAGRAMIFY:I18N_DATA -->`.
- DOM IDs: `diagramify-i18n-data`, `diagramify-source-evidence-data`, `diagramify-guided-views-data`, `diagramify-compare-receipt`, `diagramify-diagram-title`, `diagramify-diagram-description`.
- Global: `window.Diagramify`.
- LocalStorage Theme: `diagramify-theme`.
- CSS variables: `--diagramify-nav-reserve`, `--diagramify-reader-width`, `--diagramify-radar-*`, `--diagramify-scroll-x`.
- CSS class: `.diagramify-toast`.
- Animation keyframes: `diagramify-share-cue-enter`, `diagramify-story-caption-in`, etc.
- Diagnostics property: `error.diagramifyDiagnostics`, `dataset.diagramifyDeltaExport`.

- [ ] **Step 3: Update badges and i18n messages**

In `diagramify/renderers/shared/i18n.mjs`:
Update generated badge strings to `DIAGRAMIFY / PLATE 04`, `DIAGRAMIFY · ROUTE · {hops}`, etc.

- [ ] **Step 4: Update test assertions across `diagramify/test/`**

Update test assertions expecting the new sentinels, CSS variables, DOM IDs, and environment variable names.

- [ ] **Step 5: Run full test suite to verify runtime changes**

```bash
node scripts/run-tests.mjs
```
Expected: All 84 test suites pass.

- [ ] **Step 6: Commit Task 5 changes**

```bash
git add diagramify/
git commit -m "feat(runtime): update runtime identifiers, globals, sentinels, and css to diagramify"
```

---

### Task 6: Documentation, Static Site & Branding Pass

**Files:**
- Move: `docs/article-archify.md` -> `docs/article-diagramify.md`
- Modify:
  - `README.md`
  - `README_EN.md`
  - `README_ZH.md`
  - `ROADMAP.md`
  - `PRODUCT.md`
  - `DESIGN.md`
  - `CONTRIBUTING.md`
  - `CHANGELOG.md`
  - `.impeccable/design.json`
  - `docs/article-diagramify.md`
  - `docs/index.html`
  - `docs/start.html`
  - `docs/guide.html`
  - `docs/gallery.html`
  - `docs/cases/mco-runtime.architecture.html`
  - `docs/authoring-cookbook.md`
  - `docs/authoring-cookbook.zh-CN.md`
  - `scripts/gallery-template.html`
  - `scripts/guide-template.html`
  - `scripts/start-template.html`

**Interfaces:**
- Consumes: Existing documentation referencing `Archify` / `tt-a1i`
- Produces: Fully rebranded documentation and generated public site referencing `Diagramify` / `rajivmehtaflex` with `README_EN.md` byte-identical to `README.md`

- [ ] **Step 1: Rename article file**

```bash
git mv docs/article-archify.md docs/article-diagramify.md
```

- [ ] **Step 2: Update READMEs, ROADMAP, PRODUCT, DESIGN, and CONTRIBUTING**

Update URLs (`https://rajivmehtaflex.github.io/diagramify/`, `https://github.com/rajivmehtaflex/diagramify`), installation commands (`npx skills add rajivmehtaflex/diagramify -g`, `dsh plugin --profile web add @rajivmehtaflex/diagramify-dsh@0.1.0`), Raven zip boundary instructions (`extract diagramify.zip into ~/.raven/workspace/skills; it yields ~/.raven/workspace/skills/diagramify`), CLI invocations (`node diagramify/bin/diagramify.mjs`), and branding descriptions.
Ensure `README_EN.md` is copied exactly from `README.md` (`cp README.md README_EN.md`).

- [ ] **Step 3: Update documentation HTML files and templates**

Update `scripts/gallery-template.html`, `scripts/guide-template.html`, `scripts/start-template.html`, `docs/index.html`, and rebuild static pages via:
```bash
node scripts/build-gallery.mjs docs
node scripts/build-guide.mjs docs/guide.html
node scripts/build-start.mjs docs/start.html
```

- [ ] **Step 4: Verify release identity checks**

```bash
node scripts/check-release-identity.mjs
```
Expected: `release identity ok: 2.16.0-dev.0` passes with 0 errors.

- [ ] **Step 5: Commit Task 6 changes**

```bash
git add .
git commit -m "docs: rebrand all documentation, templates, and static pages to diagramify"
```

---

### Task 7: GitHub-Owner Surfaces & Repository Governance

**Files:**
- Modify:
  - `.github/CODEOWNERS`
  - `.github/ISSUE_TEMPLATE/bug-report.yml`
  - `.github/ISSUE_TEMPLATE/showcase.yml`
  - `.github/PULL_REQUEST_TEMPLATE.md`
  - `.github/workflows/ci.yml`
  - `.github/workflows/release.yml`
  - `.github/workflows/dsh.yml`

**Interfaces:**
- Consumes: `.github/` files referencing `@tt-a1i`
- Produces: `.github/` files assigned to `@rajivmehtaflex` and configured for `diagramify` workflows

- [ ] **Step 1: Update `.github/CODEOWNERS`**

Set code owners to `@rajivmehtaflex`:
```text
/.github/CODEOWNERS @rajivmehtaflex
/.github/workflows/** @rajivmehtaflex
/.github/actions/** @rajivmehtaflex
```

- [ ] **Step 2: Update issue templates & PR template**

Update `bug-report.yml` and `showcase.yml` form labels and placeholder texts.
Update `PULL_REQUEST_TEMPLATE.md` checklist references to `diagramify.zip` and `diagramify/`.

- [ ] **Step 3: Update CI & Release workflow step names and environment variables**

Update workflow steps referencing `archify.zip` -> `diagramify.zip`, `ARCHIFY_CHROME` -> `DIAGRAMIFY_CHROME`, and `archify-package` -> `diagramify-package`.

- [ ] **Step 4: Verify workflow files**

```bash
node -e "const yaml = require('fs').readFileSync('.github/workflows/ci.yml', 'utf8'); console.log('CI workflow length:', yaml.length);"
```
Expected: Workflows parse cleanly.

- [ ] **Step 5: Commit Task 7 changes**

```bash
git add .github/
git commit -m "chore(github): update CODEOWNERS, templates, and workflows for rajivmehtaflex/diagramify"
```

---

### Task 8: Rename Distributable Archive (`diagramify.zip`) & Packaging Build

**Files:**
- Delete/Replace: `archify.zip` -> `diagramify.zip`
- Modify:
  - `scripts/build-zip.sh`

**Interfaces:**
- Consumes: Source directory `diagramify/`
- Produces: Shipped archive `diagramify.zip` built deterministically

- [ ] **Step 1: Update `scripts/build-zip.sh`**

Ensure default output archive is `diagramify.zip`, source directory is `diagramify`, and validators check `diagramify/renderers/shared/generated-validators.mjs`.

- [ ] **Step 2: Build fresh `diagramify.zip` and remove legacy `archify.zip`**

```bash
rm -f archify.zip
bash scripts/build-zip.sh diagramify.zip
```
Expected: Creates deterministic `diagramify.zip` containing `diagramify/` root.

- [ ] **Step 3: Verify package smoke against fresh archive**

```bash
node scripts/package-smoke.mjs
```
Expected: Package smoke passes against `diagramify.zip`.

- [ ] **Step 4: Commit Task 8 changes**

```bash
git add scripts/build-zip.sh diagramify.zip
git rm --cached archify.zip 2>/dev/null || true
git commit -m "feat(dist): build canonical diagramify.zip distributable archive"
```

---

### Task 9: MIT LICENSE Verification

**Files:**
- Verify:
  - `LICENSE` (root)
  - `diagramify/LICENSE`

**Interfaces:**
- Consumes: `LICENSE` files
- Produces: Verified verbatim copyright lines

- [ ] **Step 1: Inspect copyright lines in both LICENSE files**

```bash
grep -n "Copyright (c)" LICENSE diagramify/LICENSE
```
Expected output:
```text
LICENSE:3:Copyright (c) 2026 tt-a1i (Archify)
LICENSE:4:Copyright (c) 2025 Cocoon AI (original "architecture-diagram-generator")
diagramify/LICENSE:3:Copyright (c) 2026 tt-a1i (Archify)
diagramify/LICENSE:4:Copyright (c) 2025 Cocoon AI (original "architecture-diagram-generator")
```

- [ ] **Step 2: Confirm verbatim preservation**

Verify no modifications were made to the MIT license attribution text.

---

### Task 10: Full-Repo Residual Scan & Final Verification

**Files:**
- Audit entire repository

**Interfaces:**
- Consumes: Full repository tree
- Produces: 0 unexpected matches for `archify` / `tt-a1i` and 100% passing test gates

- [ ] **Step 1: Run full residual string scan**

```bash
node -e '
const { execSync } = require("child_process");
const result = execSync("git grep -inI "tt-a1i" || true", { encoding: "utf8" });
const lines = result.split("
").filter(l => l && !l.includes("LICENSE") && !l.includes(".agents/") && !l.includes("docs/superpowers/plans/"));
if (lines.length > 0) {
  console.error("Residual tt-a1i matches found:", lines);
  process.exit(1);
} else {
  console.log("Zero residual tt-a1i matches!");
}
'
```

- [ ] **Step 2: Run all test and verification gates**

1. `node scripts/run-tests.mjs` (100% test pass)
2. `npm test` inside `diagramify/` (brand marks, validators, release identity, golden, tests)
3. `npm test` inside `integrations/deepseek-harness/`
4. `node scripts/check-release-identity.mjs`
5. `node scripts/package-smoke.mjs`
6. Zip freshness check: `bash scripts/build-zip.sh /tmp/fresh.zip && cmp -s /tmp/fresh.zip diagramify.zip`

- [ ] **Step 3: Final confirmation**

Document all outputs in final handoff report.

---

### Task 11 (GATED): Remote Transfer & Origin Sync

**Status:** Deferred until explicit user confirmation.
