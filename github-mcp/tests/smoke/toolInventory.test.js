import { describe, expect, it } from 'vitest';
import { repoTools } from '../../src/tools/repos/index.js';
import { searchTools } from '../../src/tools/search/index.js';
import { issueTools } from '../../src/tools/issues/index.js';
import { pullTools } from '../../src/tools/pulls/index.js';
import { fileTools } from '../../src/tools/files/index.js';
import { actionTools } from '../../src/tools/actions/index.js';
import { releaseTools } from '../../src/tools/releases/index.js';
import { orgTools } from '../../src/tools/orgs/index.js';
import { discussionTools } from '../../src/tools/discussions/index.js';
import { projectTools } from '../../src/tools/projects/index.js';
import { diagnosticTools } from '../../src/tools/diagnostics/index.js';
const allTools = [
    ...repoTools,
    ...searchTools,
    ...issueTools,
    ...pullTools,
    ...fileTools,
    ...actionTools,
    ...releaseTools,
    ...orgTools,
    ...discussionTools,
    ...projectTools,
    ...diagnosticTools
];
describe('tool inventory', () => {
    it('registers a broad set of tools', () => {
        expect(allTools.length).toBeGreaterThanOrEqual(55);
    });
    it('uses github_ prefix consistently', () => {
        for (const tool of allTools) {
            expect(tool.name.startsWith('github_')).toBe(true);
        }
    });
});
//# sourceMappingURL=toolInventory.test.js.map