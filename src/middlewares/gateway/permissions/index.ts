/**
 * Permission table for the gateway: which "<action>:<subject>" grants unlock which route.
 * A rule matches on exact path + HTTP method; the user needs ANY ONE of its permissions.
 *
 * Same idea as the per-module permission files in the HRM backend, generated here because every Synexc
 * module has the same five routes (create / list / get / update / delete).
 */
type PermissionRule = { path: string; method: string; permissions: string[] };

const crud = (path: string, subject: string): PermissionRule[] => [
  { path, method: 'POST', permissions: [`create:${subject}`] },
  { path: `${path}/list`, method: 'GET', permissions: [`read:${subject}`] },
  { path, method: 'GET', permissions: [`read:${subject}`] },
  { path, method: 'PUT', permissions: [`update:${subject}`] },
  { path, method: 'DELETE', permissions: [`delete:${subject}`] },
];

/** Ordered website lists also let you swap an item with its neighbour. */
const orderedList = (path: string, subject: string): PermissionRule[] => [
  ...crud(path, subject),
  { path: `${path}/move`, method: 'PUT', permissions: [`update:${subject}`] },
];

const aclGatewayPermissions: Record<string, PermissionRule[]> = {
  dashboard: [{ path: '/dashboard/stats', method: 'GET', permissions: ['read:dashboard'] }],

  blog: crud('/blog', 'blog'),
  // Writers need categories to fill in the blog form, so blog permissions unlock the category list too.
  'blog-category': [
    ...crud('/blog-category', 'blog_category').filter((r) => r.path !== '/blog-category/list'),
    {
      path: '/blog-category/list',
      method: 'GET',
      permissions: ['read:blog_category', 'create:blog', 'update:blog', 'read:blog'],
    },
  ],
  'case-study': crud('/case-study', 'case_study'),
  announcement: crud('/announcement', 'announcement'),

  'hero-slide': orderedList('/hero-slide', 'hero_slide'),
  testimonial: orderedList('/testimonial', 'testimonial'),
  faq: orderedList('/faq', 'faq'),
  'partner-logo': orderedList('/partner-logo', 'partner_logo'),
  'team-member': orderedList('/team-member', 'team_member'),
  'timeline-event': orderedList('/timeline-event', 'timeline_event'),
  certification: orderedList('/certification', 'certification'),
  'key-stat': orderedList('/key-stat', 'key_stat'),
  'gallery-image': orderedList('/gallery-image', 'gallery_image'),

  'site-setting': [
    { path: '/site-setting', method: 'GET', permissions: ['read:site_settings'] },
    { path: '/site-setting', method: 'PUT', permissions: ['update:site_settings'] },
  ],

  user: crud('/user', 'user'),
  role: [
    ...crud('/role', 'role').filter((r) => r.path !== '/role/list'),
    // The user form needs the role list to pick a role.
    { path: '/role/list', method: 'GET', permissions: ['read:role', 'create:user', 'update:user', 'read:user'] },
  ],
  'role-permission': [
    { path: '/role-permission/permissions', method: 'GET', permissions: ['read:role_permission'] },
    { path: '/role-permission/list', method: 'GET', permissions: ['read:role_permission'] },
    { path: '/role-permission', method: 'PUT', permissions: ['update:role_permission'] },
  ],
};

export { aclGatewayPermissions };
export type { PermissionRule };
