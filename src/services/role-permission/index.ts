import { prisma } from '../../config/database/index.js';
import { db } from '../../utils/query.js';

/** Permissions currently granted to a role (ACTIVE rows only), each with its permission joined in. */
const findRolePermissions = (roleId: string) =>
  db('find role permissions', () =>
    prisma.rolePermission.findMany({
      where: { roleId, status: 'ACTIVE' },
      include: { permission: true },
    }),
  );

/** "<action>:<subject>" strings for a user's role — used by the permission gateway and my-profile. */
const findPermissionKeysByRole = (roleId: string): Promise<string[]> =>
  db('find role permissions', async () => {
    const rows = await prisma.rolePermission.findMany({
      where: { roleId, status: 'ACTIVE', permission: { status: 'ACTIVE' } },
      select: { permission: { select: { action: true, subject: true } } },
    });
    return rows.map(({ permission }) => `${permission.action}:${permission.subject}`);
  });

/**
 * Replaces the role's whole permission set with `permissionIds`.
 * RolePermission is a join table, so removed grants are soft-deleted and a later re-grant re-activates the same row.
 */
const replaceRolePermissions = (roleId: string, permissionIds: string[], grantedById?: string) =>
  db('update role permissions', () =>
    prisma.$transaction(async (tx) => {
      const wanted = new Set(permissionIds);
      const existing = await tx.rolePermission.findMany({ where: { roleId } });

      // Revoke what is no longer wanted.
      const toRevoke = existing.filter((row) => row.status === 'ACTIVE' && !wanted.has(row.permissionId));
      if (toRevoke.length > 0) {
        await tx.rolePermission.updateMany({
          where: { id: { in: toRevoke.map((row) => row.id) } },
          data: { status: 'DELETED', deletedAt: new Date() },
        });
      }

      // Grant (or re-activate) what is wanted.
      for (const permissionId of wanted) {
        await tx.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          create: { roleId, permissionId, createdById: grantedById },
          update: { status: 'ACTIVE', deletedAt: null, createdById: grantedById },
        });
      }

      return tx.rolePermission.findMany({ where: { roleId, status: 'ACTIVE' }, include: { permission: true } });
    }),
  );

export { findRolePermissions, findPermissionKeysByRole, replaceRolePermissions };
