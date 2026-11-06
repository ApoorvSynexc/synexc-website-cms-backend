const crud = (subject: string) => ['read', 'create', 'update', 'delete'].map((a) => `${a}:${subject}`);

/**
 * Starter roles. "Admin" is a system role: it always receives every permission and cannot be edited.
 * Permission strings are "<action>:<subject>".
 */
export const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full access to everything.',
    isSystem: true,
    permissions: [] as string[], // all permissions are granted by the seed
  },
  {
    name: 'Editor',
    description: 'Manages blogs, case studies, announcements and website content.',
    isSystem: false,
    permissions: [
      'read:dashboard',
      ...['blog', 'blog_category', 'case_study', 'announcement', 'hero_slide', 'testimonial', 'faq', 'partner_logo', 'team_member', 'timeline_event', 'certification', 'key_stat', 'gallery_image'].flatMap(crud),
    ],
  },
  {
    name: 'Writer',
    description: 'Writes and edits blogs, cannot delete.',
    isSystem: false,
    permissions: ['read:dashboard', 'read:blog', 'create:blog', 'update:blog', 'read:blog_category'],
  },
] as const;
