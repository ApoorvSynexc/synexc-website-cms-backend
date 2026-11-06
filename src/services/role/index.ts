import { prisma } from '../../config/database/index.js';
import { Prisma, type Role } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';

const createRole = (data: Prisma.RoleCreateInput): Promise<Role> =>
  db('create role', () => prisma.role.create({ data }));

const updateRole = (where: Prisma.RoleWhereUniqueInput, data: Prisma.RoleUpdateInput): Promise<Role> =>
  db('update role', () => prisma.role.update({ where, data }));

/** Soft delete: only flags the row DELETED (status + deletedAt) — every other column keeps its value. */
const deleteRole = (id: string): Promise<Role> =>
  db('delete role', () => prisma.role.update({ where: { id }, data: softDeleteData() }));

const findRole = (where: Prisma.RoleWhereInput): Promise<Role | null> =>
  db('find role', () => prisma.role.findFirst({ where: { ...NOT_DELETED, ...where } }));

/** Roles with how many (non-deleted) users hold each one. */
const findRoles = (where?: Prisma.RoleWhereInput) =>
  db('find roles', async () => {
    const roles = await prisma.role.findMany({
      where: { ...NOT_DELETED, ...where },
      orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
      include: {
        _count: { select: { users: { where: NOT_DELETED }, rolePermissions: { where: { status: 'ACTIVE' } } } },
      },
    });
    return roles.map(({ _count, ...role }) => ({
      ...role,
      userCount: _count.users,
      permissionCount: _count.rolePermissions,
    }));
  });

export { createRole, updateRole, deleteRole, findRole, findRoles };
