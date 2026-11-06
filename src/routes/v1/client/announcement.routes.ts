import { Router } from 'express';
import { announcementController } from '../../../controller/index.js';
import {
  createAnnouncementValidation,
  listAnnouncementsValidation,
  updateAnnouncementValidation,
} from '../../../middlewares/index.js';

const router = Router();

router.post('/', createAnnouncementValidation, announcementController.createHandler);
router.get('/list', listAnnouncementsValidation, announcementController.findAnnouncementsHandler);
router.get('/', announcementController.findAnnouncementHandler);
router.put('/', updateAnnouncementValidation, announcementController.updateHandler);
router.delete('/', announcementController.deleteHandler);

export const announcementRouter = router;
