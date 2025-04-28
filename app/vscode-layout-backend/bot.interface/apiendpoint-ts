// src/routes/botRoutes.ts
import express from 'express';
import { BotEngine } from '../services/BotEngine';

const router = express.Router();
const botEngine = new BotEngine();

router.post('/bot-command', async (req, res) => {
  try {
    const { query, sessionId } = req.body;
    const result = await botEngine.processQuery(query);
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;