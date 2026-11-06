import { Router } from 'express';
import { caseStudyController } from '../../../controller/index.js';
import {
  createCaseStudyValidation,
  listCaseStudiesValidation,
  updateCaseStudyValidation,
} from '../../../middlewares/index.js';

const router = Router();

router.post('/', createCaseStudyValidation, caseStudyController.createHandler);
router.get('/list', listCaseStudiesValidation, caseStudyController.findCaseStudiesHandler);
router.get('/', caseStudyController.findCaseStudyHandler);
router.put('/', updateCaseStudyValidation, caseStudyController.updateHandler);
router.delete('/', caseStudyController.deleteHandler);

export const caseStudyRouter = router;
