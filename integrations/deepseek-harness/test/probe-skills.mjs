import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

export const name = 'diagramify-dsh-skill-probe';
export const inject = ['skills'];

export async function waitForDiagramify(skills, cwd, {
  timeoutMs = 30_000,
  pollMs = 100,
  sleep = delay,
} = {}) {
  const deadline = Date.now() + timeoutMs;
  let list = [];
  do {
    list = await skills.list({ cwd });
    const diagramify = list.find((skill) => skill.name === 'diagramify');
    if (diagramify) return { list, diagramify };
    if (Date.now() >= deadline) break;
    await sleep(pollMs);
  } while (true);
  return { list, diagramify: undefined };
}

export async function apply(ctx) {
  const out = process.env.DIAGRAMIFY_DSH_PROBE_OUT;
  if (!out) throw new Error('DIAGRAMIFY_DSH_PROBE_OUT is required for the test-only skill probe');
  const cwd = process.cwd();
  const { list, diagramify } = await waitForDiagramify(ctx.skills, cwd);
  const definition = diagramify ? await ctx.skills.get('diagramify', { cwd }) : null;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify({
    skills: list.map((skill) => ({
      name: skill.name,
      provider: skill.provider,
      resourceBase: skill.resourceBase,
      path: skill.path,
    })),
    definition: definition && {
      name: definition.name,
      provider: definition.provider,
      resourceBase: definition.resourceBase,
      path: definition.path,
      contentLength: definition.content?.length || 0,
    },
  }, null, 2)}\n`);
  const exit = ctx.cmdlineArgs?.exit || ctx.appExit;
  if (typeof exit === 'function') exit(0);
}
