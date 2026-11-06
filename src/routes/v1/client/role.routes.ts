import { Router } from 'express';
import { roleController } from '../../../controller/index.js';
import { createRoleValidation, updateRoleValidation } from '../../../middlewares/index.js';

const router = Router();

router.post('/', createRoleValidation, roleController.createHandler);
router.get('/list', roleController.findRolesHandler);
router.get('/', roleController.findRoleHandler);
router.put('/', updateRoleValidation, roleController.updateHandler);
router.delete('/', roleController.deleteHandler);

export const roleRouter = router;
