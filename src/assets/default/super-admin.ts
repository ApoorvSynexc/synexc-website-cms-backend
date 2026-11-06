import { SUPER_ADMIN_ROLE_NAME } from './roles.js';

/**
 * The only user that exists after seeding. It holds the Super Admin role, so by default it is the only account
 * that can manage users, roles and permissions — everyone else is created by it.
 *
 * There is deliberately no default password here (HRM hardcodes one). The seed uses SEED_SUPER_ADMIN_PASSWORD
 * from .env, or generates a random one and prints it once. SEED_SUPER_ADMIN_EMAIL can override the email.
 */
export const DEFAULT_SUPER_ADMIN = {
  name: 'Super Admin',
  email: 'superadmin@synexc.com',
  roleName: SUPER_ADMIN_ROLE_NAME,
  status: 'ACTIVE',
} as const;
