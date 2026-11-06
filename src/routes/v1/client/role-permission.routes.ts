import { Router } from 'express';
import { rolePermissionController } from '../../../controller/index.js';
import { updateRolePermissionsValidation } from '../../../middlewares/index.js';

const router = Router();

router.get('/permissions', rolePermissionController.findPermissionsHandler);
router.get('/list', rolePermissionController.findRolePermissionsHandler);
router.put('/', updateRolePermissionsValidation, rolePermissionController.updateHandler);

export const rolePermissionRouter = router;
