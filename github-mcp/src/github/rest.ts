import type { Octokit } from '@octokit/rest';

export const rest = (octokit: Octokit): Octokit['rest'] => octokit.rest;
