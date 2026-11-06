import { prisma } from '../../config/database/index.js';
import { db, NOT_DELETED } from '../../utils/query.js';

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
 * Everything a role may do, as "<action>:<subject>" — always read from its permission rows. Nothing is implied by
 * a role being built-in (isSystem); the Super Admin simply has a row for every permission. Used for the delegation
 * guards: nobody can grant, assign or manage access beyond what they hold.
 */
const effectivePermissionKeys = (role?: { id: string } | null): Promise<Set<string>> =>
  db('find role permissions', async () => {
    if (!role) return new Set<string>();
    const keys = await prisma.rolePermission.findMany({
      where: { roleId: role.id, status: 'ACTIVE', permission: { status: 'ACTIVE' } },
      select: { permission: { select: { action: true, subject: true } } },
    });
    return new Set(keys.map(({ permission }) => `${permission.action}:${permission.subject}`));
  });

/**
 * Roles that hold EVERY permission that exists. Used for the lockout guard: there must always remain at least one
 * active user on such a role, otherwise nobody could manage users, roles and permissions any more.
 */
const findFullAccessRoleIds = (): Promise<string[]> =>
  db('find roles', async () => {
    const total = await prisma.permission.count({ where: { status: 'ACTIVE' } });
    if (total === 0) return [];
    const roles = await prisma.role.findMany({
      where: { ...NOT_DELETED, status: 'ACTIVE' },
      select: {
        id: true,
        _count: { select: { rolePermissions: { where: { status: 'ACTIVE', permission: { status: 'ACTIVE' } } } } },
      },
    });
    return roles.filter((role) => role._count.rolePermissions === total).map((role) => role.id);
  });

/** True when every permission in `needed` is also in `held`. */
const isSubset = (needed: Set<string>, held: Set<string>): boolean => [...needed].every((key) => held.has(key));

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

      // Re-activate previously revoked grants (one query).
      const toReactivate = existing.filter((row) => row.status !== 'ACTIVE' && wanted.has(row.permissionId));
      if (toReactivate.length > 0) {
        await tx.rolePermission.updateMany({
          where: { id: { in: toReactivate.map((row) => row.id) } },
          data: { status: 'ACTIVE', deletedAt: null, createdById: grantedById },
        });
      }

      // Grant what has never been granted (one query).
      const known = new Set(existing.map((row) => row.permissionId));
      const toCreate = [...wanted].filter((permissionId) => !known.has(permissionId));
      if (toCreate.length > 0) {
        await tx.rolePermission.createMany({
          data: toCreate.map((permissionId) => ({ roleId, permissionId, createdById: grantedById })),
          skipDuplicates: true,
        });
      }

      return tx.rolePermission.findMany({ where: { roleId, status: 'ACTIVE' }, include: { permission: true } });
    }),
  );

export {
  findRolePermissions,
  findPermissionKeysByRole,
  replaceRolePermissions,
  effectivePermissionKeys,
  findFullAccessRoleIds,
  isSubset,
};
