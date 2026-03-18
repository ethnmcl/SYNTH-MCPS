import { listReleasesTool } from './listReleases.js';
import { getReleaseTool } from './getRelease.js';
import { createReleaseTool } from './createRelease.js';
import { updateReleaseTool } from './updateRelease.js';

export const releaseTools = [listReleasesTool, getReleaseTool, createReleaseTool, updateReleaseTool];
