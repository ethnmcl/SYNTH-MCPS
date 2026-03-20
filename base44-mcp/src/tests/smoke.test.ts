import { describe, expect, it } from 'vitest';
import { createServer } from '../server.js';
import { allTools } from '../tools/index.js';

describe('smoke', () => {
  it('creates MCP server and includes 56 tools', () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(allTools).toHaveLength(56);
  });
});
