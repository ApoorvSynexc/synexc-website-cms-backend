import { Router } from 'express';
import { accountController } from '../../../controller/index.js';
import { changePasswordValidation, updateProfileValidation } from '../../../middlewares/index.js';

const router = Router();

router.get('/my-profile', accountController.getProfile);
router.put('/my-profile', updateProfileValidation, accountController.updateProfile);
router.put('/change-password', changePasswordValidation, accountController.changePassword);

export const accountRouter = router;
