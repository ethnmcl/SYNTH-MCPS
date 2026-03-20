import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export class LocalProjectClient {
  constructor(private readonly rootDir = process.cwd()) {}

  resolvePath(relativePath: string): string {
    return resolve(this.rootDir, relativePath);
  }

  async readProjectFile(pathValue: string): Promise<string> {
    return readFile(this.resolvePath(pathValue), 'utf-8');
  }

  async writeProjectFile(pathValue: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(pathValue);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content, 'utf-8');
  }

  async listProjectFiles(pathValue: string): Promise<string[]> {
    return readdir(this.resolvePath(pathValue));
  }

  async exists(pathValue: string): Promise<boolean> {
    try {
      await stat(this.resolvePath(pathValue));
      return true;
    } catch {
      return false;
    }
  }
}
