import { Router } from 'express';
import { userController } from '../../../controller/index.js';
import { createUserValidation, listUsersValidation, updateUserValidation } from '../../../middlewares/index.js';

const router = Router();

router.post('/', createUserValidation, userController.createHandler);
router.get('/list', listUsersValidation, userController.findUsersHandler);
router.get('/', userController.findUserHandler);
router.put('/', updateUserValidation, userController.updateHandler);
router.delete('/', userController.deleteHandler);

export const userRouter = router;
