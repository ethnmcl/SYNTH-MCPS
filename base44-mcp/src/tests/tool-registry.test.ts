import { describe, expect, it } from 'vitest';
import { allTools } from '../tools/index.js';

describe('tool registry', () => {
  it('has unique names', () => {
    const names = allTools.map((tool) => tool.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('contains all expected 56 tools', () => {
    expect(allTools).toHaveLength(56);
  });
});
