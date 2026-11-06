import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import {
  findPermissions,
  findRole,
  findRolePermissions,
  replaceRolePermissions,
} from '../../../../services/index.js';

/** Every permission that exists (the matrix rows × columns). */
const findPermissionsHandler = async (req: IRequest, res: Response) => {
  const permissions = await findPermissions();
  return makeResponse(req, res, 200, true, 'fetch', permissions);
};

/** GET /role-permission/list?roleId=… — what the role currently has. */
const findRolePermissionsHandler = async (req: IRequest, res: Response) => {
  const roleId = String(req.query.roleId ?? '');
  if (!roleId) throw new Error('roleId is required in query params');

  const role = await findRole({ id: roleId });
  if (!role) return makeResponse(req, res, 404, false, 'not_exist');

  // The built-in Admin role always has everything.
  const entries = role.isSystem
    ? (await findPermissions()).map((permission) => ({ roleId, permissionId: permission.id, permission }))
    : await findRolePermissions(roleId);

  return makeResponse(req, res, 200, true, 'fetch', entries);
};

/** PUT /role-permission — replaces the role's whole permission set. */
const updateHandler = async (req: IRequest, res: Response) => {
  const { roleId, permissionIds } = req.body as { roleId: string; permissionIds: string[] };

  const role = await findRole({ id: roleId });
  if (!role) return makeResponse(req, res, 404, false, 'not_exist');
  if (role.isSystem) return makeResponse(req, res, 400, false, 'system_role_locked');

  const known = new Set((await findPermissions()).map((permission) => permission.id));
  if (permissionIds.some((id) => !known.has(id))) {
    return makeResponse(req, res, 400, false, 'invalid_reference');
  }

  const entries = await replaceRolePermissions(roleId, permissionIds, req.user?.id);
  return makeResponse(req, res, 200, true, 'update', entries);
};

export const rolePermissionController = wrapController({
  findPermissionsHandler,
  findRolePermissionsHandler,
  updateHandler,
});
