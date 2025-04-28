import { Request, Response } from 'express';
import { startTerminalSession } from '../services/terminalService';

export async function createTerminalSession(req: Request, res: Response) {
  try {
    const terminal = startTerminalSession();
    res.json({ pid: terminal.pid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start terminal' });
  }
}