/**
 * Every module in the CMS permission matrix and the actions that exist for it.
 * Keep in sync with the PermissionSubject enum in prisma/schema.prisma and with the frontend matrix.
 */
const CRUD = ['read', 'create', 'update', 'delete'] as const;

export const SUBJECT_ACTIONS: Record<string, readonly string[]> = {
  dashboard: ['read'],
  blog: CRUD,
  blog_category: CRUD,
  case_study: CRUD,
  announcement: CRUD,
  hero_slide: CRUD,
  testimonial: CRUD,
  faq: CRUD,
  partner_logo: CRUD,
  team_member: CRUD,
  timeline_event: CRUD,
  certification: CRUD,
  key_stat: CRUD,
  gallery_image: CRUD,
  site_settings: ['read', 'update'],
  user: CRUD,
  role: CRUD,
  role_permission: ['read', 'update'],
};

export const DEFAULT_PERMISSIONS = Object.entries(SUBJECT_ACTIONS).flatMap(([subject, actions]) =>
  actions.map((action) => ({ subject, action })),
);
