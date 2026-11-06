import { Router } from 'express';
import { siteSettingController } from '../../../controller/index.js';
import { updateSiteSettingValidation } from '../../../middlewares/index.js';

const router = Router();

router.get('/', siteSettingController.getHandler);
router.put('/', updateSiteSettingValidation, siteSettingController.updateHandler);

export const siteSettingRouter = router;
