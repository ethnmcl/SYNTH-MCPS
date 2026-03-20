import { resolve } from 'node:path';

export const resolveProjectPath = (rootDir: string, relativePath: string): string => {
  return resolve(rootDir, relativePath);
};
