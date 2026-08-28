import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, renderDefinitions, renderSemanticSigil, textUnits } from '../shared/utils.mjs';
import { animateAttr, focusNodeAttrs, focusNodeTitle, loadDiagramWithBrandMarks, writeDiagram, svgAccessibleText, svgRootAttrs } from '../shared/cli.mjs';
import { throwDiagnosticProblems } from '../shared/diagnostics.mjs';
import { resolveLegend, renderLegend as renderResolvedLegend } from '../shared/legend.mjs';
import { asArray, isFinitePoint } from '../shared/geometry.mjs';
import { translateMessage as i18nText } from '../shared/i18n.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { diagram: explainer, template, outPath } = await loadDiagramWithBrandMarks({
  rendererDir: __dirname,
  diagramType: 'explainer-steps',
  defaultExample: 'attention-mechanism.explainer-steps.json',
});

const VIEWBOX_WIDTH = 760;
const CARD_X = 64;
const CARD_GAP = 28;
const CARD_PADDING = 20;
const HEADER_H = 34;
const LINE_H = 15;
const MATH_LINE_H = 16;
const CODE_HEADER_H = 16;
const CODE_LINE_H = 13;
const DESC_MAX_UNITS = 90;
const TOP_MARGIN = 56;
const LEGEND_RESERVE = 64;
const CARD_WIDTH = VIEWBOX_WIDTH - CARD_X * 2;
const TEXT_X_OFFSET = 44;

const typeClass = {
  start: 'c-frontend',
  active: 'c-backend',
  waiting: 'c-cloud',
  decision: 'c-security',
  success: 'c-database',
  failure: 'c-security',
  neutral: 'c-external',
  external: 'c-external',
};

const textClass = {
  start: 't-frontend',
  active: 't-backend',
  waiting: 't-cloud',
  decision: 't-security',
  success: 't-database',
  failure: 't-security',
  neutral: 't-muted',
  external: 't-muted',
};

