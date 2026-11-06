import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { accountRouter } from './account.routes.js';
import { commonRouter } from './common.routes.js';
import { dashboardRouter } from './dashboard.routes.js';
import { userRouter } from './user.routes.js';
import { roleRouter } from './role.routes.js';
import { rolePermissionRouter } from './role-permission.routes.js';
import { blogCategoryRouter } from './blog-category.routes.js';
import { blogRouter } from './blog.routes.js';
import { caseStudyRouter } from './case-study.routes.js';
import { announcementRouter } from './announcement.routes.js';
import { siteSettingRouter } from './site-setting.routes.js';
import {
  certificationRouter,
  faqRouter,
  galleryImageRouter,
  heroSlideRouter,
  keyStatRouter,
  partnerLogoRouter,
  teamMemberRouter,
  testimonialRouter,
  timelineEventRouter,
} from './website-content.routes.js';
import { aclGateway, authenticate } from '../../../middlewares/index.js';

const router = Router();

// Public Route
router.use('/auth', authRouter);

// Private Route — every route below needs a logged-in user; the gateway then checks the role's permissions
router.use(authenticate);
router.use(aclGateway);
router.use('/account', accountRouter);
router.use('/common', commonRouter);
router.use('/dashboard', dashboardRouter);
router.use('/user', userRouter);
router.use('/role', roleRouter);
router.use('/role-permission', rolePermissionRouter);
router.use('/blog-category', blogCategoryRouter);
router.use('/blog', blogRouter);
router.use('/case-study', caseStudyRouter);
router.use('/announcement', announcementRouter);
router.use('/site-setting', siteSettingRouter);
router.use('/hero-slide', heroSlideRouter);
router.use('/testimonial', testimonialRouter);
router.use('/faq', faqRouter);
router.use('/partner-logo', partnerLogoRouter);
router.use('/team-member', teamMemberRouter);
router.use('/timeline-event', timelineEventRouter);
router.use('/certification', certificationRouter);
router.use('/key-stat', keyStatRouter);
router.use('/gallery-image', galleryImageRouter);

export const clientRouter = router;
