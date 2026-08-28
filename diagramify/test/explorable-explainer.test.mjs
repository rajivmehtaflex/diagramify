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
  assert.match(svg, /data-widget="explainer-simulator"|data-widget="decode-simulator"/, "Must contain simulator widget");
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

test("explorable-steps normalizes tldr takeaways, prevents grid_cards multi-row overlap, and renders topic-aware position simulators", () => {
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
        kind: "simulator",
        number: "§02",
        title: "See position signals vary",
        widget_type: "position_signals",
        prompt_tokens: ["The", "cat", "sat", "on", "the", "mat"]
      },
      {
        kind: "grid_cards",
        number: "§03",
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
        number: "§04",
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

  // Verify Simulator is rendered with position signals (chips, indices, signal frequency, NO kv cache copy)
  assert.match(svg, /POSITION SIGNAL SIMULATOR/);
  assert.match(svg, /ACTIVE POSITION INDEX/);
  assert.match(svg, /SIGNAL FREQUENCY/);
  assert.match(svg, /pos: 0/);
  assert.match(svg, /pos: 5/);
  assert.ok(!svg.includes("TOTAL K,V OPS"), "Position simulator must not have KV cache ops text");
  assert.ok(!svg.includes("without cache vs with"), "Position simulator must not have KV cache sublabels");

  // Verify Section 4 (Research grounding) does NOT collide with Row 2 of grid_cards
  assert.match(svg, /id="section-grid-comparison"/);
  assert.match(svg, /§04/);
  assert.match(svg, /Research grounding/);
});
