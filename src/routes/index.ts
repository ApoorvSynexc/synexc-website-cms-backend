import { Router } from 'express';
import { v1Routers } from './v1/index.js';

const router = Router();

router.use('/v1', v1Routers);

export { router };
