import { Router } from 'express';
import { authController } from '../../../controller/index.js';
import {
  authenticate,
  loginValidation,
  logoutValidation,
  refreshTokenValidation,
} from '../../../middlewares/index.js';

const router = Router();

router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', refreshTokenValidation, authController.refreshToken);
router.post('/logout', authenticate, logoutValidation, authController.logout);

export const authRouter = router;
