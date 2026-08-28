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
