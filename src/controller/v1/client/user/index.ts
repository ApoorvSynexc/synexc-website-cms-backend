import { Response } from 'express';
import bcrypt from 'bcrypt';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { buildMeta, parsePagination, wrapController } from '../../../../utils/index.js';
import {
  assertMediaExists,
  countUsers,
  createUser,
  deleteUser,
  findRole,
  findUser,
  findUsersWithPagination,
  mediaConnect,
  mediaLink,
  toPublicUser,
  updateUser,
} from '../../../../services/index.js';

const hash = (password: string) => bcrypt.hash(password, 12);

/** Only someone with a built-in (system) role may hand out a built-in role. */
const canAssignRole = (req: IRequest, role: { isSystem: boolean }) => !role.isSystem || Boolean(req.user?.role?.isSystem);

const createHandler = async (req: IRequest, res: Response) => {
  const { name, email, password, roleId, avatarId, status } = req.body;
  await assertMediaExists([avatarId]);

  const role = await findRole({ id: roleId });
  if (!role) return makeResponse(req, res, 400, false, 'invalid_reference');
  if (!canAssignRole(req, role)) return makeResponse(req, res, 403, false, 'insufficient_permission');

  const user = await createUser({
    name,
    email: String(email).toLowerCase(),
    passwordHash: await hash(password),
    role: { connect: { id: roleId } },
    avatar: mediaConnect(avatarId),
    status: status ?? 'ACTIVE',
    ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
  });

  return makeResponse(req, res, 201, true, 'create', toPublicUser(user));
};

const findUsersHandler = async (req: IRequest, res: Response) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, roleId, status } = req.query as Record<string, string | undefined>;

  const { users, total } = await findUsersWithPagination(
    {
      ...(roleId && { roleId }),
      ...(status && { status: status as 'ACTIVE' | 'INACTIVE' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    skip,
    limit,
  );

  return makeResponse(req, res, 200, true, 'fetch', users.map(toPublicUser), buildMeta(page, limit, total));
};

const findUserHandler = async (req: IRequest, res: Response) => {
  const user = await findUser({ id: String(req.query.id) });
  if (!user) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', toPublicUser(user));
};

const updateHandler = async (req: IRequest, res: Response) => {
  const { id, name, email, password, roleId, avatarId, status } = req.body;
  await assertMediaExists([avatarId]);

  const existing = await findUser({ id });
  if (!existing) return makeResponse(req, res, 404, false, 'not_exist');

  const isSelf = id === req.user?.id;
  // Guard against locking yourself out.
  if (isSelf && (status === 'INACTIVE' || (roleId && roleId !== existing.roleId))) {
    return makeResponse(req, res, 400, false, 'cannot_modify_self');
  }

  if (roleId && roleId !== existing.roleId) {
    const role = await findRole({ id: roleId });
    if (!role) return makeResponse(req, res, 400, false, 'invalid_reference');
    if (!canAssignRole(req, role)) return makeResponse(req, res, 403, false, 'insufficient_permission');
  }

  // Demoting / deactivating the last active Admin would leave nobody able to manage the CMS.
  const losingAdmin = existing.role.isSystem && ((roleId && roleId !== existing.roleId) || status === 'INACTIVE');
  if (losingAdmin && (await countUsers({ role: { isSystem: true }, status: 'ACTIVE' })) <= 1) {
    return makeResponse(req, res, 400, false, 'last_admin');
  }

  const user = await updateUser(
    { id },
    {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email: String(email).toLowerCase() }),
      ...(password && { passwordHash: await hash(password) }),
      ...(roleId && { role: { connect: { id: roleId } } }),
      avatar: mediaLink(avatarId),
      ...(status && { status }),
    },
  );

  return makeResponse(req, res, 200, true, 'update', toPublicUser(user));
};

const deleteHandler = async (req: IRequest, res: Response) => {
  const id = String(req.query.id ?? '');
  if (!id) throw new Error('User ID is required in query params');
  if (id === req.user?.id) return makeResponse(req, res, 400, false, 'cannot_modify_self');

  const user = await findUser({ id });
  if (!user) return makeResponse(req, res, 404, false, 'not_exist');

  if (user.role.isSystem && (await countUsers({ role: { isSystem: true }, status: 'ACTIVE' })) <= 1) {
    return makeResponse(req, res, 400, false, 'last_admin');
  }

  await deleteUser(user.id);
  return makeResponse(req, res, 200, true, 'delete', null);
};

export const userController = wrapController({
  createHandler,
  findUsersHandler,
  findUserHandler,
  updateHandler,
  deleteHandler,
});
