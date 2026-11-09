import { Router } from 'express';
import { blogController } from '../../../controller/index.js';
import { createBlogValidation, listBlogsValidation, updateBlogValidation } from '../../../middlewares/index.js';

const router = Router();

router.post('/', createBlogValidation, blogController.createHandler);
router.get('/list', listBlogsValidation, blogController.findBlogsHandler);
router.get('/stats', blogController.statsHandler);
router.get('/', blogController.findBlogHandler);
router.put('/', updateBlogValidation, blogController.updateHandler);
router.delete('/', blogController.deleteHandler);

export const blogRouter = router;
