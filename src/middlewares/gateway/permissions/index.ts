import { dashboardPermissions } from "./dashboard/index.js";
import { blogPermissions } from "./blog/index.js";
import { blogCategoryPermissions } from "./blog-category/index.js";
import { caseStudyPermissions } from "./case-study/index.js";
import { announcementPermissions } from "./announcement/index.js";
import {
    heroSlidePermissions,
    testimonialPermissions,
    faqPermissions,
    partnerLogoPermissions,
    teamMemberPermissions,
    timelineEventPermissions,
    certificationPermissions,
    keyStatPermissions,
    galleryImagePermissions,
} from "./website-content/index.js";
import { siteSettingPermissions } from "./site-setting/index.js";
import { userPermissions } from "./user/index.js";
import { rolePermissions } from "./role/index.js";
import { rolePermissionPermissions } from "./role-permission/index.js";

const aclGatewayPermissions = {
    dashboard: dashboardPermissions,
    blog: blogPermissions,
    'blog-category': blogCategoryPermissions,
    'case-study': caseStudyPermissions,
    announcement: announcementPermissions,
    'hero-slide': heroSlidePermissions,
    testimonial: testimonialPermissions,
    faq: faqPermissions,
    'partner-logo': partnerLogoPermissions,
    'team-member': teamMemberPermissions,
    'timeline-event': timelineEventPermissions,
    certification: certificationPermissions,
    'key-stat': keyStatPermissions,
    'gallery-image': galleryImagePermissions,
    'site-setting': siteSettingPermissions,
    user: userPermissions,
    role: rolePermissions,
    'role-permission': rolePermissionPermissions,
};

export { aclGatewayPermissions };
