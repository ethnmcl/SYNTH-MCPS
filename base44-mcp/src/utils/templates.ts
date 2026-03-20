import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(currentDir, '..', 'templates', 'base44');

export const readTemplate = async (name: string): Promise<string> => {
  return readFile(join(templatesDir, name), 'utf-8');
};
