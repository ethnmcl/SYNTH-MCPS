import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  issue_number: issueNumberSchema,
  labels: z.array(z.string()).min(1)
});

export const addLabelsToIssueTool: GithubTool<typeof schema> = {
  name: 'github_add_labels_to_issue',
  description: 'Add labels to an issue.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.addLabels(input);
    return result(`Added labels to issue #${input.issue_number}`, {
      labels: data.map((l) => l.name)
    });
  }
};
