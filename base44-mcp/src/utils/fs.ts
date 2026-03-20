import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const ensureDir = async (dirPath: string): Promise<void> => {
  await mkdir(dirPath, { recursive: true });
};

export const readTextFile = async (filePath: string): Promise<string> => {
  return readFile(filePath, 'utf-8');
};

export const writeTextFile = async (filePath: string, content: string): Promise<void> => {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
};

export const listDir = async (dirPath: string): Promise<string[]> => {
  return readdir(dirPath);
};

export const exists = async (pathValue: string): Promise<boolean> => {
  try {
    await stat(pathValue);
    return true;
  } catch {
    return false;
  }
};
