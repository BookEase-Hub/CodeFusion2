import { Router } from 'express';
import { createTerminalSession } from '../controllers/terminalController';

const router = Router();

router.post('/start', createTerminalSession);

export default router;