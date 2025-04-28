import { Request, Response } from 'express';
import * as fileService from '../services/fileService';

export async function openFile(req: Request, res: Response) {
  const { filePath } = req.body;
  try {
    const content = await fileService.readFile(filePath);
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to open file' });
  }
}

export async function saveFile(req: Request, res: Response) {
  const { filePath, content } = req.body;
  try {
    await fileService.writeFile(filePath, content);
    res.json({ message: 'File saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save file' });
  }
}