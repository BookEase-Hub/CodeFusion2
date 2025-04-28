import { Router } from 'express';
import { listProjects } from '../controllers/projectController';

const router = Router();

router.get('/list', listProjects);

export default router;