import { NextFunction } from 'express';
import { IRequest, IResponse, makeResponse } from '../../lib/index.js';
import { aclGatewayPermissions } from './permissions/index.js';
import { findPermissionKeysByRole } from '../../services/index.js';

type IAclGatewayPermissions = keyof typeof aclGatewayPermissions;

/** Modules every logged-in user may call without a specific permission. */
const ALLOWED_MODULES = ['account', 'common'];

/** Role-based access: checks the user's role grants a permission for this exact path + method. */
const aclGateway = async (req: IRequest, res: IResponse, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    if (!user?.roleId) {
      return void (await makeResponse(req, res, 401, false, 'unauthorized'));
    }

    const requestPath = req.path.length > 1 ? req.path.replace(/\/+$/, '') : req.path;
    const submodule = (requestPath.split('/')[1] ?? '') as IAclGatewayPermissions;

    if (!ALLOWED_MODULES.includes(submodule)) {
      const rules = aclGatewayPermissions[submodule];
      const rule = rules?.find((r) => r.path === requestPath && r.method === req.method);
      if (!rule) {
        return void (await makeResponse(req, res, 403, false, 'insufficient_permission'));
      }

      const granted = await findPermissionKeysByRole(user.roleId);
      if (!rule.permissions.some((permission) => granted.includes(permission))) {
        return void (await makeResponse(req, res, 403, false, 'insufficient_permission'));
      }
    }

    next();
  } catch (error) {
    console.log('Permission Gateway Error', error);
    await makeResponse(req, res, 401, false, 'unauthorized');
  }
};

export { aclGateway };
