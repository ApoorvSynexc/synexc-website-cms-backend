import { Router } from 'express';
import { commonController } from '../../../controller/index.js';
import { uploadMiddleware } from '../../../services/index.js';

const router = Router();

router.post('/upload', uploadMiddleware.array('files', 10), commonController.uploadFile);

export const commonRouter = router;
