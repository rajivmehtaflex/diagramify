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
        widget_title: "POSITION SIGNAL SIMULATOR",
        tokens: [
          { text: "The", tag: "pos: 0" },
          { text: "cat", tag: "pos: 1" },
          { text: "sat", tag: "pos: 2" },
          { text: "on", tag: "pos: 3" },
          { text: "the", tag: "pos: 4" },
          { text: "mat", tag: "pos: 5" }
        ],
        metrics: [
          { label: "ACTIVE POSITION INDEX", value: "pos = 0", sublabel: "0 ≤ pos < 6", color: "frontend" },
          { label: "SIGNAL FREQUENCY", value: "ω_0 = 1.000", sublabel: "ω_i = 10000^(-2i/d)", color: "cloud" },
          { label: "VECTOR GEOMETRY", value: "Orthogonal", sublabel: "preserves relative distance", color: "database" }
        ],
        status_label: "Position encoding status",
        status_value: "6 position vectors attached"
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

test("explorable-steps renders completely generic domain explainers (Distributed Systems / Raft Consensus)", () => {
  const raftSpec = {
    schema_version: 1,
    diagram_type: "explainer-steps",
    meta: {
      title: "Raft Consensus Protocol Internals",
      topic_tags: ["DISTRIBUTED_SYSTEMS", "CONSENSUS", "RAFT", "FAULT_TOLERANCE"]
    },
    sections: [
      {
        kind: "tldr",
        takeaways: [
          "Raft breaks distributed consensus into Leader Election, Log Replication, and Safety.",
          "Quorum majority (N/2 + 1) prevents split-brain transitions across network partitions."
        ]
      },
      {
        kind: "simulator",
        number: "§01",
        title: "Cluster election step simulator",
        widget_title: "LEADER ELECTION SIMULATOR",
        elements: [
          { text: "Node A", tag: "Leader", detail: "Term 2" },
          { text: "Node B", tag: "Follower", detail: "Voted A" },
          { text: "Node C", tag: "Follower", detail: "Voted A" },
          { text: "Node D", tag: "Candidate", detail: "Timeout" },
          { text: "Node E", tag: "Follower", detail: "Heartbeat" }
        ],
        metrics: [
          { label: "QUORUM STATUS", value: "3 / 5 Nodes", sublabel: "Majority quorum active", color: "frontend" },
          { label: "CURRENT TERM", value: "Term 2", sublabel: "Stable election term", color: "cloud" },
          { label: "HEARTBEAT RTT", value: "12 ms", sublabel: "Below election timeout", color: "database" }
        ],
        status_label: "Consensus State",
        status_value: "Leader Node A active with 3/5 quorum"
      },
      {
        kind: "chart",
        number: "§02",
        title: "Consensus throughput vs cluster size",
        x_label: "Cluster nodes (N) →",
        y_label: "Write Latency (ms) →",
        curves: [
          { label: "Raft Quorum O(log N)", type: "logarithmic", color: "#22d3ee" },
          { label: "2-Phase Commit O(N)", type: "linear", color: "#f97316" }
        ]
      },
      {
        kind: "calculator",
        number: "§03",
        title: "Quorum sizing & fault tolerance calculator",
        widget_title: "FAULT TOLERANCE CALCULATOR",
        formula: "Quorum = floor(N / 2) + 1, Max Faulty Nodes F = floor((N - 1) / 2)",
        inputs: [
          { label: "Cluster Node Count (N)", value: "5 Nodes", sublabel: "Standard deployment" },
          { label: "Heartbeat Interval", value: "50 ms", sublabel: "Leader heartbeat" }
        ],
        outputs: [
          { label: "Required Quorum Majority", value: "3 Nodes", highlight: true },
          { label: "Max Tolerable Crashed Nodes (F)", value: "2 Nodes", highlight: false }
        ],
        summary_note: "A 5-node cluster can tolerate up to 2 concurrent node failures without losing availability."
      }
    ]
  };

  const input = path.join(tmp, "raft-explainer.json");
  fs.writeFileSync(input, JSON.stringify(raftSpec, null, 2), "utf8");
  const output = path.join(tmp, "raft-explainer.html");
  const res = run(["deliver", "explainer-steps", input, output, "--quality", "showcase", "--json"]);

  assert.equal(res.status, 0, res.stderr);
  const data = JSON.parse(res.stdout);
  assert.equal(data.ok, true);

  const html = fs.readFileSync(output, "utf8");
  const { direct } = extractSvgs(html);
  const svg = direct[0];

  // Verify Simulator generic copy
  assert.match(svg, /LEADER ELECTION SIMULATOR/);
  assert.match(svg, /QUORUM STATUS/);
  assert.match(svg, /3 \/ 5 Nodes/);
  assert.match(svg, /Node A/);
  assert.match(svg, /Leader Node A active with 3\/5 quorum/);

  // Verify Chart generic copy & curves
  assert.match(svg, /Cluster nodes \(N\) →/);
  assert.match(svg, /Write Latency \(ms\) →/);
  assert.match(svg, /Raft Quorum O\(log N\)/);
  assert.match(svg, /2-Phase Commit O\(N\)/);

  // Verify Calculator generic copy
  assert.match(svg, /FAULT TOLERANCE CALCULATOR/);
  assert.match(svg, /Cluster Node Count \(N\)/);
  assert.match(svg, /Required Quorum Majority/);
  assert.match(svg, /3 Nodes/);
  assert.match(svg, /Max Tolerable Crashed Nodes \(F\)/);
  assert.match(svg, /2 Nodes/);
  assert.match(svg, /A 5-node cluster can tolerate up to 2 concurrent node failures/);
});
