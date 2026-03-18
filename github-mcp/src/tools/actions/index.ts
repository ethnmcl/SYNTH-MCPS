import { listWorkflowsTool } from './listWorkflows.js';
import { getWorkflowTool } from './getWorkflow.js';
import { listWorkflowRunsTool } from './listWorkflowRuns.js';
import { getWorkflowRunTool } from './getWorkflowRun.js';
import { rerunWorkflowTool } from './rerunWorkflow.js';
import { cancelWorkflowRunTool } from './cancelWorkflowRun.js';
import { dispatchWorkflowTool } from './dispatchWorkflow.js';
import { getWorkflowRunLogsInfoTool } from './getWorkflowRunLogsInfo.js';

export const actionTools = [
  listWorkflowsTool,
  getWorkflowTool,
  listWorkflowRunsTool,
  getWorkflowRunTool,
  rerunWorkflowTool,
  cancelWorkflowRunTool,
  dispatchWorkflowTool,
  getWorkflowRunLogsInfoTool
];
