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
  effectivePermissionKeys,
  findFullAccessRoleIds,
  findRole,
  findUser,
  findUsersWithPagination,
  isSubset,
  mediaConnect,
  mediaLink,
  toPublicUser,
  updateUser,
} from '../../../../services/index.js';

const hash = (password: string) => bcrypt.hash(password, 12);

/**
 * Delegation guard. You may assign a role to someone, or edit / delete someone who holds it, only if that role's
 * access is no bigger than your own — compared purely by permissions, so it makes no difference which role (built-in
 * or custom) either side holds. A delegate therefore can never promote themselves, hand out more access than they
 * have, or touch an account that outranks them (such as the Super Admin).
 */
const holdsAtLeast = async (req: IRequest, role: { id: string }): Promise<boolean> => {
  const [mine, theirs] = await Promise.all([effectivePermissionKeys(req.user?.role), effectivePermissionKeys(role)]);
  return isSubset(theirs, mine);
};

/**
 * Lockout guard: at least one active user must always keep FULL access (every permission). True when this change
 * would remove the last such user (deactivating, deleting, or moving them to a role with less access).
 */
const wouldLoseLastFullAccessUser = async (
  target: { id: string; roleId: string },
  change: { newRoleId?: string; inactive?: boolean },
): Promise<boolean> => {
  const fullRoleIds = await findFullAccessRoleIds();
  if (!fullRoleIds.includes(target.roleId)) return false;
  const keepsFullAccess = !change.inactive && (!change.newRoleId || fullRoleIds.includes(change.newRoleId));
  if (keepsFullAccess) return false;
  return (await countUsers({ roleId: { in: fullRoleIds }, status: 'ACTIVE', id: { not: target.id } })) === 0;
};

const createHandler = async (req: IRequest, res: Response) => {
  const { name, email, password, roleId, avatarId, status } = req.body;
  await assertMediaExists([avatarId]);

  const role = await findRole({ id: roleId });
  if (!role) return makeResponse(req, res, 400, false, 'invalid_reference');
  if (!(await holdsAtLeast(req, role))) return makeResponse(req, res, 403, false, 'cannot_exceed_own_access');

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
  if (!(await holdsAtLeast(req, existing.role))) return makeResponse(req, res, 403, false, 'cannot_exceed_own_access');

  const isSelf = id === req.user?.id;
  // Guard against locking yourself out.
  if (isSelf && (status === 'INACTIVE' || (roleId && roleId !== existing.roleId))) {
    return makeResponse(req, res, 400, false, 'cannot_modify_self');
  }

  if (roleId && roleId !== existing.roleId) {
    const role = await findRole({ id: roleId });
    if (!role) return makeResponse(req, res, 400, false, 'invalid_reference');
    if (!(await holdsAtLeast(req, role))) return makeResponse(req, res, 403, false, 'cannot_exceed_own_access');
  }

  if (await wouldLoseLastFullAccessUser(existing, { newRoleId: roleId, inactive: status === 'INACTIVE' })) {
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
  if (!(await holdsAtLeast(req, user.role))) return makeResponse(req, res, 403, false, 'cannot_exceed_own_access');

  if (await wouldLoseLastFullAccessUser(user, { inactive: true })) {
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
