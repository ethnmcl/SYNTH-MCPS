import { listIssuesTool } from './listIssues.js';
import { getIssueTool } from './getIssue.js';
import { createIssueTool } from './createIssue.js';
import { updateIssueTool } from './updateIssue.js';
import { closeIssueTool } from './closeIssue.js';
import { reopenIssueTool } from './reopenIssue.js';
import { addIssueCommentTool } from './addIssueComment.js';
import { listIssueCommentsTool } from './listIssueComments.js';
import { addLabelsToIssueTool } from './addLabelsToIssue.js';
import { removeLabelFromIssueTool } from './removeLabelFromIssue.js';
import { assignIssueTool } from './assignIssue.js';
import { unassignIssueTool } from './unassignIssue.js';

export const issueTools = [
  listIssuesTool,
  getIssueTool,
  createIssueTool,
  updateIssueTool,
  closeIssueTool,
  reopenIssueTool,
  addIssueCommentTool,
  listIssueCommentsTool,
  addLabelsToIssueTool,
  removeLabelFromIssueTool,
  assignIssueTool,
  unassignIssueTool
];
