import { prisma } from '../../config/database/index.js';
import type { Permission } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED } from '../../utils/query.js';

/** Every permission that exists — the rows × columns of the role-permission matrix. */
const findPermissions = (): Promise<Permission[]> =>
  db('find permissions', () =>
    prisma.permission.findMany({ where: NOT_DELETED, orderBy: [{ subject: 'asc' }, { action: 'asc' }] }),
  );

export { findPermissions };
