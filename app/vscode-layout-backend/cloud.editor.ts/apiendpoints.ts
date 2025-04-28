// src/routes/syncRoutes.ts
import express from 'express';
import { CloudSyncService } from '../services/CloudSyncService';

const router = express.Router();
const cloudSync = new CloudSyncService();

router.post('/start-sync', (req, res) => {
  const { projectId, sessionId } = req.body;
  cloudSync.startSyncSession(projectId, sessionId);
  res.json({ success: true });
});

router.get('/sync-state/:projectId', (req, res) => {
  const state = cloudSync.getProjectState(req.params.projectId);
  res.json(state || { error: 'Project not found' });
});

router.post('/push-change', async (req, res) => {
  const { projectId, filePath, content } = req.body;
  await FileService.writeFile(filePath, content);
  res.json({ success: true });
});

export default router;