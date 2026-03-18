import { getRepoTool } from './getRepo.js';
import { listUserReposTool } from './listUserRepos.js';
import { listOrgReposTool } from './listOrgRepos.js';
import { listRepoBranchesTool } from './listRepoBranches.js';
import { listRepoTagsTool } from './listRepoTags.js';
import { getRepoContentsTool } from './getRepoContents.js';
import { getDirectoryContentsTool } from './getDirectoryContents.js';
import { readFileTool } from './readFile.js';
import { getCommitTool } from './getCommit.js';
import { compareCommitsTool } from './compareCommits.js';
import { getDefaultBranchTool } from './getDefaultBranch.js';

export const repoTools = [
  getRepoTool,
  listUserReposTool,
  listOrgReposTool,
  listRepoBranchesTool,
  listRepoTagsTool,
  getRepoContentsTool,
  getDirectoryContentsTool,
  readFileTool,
  getCommitTool,
  compareCommitsTool,
  getDefaultBranchTool
];
