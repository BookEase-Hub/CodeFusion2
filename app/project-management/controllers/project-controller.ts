import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

export async function listProjects(req: Request, res: Response) {
  try {
    const projects = await projectService.getProjectList();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list projects' });
  }
}