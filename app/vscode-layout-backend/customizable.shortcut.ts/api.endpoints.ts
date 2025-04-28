// src/routes/shortcutRoutes.ts
import express from 'express';
import { ShortcutManager } from '../services/ShortcutManager';

const router = express.Router();
const shortcutManager = new ShortcutManager();

router.post('/set-shortcut', (req, res) => {
  const { userId, shortcut, command } = req.body;
  shortcutManager.setShortcut(userId, shortcut, command);
  res.json({ success: true });
});

router.get('/get-shortcuts/:userId', (req, res) => {
  const shortcuts = shortcutManager.getUserShortcuts(req.params.userId);
  res.json(shortcuts);
});

export default router;