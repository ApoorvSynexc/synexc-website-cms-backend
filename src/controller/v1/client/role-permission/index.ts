import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import {
  findPermissions,
  findRole,
  effectivePermissionKeys,
  findRolePermissions,
  replaceRolePermissions,
} from '../../../../services/index.js';

/** Every permission (the matrix rows × columns). */
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

  const entries = await findRolePermissions(roleId);

  return makeResponse(req, res, 200, true, 'fetch', entries);
};

/** PUT /role-permission — replaces the role's whole permission set. */
const updateHandler = async (req: IRequest, res: Response) => {
  const { roleId, permissionIds } = req.body as { roleId: string; permissionIds: string[] };

  const role = await findRole({ id: roleId });
  if (!role) return makeResponse(req, res, 404, false, 'not_exist');
  if (role.isSystem) return makeResponse(req, res, 400, false, 'system_role_locked');

  const all = await findPermissions();
  const byId = new Map(all.map((permission) => [permission.id, permission]));
  if (permissionIds.some((id) => !byId.has(id))) {
    return makeResponse(req, res, 400, false, 'invalid_reference');
  }

  // Delegation guard: you can only ADD permissions that you hold yourself, so nobody can hand out (or give
  // themselves) more access than they have. Removing is always allowed. The Super Admin holds everything.
  const current = new Set((await findRolePermissions(roleId)).map((entry) => entry.permissionId));
  const added = permissionIds.filter((id) => !current.has(id));
  if (added.length > 0) {
    const mine = await effectivePermissionKeys(req.user?.role);
    if (added.some((id) => !mine.has(`${byId.get(id)!.action}:${byId.get(id)!.subject}`))) {
      return makeResponse(req, res, 403, false, 'cannot_exceed_own_access');
    }
  }

  const entries = await replaceRolePermissions(roleId, permissionIds, req.user?.id);
  return makeResponse(req, res, 200, true, 'update', entries);
};

export const rolePermissionController = wrapController({
  findPermissionsHandler,
  findRolePermissionsHandler,
  updateHandler,
});
