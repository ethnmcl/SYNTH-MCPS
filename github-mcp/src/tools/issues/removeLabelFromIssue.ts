import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  issue_number: issueNumberSchema,
  name: z.string().min(1)
});

export const removeLabelFromIssueTool: GithubTool<typeof schema> = {
  name: 'github_remove_label_from_issue',
  description: 'Remove a label from an issue.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    await ctx.octokit.rest.issues.removeLabel({
      owner: input.owner,
      repo: input.repo,
      issue_number: input.issue_number,
      name: input.name
    });
    return result(`Removed label '${input.name}' from issue #${input.issue_number}`, {
      issue_number: input.issue_number,
      removed_label: input.name
    });
  }
};
