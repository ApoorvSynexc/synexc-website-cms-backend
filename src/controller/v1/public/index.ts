import { publicBlogController } from './blog/index.js';
import { publicCaseStudyController } from './case-study/index.js';
import { publicAnnouncementController } from './announcement/index.js';
import { publicSiteSettingController } from './site-setting/index.js';
import { publicWebsiteContentController } from './website-content/index.js';

/**
 * Read-only endpoints for the public website, one folder per module (same layout as `client/`).
 * The router uses them as one flat object: `publicController.blogList`, `publicController.faqList`, …
 */
export const publicController = {
  ...publicBlogController,
  ...publicCaseStudyController,
  ...publicAnnouncementController,
  ...publicSiteSettingController,
  ...publicWebsiteContentController,
};
