import { Router } from 'express';
import { makeResponse } from '../../lib/index.js';
import { publicRouter } from './public/index.js';
import { clientRouter } from './client/index.js';

const router = Router();

// Public Route
router.get('/health', (req, res) => makeResponse(req, res, 200, true, 'health_check'));
router.use('/public', publicRouter);

// Private Route (/auth is public; everything after it needs login + permission)
router.use('/', clientRouter);

export const v1Routers = router;
