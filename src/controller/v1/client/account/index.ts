import { Response } from 'express';
import bcrypt from 'bcrypt';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import {
  assertMediaExists,
  findPermissionKeysByRole,
  findUser,
  mediaLink,
  revokeOtherSessions,
  toPublicUser,
  updateUser,
} from '../../../../services/index.js';

/** The frontend checks permissions as "<subject>:<action>", e.g. "blog:create". */
const toFrontendKeys = (keys: string[]) =>
  keys.map((key) => {
    const [action, subject] = key.split(':');
    return `${subject}:${action}`;
  });

const getProfile = async (req: IRequest, res: Response) => {
  const user = await findUser({ id: req.user?.id });
  if (!user) return makeResponse(req, res, 404, false, 'not_exist');

  const keys = await findPermissionKeysByRole(user.roleId);

  return makeResponse(req, res, 200, true, 'fetch', {
    ...toPublicUser(user),
    role: { id: user.role.id, name: user.role.name, isSystem: user.role.isSystem },
    permissions: toFrontendKeys(keys),
  });
};

const updateProfile = async (req: IRequest, res: Response) => {
  const { name, avatarId } = req.body;
  await assertMediaExists([avatarId]);
  const user = await updateUser(
    { id: String(req.user?.id) },
    { ...(name !== undefined && { name }), avatar: mediaLink(avatarId) },
  );
  return makeResponse(req, res, 200, true, 'update', toPublicUser(user));
};

const changePassword = async (req: IRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await findUser({ id: req.user?.id });
  if (!user) return makeResponse(req, res, 404, false, 'not_exist');

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return makeResponse(req, res, 400, false, 'password_incorrect');
  }

  await updateUser({ id: user.id }, { passwordHash: await bcrypt.hash(newPassword, 12) });
  // Sign out every other device; keep this one.
  await revokeOtherSessions(user.id, req.sessionId);

  return makeResponse(req, res, 200, true, 'update', null);
};

export const accountController = wrapController({ getProfile, updateProfile, changePassword });
