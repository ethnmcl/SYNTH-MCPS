import { z } from 'zod';
import { ownerRepoSchema } from '../../schemas/common.js';
import { issueNumberSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo, guardWrite } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({
  issue_number: issueNumberSchema,
  assignees: z.array(z.string()).min(1)
});

export const assignIssueTool: GithubTool<typeof schema> = {
  name: 'github_assign_issue',
  description: 'Assign users to an issue.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardWrite(ctx);
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.issues.addAssignees(input);
    return result(`Assigned users to issue #${input.issue_number}`, {
      issue_number: data.number,
      assignees: data.assignees?.map((a) => a.login) ?? []
    });
  }
};
