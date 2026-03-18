import { listPullRequestsTool } from './listPullRequests.js';
import { getPullRequestTool } from './getPullRequest.js';
import { createPullRequestTool } from './createPullRequest.js';
import { updatePullRequestTool } from './updatePullRequest.js';
import { mergePullRequestTool } from './mergePullRequest.js';
import { closePullRequestTool } from './closePullRequest.js';
import { reopenPullRequestTool } from './reopenPullRequest.js';
import { requestReviewersTool } from './requestReviewers.js';
import { submitPullRequestReviewCommentTool } from './submitPullRequestReviewComment.js';
import { listPullRequestFilesTool } from './listPullRequestFiles.js';
import { listPullRequestCommitsTool } from './listPullRequestCommits.js';
import { getPullRequestDiffTool } from './getPullRequestDiff.js';

export const pullTools = [
  listPullRequestsTool,
  getPullRequestTool,
  createPullRequestTool,
  updatePullRequestTool,
  mergePullRequestTool,
  closePullRequestTool,
  reopenPullRequestTool,
  requestReviewersTool,
  submitPullRequestReviewCommentTool,
  listPullRequestFilesTool,
  listPullRequestCommitsTool,
  getPullRequestDiffTool
];