// Single-purpose word-wrap for step descriptions. text-fit.mjs is
// deliberately single-line (labels/sublabels/tags never wrap); descriptions
// are prose, so they need their own multi-line wrapper, measured in the same
// CJK-aware "text units" the rest of the codebase uses. Code and math are
// verbatim (see splitVerbatimLines) — never run through this function.
function wrapDescription(text, maxUnitsPerLine) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  let currentUnits = 0;
  for (const word of words) {
    const wordUnits = textUnits(word);
    const joinedUnits = current ? currentUnits + 1 + wordUnits : wordUnits;
    if (current && joinedUnits > maxUnitsPerLine) {
      lines.push(current);
      current = word;
      currentUnits = wordUnits;
    } else {
      current = current ? `${current} ${word}` : word;
      currentUnits = joinedUnits;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// Code and math preserve the author's own line breaks — re-wrapping source
// code or a multi-line derivation would silently corrupt its meaning, unlike
// prose where re-wrapping is purely cosmetic.
function splitVerbatimLines(text) {
  return String(text ?? '').split('\n');
}

function measureStep(step) {
  const descLines = wrapDescription(step.description, DESC_MAX_UNITS);
  const mathLines = step.math ? splitVerbatimLines(step.math) : [];
  const codeLines = step.code ? splitVerbatimLines(step.code.content) : [];
  let height = HEADER_H;
  if (descLines.length) height += descLines.length * LINE_H + 10;
  if (mathLines.length) height += mathLines.length * MATH_LINE_H + 8;
  if (codeLines.length) height += CODE_HEADER_H + codeLines.length * CODE_LINE_H + 16;
  height += CARD_PADDING;
  return { ...step, descLines, mathLines, codeLines, height };
}

const measuredSteps = asArray(explainer.steps).map(measureStep);
const steps = new Map();
let cursorY = TOP_MARGIN;
for (const step of measuredSteps) {
  steps.set(step.id, { ...step, x: CARD_X, y: cursorY, width: CARD_WIDTH });
  cursorY += step.height + CARD_GAP;
}
const viewBoxHeight = Math.max(320, cursorY - CARD_GAP + LEGEND_RESERVE);
const viewBox = [VIEWBOX_WIDTH, viewBoxHeight];

function validateExplainerSteps() {
  const problems = [];
  if (explainer.schema_version !== 1) problems.push('Explainer-steps files must set "schema_version": 1.');
  if (explainer.diagram_type !== 'explainer-steps') problems.push('Explainer-steps files must set "diagram_type": "explainer-steps".');
  if (!explainer.meta?.title) problems.push('Explainer-steps files must include meta.title.');
  if (!Array.isArray(explainer.steps) || explainer.steps.length < 2) problems.push('Explainer-steps diagrams need at least two steps.');
  if (explainer.cards !== undefined && !Array.isArray(explainer.cards)) problems.push('Explainer-steps "cards" must be an array.');
  if (steps.size !== asArray(explainer.steps).length) problems.push('Step ids must be unique.');

  for (const step of steps.values()) {
    if (!isFinitePoint(step.x, step.y, step.width, step.height)) {
      problems.push(`Step "${step.id}" produced non-finite coordinates — this is an internal layout bug, not an authoring error.`);
    }
  }

  if (problems.length) {
    throwDiagnosticProblems('Explainer-steps layout validation failed', problems, {
      subject: { diagramType: 'explainer-steps' },
    });
  }
}

// Renders step.code as a distinct monospace block: a backdrop rect (reusing
// the existing theme-aware .c-mask class, the same "occlusion panel" pattern
// every other renderer already uses under text) plus one <text> per source
// line. No syntax highlighting — every diagramify SVG already renders in a
// monospace font stack (assets/template.html:354), so code reads correctly
// without one.
function renderCodeBlock(step, startY) {
  if (!step.codeLines.length) return { markup: '', nextY: startY };
  const blockHeight = CODE_HEADER_H + step.codeLines.length * CODE_LINE_H + 10;
  const headerText = step.code.language ? `code (${step.code.language})` : 'code';
  const lines = step.codeLines.map((line, index) => `
          <text data-detail="context" x="${step.x + TEXT_X_OFFSET + 8}" y="${startY + CODE_HEADER_H + 4 + index * CODE_LINE_H}" class="t-muted" font-size="8">${esc(line)}</text>`).join('');
  const markup = `
          <rect x="${step.x + TEXT_X_OFFSET - 4}" y="${startY - 10}" width="${step.width - TEXT_X_OFFSET - 8}" height="${blockHeight}" rx="4" class="c-mask"/>
          <text data-detail="fine" x="${step.x + TEXT_X_OFFSET + 8}" y="${startY + 2}" class="t-dim" font-size="7" font-weight="700">${esc(headerText.toUpperCase())}</text>${lines}`;
  // NOTE: nextY is currently unused (code is always the last block in stacking order).
  // If code blocks ever appear mid-stack, double-check that spacing constants here sync with measureStep.
  return { markup, nextY: startY + blockHeight + 8 };
}

// Renders step.math as italic, non-boxed lines directly beneath the
// description — visually distinct from both prose (upright, wrapped) and
// code (boxed, upright) without adding a real math typesetting engine.
function renderMathBlock(step, startY) {
  if (!step.mathLines.length) return { markup: '', nextY: startY };
  const lines = step.mathLines.map((line, index) => `
          <text data-detail="context" x="${step.x + TEXT_X_OFFSET}" y="${startY + index * MATH_LINE_H}" class="t-primary" font-size="9" font-style="italic">${esc(line)}</text>`).join('');
  return { markup: lines, nextY: startY + step.mathLines.length * MATH_LINE_H + 8 };
}

function renderStep(step, index, total) {
  const fill = typeClass[step.type] || typeClass.neutral;
  const accent = textClass[step.type] || 't-muted';
  const passport = {
    kind: step.type,
    sublabel: step.sublabel,
    tag: step.tag,
    context: i18nText(explainer.meta.locale, 'node.context.explainer-steps'),
  };
  const textX = step.x + TEXT_X_OFFSET;
  const sub = step.sublabel
    ? `\n          <text data-detail="context" x="${textX}" y="${step.y + 48}" class="t-muted" font-size="9">${esc(step.sublabel)}</text>`
    : '';
  const tag = step.tag
    ? `\n        <text data-detail="fine" x="${step.x + step.width - 12}" y="${step.y + 20}" class="${accent}" font-size="8" text-anchor="end">${esc(step.tag)}</text>`
    : '';
  let cursor = step.y + (step.sublabel ? 64 : 48);
  const descLines = step.descLines.map((line, lineIndex) => `
          <text data-detail="context" x="${textX}" y="${cursor + lineIndex * LINE_H}" class="t-muted" font-size="8">${esc(line)}</text>`).join('');
  if (step.descLines.length) cursor += step.descLines.length * LINE_H + 10;
  const math = renderMathBlock(step, cursor);
  cursor = math.nextY;
  const code = renderCodeBlock(step, cursor);
  const connector = index < total - 1
    ? `\n        <path d="M ${step.x + 16} ${step.y + step.height} L ${step.x + 16} ${step.y + step.height + CARD_GAP}" class="a-default" stroke-width="1.4" stroke-dasharray="2,6" marker-end="url(#arrowhead)"/>`
    : '';
  return `        <g ${focusNodeAttrs(step.id, step.label, passport, explainer.meta.locale)}>
          ${focusNodeTitle(step.label, passport)}
          <rect x="${step.x}" y="${step.y}" width="${step.width}" height="${step.height}" rx="10" class="c-mask"/>
          <rect x="${step.x}" y="${step.y}" width="${step.width}" height="${step.height}" rx="10" class="${fill}" stroke-width="1.5"${animateAttr(explainer.meta, 'node', index)}/>
          ${renderSemanticSigil(step.type, { x: step.x + 16, y: step.y + 16 })}
          <text data-detail="fine" x="${textX}" y="${step.y + 16}" class="${accent}" font-size="8" font-weight="700">STEP ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</text>
          <text data-node-label="" x="${textX}" y="${step.y + 32}" class="t-primary" font-size="13" font-weight="600">${esc(step.label)}</text>${tag}${sub}${descLines}${math.markup}${code.markup}
        </g>${connector}`;
}

const LEGEND_CATALOG = [
  'start', 'active', 'waiting', 'decision', 'success', 'failure', 'neutral', 'external',
].map((kind) => ({ kind, label: i18nText(explainer.meta.locale, `legend.explainer-steps.${kind}`) }));

function renderLegend() {
  const presentKinds = new Set([...steps.values()].map((step) => step.type));
  const entries = resolveLegend(explainer.meta?.legend, LEGEND_CATALOG, presentKinds);
  return renderResolvedLegend({
    entries,
    locale: explainer.meta.locale,
    layout: {
      x: 40,
      baselineY: viewBox[1] - 36,
      width: viewBox[0] - 80,
      minTitleY: cursorY - CARD_GAP + 8,
      unfit: explainer.meta?.legend === undefined ? 'hide' : 'error',
      diagramType: 'explainer-steps',
    },
    renderSwatch: (entry) => `<rect x="${entry.x}" y="${entry.baseline - 8}" width="14" height="9" rx="2" class="${typeClass[entry.kind] || 'c-external'}" stroke-width="1"/>`,
  });
}

function renderSvg() {
  const orderedSteps = asArray(explainer.steps).map((step) => steps.get(step.id));
  return `      <svg viewBox="0 0 ${viewBox[0]} ${viewBox[1]}" ${svgRootAttrs(explainer.meta, 'explainer steps diagram')}>
${svgAccessibleText(explainer.meta, 'explainer-steps')}
${renderDefinitions()}

        <!-- Background Grid -->
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Steps -->
${orderedSteps.map((step, index) => renderStep(step, index, orderedSteps.length)).join('\n\n')}

        <!-- Legend -->
${renderLegend()}
      </svg>`;
}

validateExplainerSteps();
writeDiagram({
  outPath,
  template,
  diagramType: 'explainer-steps',
  meta: explainer.meta,
  svg: renderSvg(),
  cards: explainer.cards,
});
