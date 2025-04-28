// src/routes/voiceRoutes.ts
import express from 'express';
import { VoiceProcessor } from '../services/VoiceProcessor';

const router = express.Router();
const voiceProcessor = new VoiceProcessor();

router.post('/process-voice', async (req, res) => {
  try {
    const { transcript, sessionId } = req.body;
    const result = await voiceProcessor.processTranscript(transcript, { sessionId });
    res.json({ success: true, result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;