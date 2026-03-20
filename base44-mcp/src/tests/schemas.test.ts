import { describe, expect, it } from 'vitest';
import { createProjectInputSchema, deleteProjectInputSchema } from '../schemas/projects.js';

describe('schemas', () => {
  it('validates create project schema', () => {
    const parsed = createProjectInputSchema.parse({ name: 'Demo', description: 'hello' });
    expect(parsed.name).toBe('Demo');
  });

  it('accepts destructive confirmation in delete project payload', () => {
    const parsed = deleteProjectInputSchema.parse({ projectId: 'proj_1', confirmDangerous: true });
    expect(parsed.projectId).toBe('proj_1');
  });
});
