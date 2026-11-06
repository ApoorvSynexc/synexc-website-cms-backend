import { DEFAULT_PERMISSIONS } from './permissions.js';

/** Subjects that only the Super Admin holds by default (managing who can do what). */
const ACCESS_CONTROL_SUBJECTS = ['user', 'role', 'role_permission'];

const crud = (subject: string) => ['read', 'create', 'update', 'delete'].map((a) => `${a}:${subject}`);

export const SUPER_ADMIN_ROLE_NAME = 'Super Admin';

type DefaultRole = {
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
};

/** "<action>:<subject>" for every permission in the matrix, optionally leaving some subjects out. */
const allPermissions = (exceptSubjects: string[] = []) =>
  DEFAULT_PERMISSIONS.filter(({ subject }) => !exceptSubjects.includes(subject)).map(
    ({ action, subject }) => `${action}:${subject}`,
  );

export const DEFAULT_ROLES: DefaultRole[] = [
  {
    name: SUPER_ADMIN_ROLE_NAME,
    description: 'Full access, including users, roles and permissions.',
    isSystem: true,
    permissions: allPermissions(),
  },
  {
    name: 'Admin',
    description: 'Full access to all content and settings, except users, roles and permissions.',
    isSystem: false,
    permissions: allPermissions(ACCESS_CONTROL_SUBJECTS),
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
];
