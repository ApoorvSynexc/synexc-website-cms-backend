import { prisma } from '../../config/database/index.js';
import { Prisma, type User } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';
import { mediaSelect } from '../media/index.js';

const include = { role: true, avatar: { select: mediaSelect } } as const;

type UserWithRole = Prisma.UserGetPayload<{ include: typeof include }>;

/** Never send the password hash to a client. */
const toPublicUser = <T extends { passwordHash?: string }>(user: T): Omit<T, 'passwordHash'> => {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
};

const createUser = (data: Prisma.UserCreateInput): Promise<UserWithRole> =>
  db('create user', () => prisma.user.create({ data, include }));

const updateUser = (where: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<UserWithRole> =>
  db('update user', () => prisma.user.update({ where, data, include }));

/** Soft delete: only flags the row DELETED (status + deletedAt) — every other column keeps its value. */
const deleteUser = (id: string): Promise<User> =>
  db('delete user', () => prisma.user.update({ where: { id }, data: softDeleteData() }));

const findUser = (where: Prisma.UserWhereInput): Promise<UserWithRole | null> =>
  db('find user', () => prisma.user.findFirst({ where: { ...NOT_DELETED, ...where }, include }));

const findUsers = (where?: Prisma.UserWhereInput): Promise<UserWithRole[]> =>
  db('find users', () =>
    prisma.user.findMany({ where: { ...NOT_DELETED, ...where }, include, orderBy: { createdAt: 'desc' } }),
  );

const findUsersWithPagination = (where: Prisma.UserWhereInput, skip: number, take: number) =>
  db('find users', async () => {
    const filter = { ...NOT_DELETED, ...where };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where: filter, include, orderBy: { createdAt: 'desc' }, skip, take }),
      prisma.user.count({ where: filter }),
    ]);
    return { users, total };
  });

const countUsers = (where?: Prisma.UserWhereInput): Promise<number> =>
  db('count users', () => prisma.user.count({ where: { ...NOT_DELETED, ...where } }));

export { toPublicUser, createUser, updateUser, deleteUser, findUser, findUsers, findUsersWithPagination, countUsers };
export type { UserWithRole };
