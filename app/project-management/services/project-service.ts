import fs from 'fs/promises';
import path from 'path';

const PROJECTS_ROOT = path.resolve(__dirname, '../../projects');

export async function getProjectList(): Promise<string[]> {
  const dirs = await fs.readdir(PROJECTS_ROOT, { withFileTypes: true });
  return dirs.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
}