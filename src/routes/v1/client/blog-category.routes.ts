import { Router } from 'express';
import { blogCategoryController } from '../../../controller/index.js';
import { createBlogCategoryValidation, updateBlogCategoryValidation } from '../../../middlewares/index.js';

const router = Router();

router.post('/', createBlogCategoryValidation, blogCategoryController.createHandler);
router.get('/list', blogCategoryController.findCategoriesHandler);
router.get('/', blogCategoryController.findCategoryHandler);
router.put('/', updateBlogCategoryValidation, blogCategoryController.updateHandler);
router.delete('/', blogCategoryController.deleteHandler);

export const blogCategoryRouter = router;
