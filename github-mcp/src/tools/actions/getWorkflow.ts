import { ownerRepoSchema } from '../../schemas/common.js';
import { workflowIdSchema } from '../../schemas/github.js';
import type { GithubTool } from '../../types/tool.js';
import { guardRepo } from '../common.js';
import { result } from '../../utils/result.js';

const schema = ownerRepoSchema.extend({ workflow_id: workflowIdSchema });

export const getWorkflowTool: GithubTool<typeof schema> = {
  name: 'github_get_workflow',
  description: 'Get details for a workflow by ID or file name.',
  inputSchema: schema,
  execute: async (ctx, input) => {
    guardRepo(ctx, input.owner, input.repo);
    const { data } = await ctx.octokit.rest.actions.getWorkflow(input);
    return result(`Workflow '${data.name}' loaded`, {
      id: data.id,
      name: data.name,
      state: data.state,
      path: data.path,
      html_url: data.html_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }
};
