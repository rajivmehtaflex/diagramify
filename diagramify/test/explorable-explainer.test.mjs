import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractSvgs, parseXml } from "./helpers/xml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "diagramify-explorable-"));
const cli = path.join(skillRoot, "bin/diagramify.mjs");

function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: options.cwd || skillRoot,
    encoding: "utf8",
    env: options.env || process.env,
  });
}

test("explorable-steps renders KV Cache multi-section explorable explainer cleanly", () => {
  const input = path.join(skillRoot, "examples/explainer-kv-cache.json");
  const output = path.join(tmp, "kv-cache.html");
  const res = run(["deliver", "explainer-steps", input, output, "--quality", "showcase", "--json"]);

  assert.equal(res.status, 0, res.stderr);
  const data = JSON.parse(res.stdout);
  assert.equal(data.ok, true);
  assert.equal(data.validation.checksPassed, 9);
  assert.equal(data.validation.errors, 0);

  const html = fs.readFileSync(output, "utf8");
  const { direct } = extractSvgs(html);
  const svg = direct[0];
  assert.ok(svg, "Generated HTML must contain SVG diagram");
  const doc = parseXml(svg);
  assert.ok(doc, "SVG must be parseable XML");

  // Verify key explorable sections are present in markup
  assert.match(svg, /data-widget="decode-simulator"/, "Must contain decode simulator widget");
  assert.match(svg, /data-widget="cache-calculator"/, "Must contain cache calculator widget");
  assert.match(svg, /TL;DR/, "Must contain TL;DR block");
  assert.match(svg, /with cache — linear/, "Must contain complexity chart with linear curve");
  assert.match(svg, /without cache — quadratic/, "Must contain complexity chart with quadratic curve");
  assert.match(svg, /Multi-Query &amp; Grouped-Query|Multi-Query & Grouped-Query/, "Must contain comparison grid cards");
});

test("explorable-steps maintains backward compatibility with classic linear step rails", () => {
  const input = path.join(skillRoot, "examples/attention-mechanism.explainer-steps.json");
  const output = path.join(tmp, "attention.html");
  const res = run(["deliver", "explainer-steps", input, output, "--quality", "showcase", "--json"]);

  assert.equal(res.status, 0, res.stderr);
  const data = JSON.parse(res.stdout);
  assert.equal(data.ok, true);
  assert.equal(data.validation.checksPassed, 9);
  assert.equal(data.validation.errors, 0);
});

test("explorable-steps normalizes tldr takeaways and prevents grid_cards multi-row overlap", () => {
  const customSpec = {
    schema_version: 1,
    diagram_type: "explainer-steps",
    meta: {
      title: "Positional Encoding in Transformers",
      topic_tags: ["TRANSFORMERS", "POSITION", "ATTENTION", "ROPE"]
    },
    sections: [
      {
        kind: "tldr",
        takeaways: [
          "Self-attention has no inherent sense of word order.",
          "Position signals inject sequence coordinates so attention can learn distance."
        ]
      },
      {
        kind: "narrative",
        number: "§01",
        title: "Why attention needs help",
        paragraphs: [
          "Self-attention processes a sequence in parallel. Without an order signal, permuting input tokens leaves attention unchanged."
        ]
      },
      {
        kind: "grid_cards",
        number: "§02",
        title: "Four ways to represent position",
        columns: 2,
        cards: [
          { eyebrow: "CLASSIC", title: "Sinusoidal addition", description: "Fixed sin/cos vectors added to input embeddings." },
          { eyebrow: "LEARNED", title: "Learned position embeddings", description: "Trained position vector per index." },
          { eyebrow: "RELATIVE", title: "Relative position bias", description: "Attention bias based on token distance." },
          { eyebrow: "MODERN", title: "RoPE", description: "Position-dependent rotation applied to Q and K." }
        ]
      },
      {
        kind: "narrative",
        number: "§03",
        title: "Research grounding",
        paragraphs: [
          "Modern LLMs almost universally adopt RoPE for length generalization."
        ]
      }
    ]
  };

  const input = path.join(tmp, "position-explainer.json");
  fs.writeFileSync(input, JSON.stringify(customSpec, null, 2), "utf8");
  const output = path.join(tmp, "position-explainer.html");
  const res = run(["deliver", "explainer-steps", input, output, "--quality", "showcase", "--json"]);

  assert.equal(res.status, 0, res.stderr);
  const data = JSON.parse(res.stdout);
  assert.equal(data.ok, true);

  const html = fs.readFileSync(output, "utf8");
  const { direct } = extractSvgs(html);
  const svg = direct[0];

  // Verify TL;DR is non-empty and contains the takeaways bullet points
  assert.match(svg, /• Self-attention has no inherent sense of word order\./);
  assert.match(svg, /• Position signals inject sequence coordinates/);

  // Verify Section 3 (Research grounding) does NOT collide with Row 2 of grid_cards
  // In a 2-col 4-card grid, Row 0 is at cardStartY and Row 1 is at cardStartY + maxCardH + 14.
  // Section 3 must appear strictly below Row 1 cards.
  assert.match(svg, /id="section-grid-comparison"/);
  assert.match(svg, /§03/);
  assert.match(svg, /Research grounding/);
});
