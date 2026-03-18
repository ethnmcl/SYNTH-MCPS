import { describe, expect, it } from 'vitest';
import { ensureOwnerRepoAllowed, ensureWriteAllowed } from '../../src/github/permissions.js';
import type { AppEnv } from '../../src/config/env.js';

const baseEnv: AppEnv = {
  githubToken: undefined,
  githubApiUrl: 'https://api.github.com',
  githubUserAgent: 'github-mcp',
  mcpTransport: 'stdio',
  port: 8787,
  githubReadOnly: false,
  allowedOwners: [],
  allowedRepos: []
};

describe('permissions', () => {
  it('allows unrestricted owner/repo when allowlists are empty', () => {
    expect(() => ensureOwnerRepoAllowed(baseEnv, 'octocat', 'hello-world')).not.toThrow();
  });

  it('blocks disallowed owner', () => {
    const env = { ...baseEnv, allowedOwners: ['my-org'] };
    expect(() => ensureOwnerRepoAllowed(env, 'other-org', 'repo')).toThrow(/allowlist/);
  });

  it('blocks writes in read-only mode', () => {
    const env = { ...baseEnv, githubReadOnly: true };
    expect(() => ensureWriteAllowed(env)).toThrow(/READ_ONLY/);
  });
});
