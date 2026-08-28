import assert from 'node:assert/strict';
import test from 'node:test';
import { waitForDiagramify } from './probe-skills.mjs';

test('skill probe waits for a provider that registers during DSH boot', async () => {
  let calls = 0;
  const diagramify = { name: 'diagramify', provider: 'diagramify-plugin' };
  const skills = {
    async list() {
      calls += 1;
      return calls < 3 ? [] : [diagramify];
    },
  };
  const result = await waitForDiagramify(skills, '/workspace', {
    timeoutMs: 1_000,
    sleep: async () => {},
  });
  assert.equal(calls, 3);
  assert.equal(result.diagramify, diagramify);
  assert.deepEqual(result.list, [diagramify]);
});
