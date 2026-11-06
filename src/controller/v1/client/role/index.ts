import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import { countUsers, createRole, deleteRole, findRole, findRoles, updateRole } from '../../../../services/index.js';

const createHandler = async (req: IRequest, res: Response) => {
  const { name, description } = req.body;
  const role = await createRole({
    name,
    description: description || undefined,
    ...(req.user?.id && { createdBy: { connect: { id: req.user.id } } }),
  });
  return makeResponse(req, res, 201, true, 'create', role);
};

/** Not paginated — there are only a handful of roles. */
const findRolesHandler = async (req: IRequest, res: Response) => {
  const roles = await findRoles();
  return makeResponse(req, res, 200, true, 'fetch', roles);
};

const findRoleHandler = async (req: IRequest, res: Response) => {
  const role = await findRole({ id: String(req.query.id) });
  if (!role) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', role);
};

const updateHandler = async (req: IRequest, res: Response) => {
  const { id, name, description, status } = req.body;

  const role = await findRole({ id });
  if (!role) return makeResponse(req, res, 404, false, 'not_exist');
  if (role.isSystem) return makeResponse(req, res, 400, false, 'system_role_locked');

  const updated = await updateRole(
    { id },
    {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(status && { status }),
    },
  );
  return makeResponse(req, res, 200, true, 'update', updated);
};

const deleteHandler = async (req: IRequest, res: Response) => {
  const id = String(req.query.id ?? '');
  if (!id) throw new Error('Role ID is required in query params');

  const role = await findRole({ id });
  if (!role) return makeResponse(req, res, 404, false, 'not_exist');
  if (role.isSystem) return makeResponse(req, res, 400, false, 'system_role_locked');
  if ((await countUsers({ roleId: id })) > 0) return makeResponse(req, res, 409, false, 'role_in_use');

  await deleteRole(role.id);
  return makeResponse(req, res, 200, true, 'delete', null);
};

export const roleController = wrapController({
  createHandler,
  findRolesHandler,
  findRoleHandler,
  updateHandler,
  deleteHandler,
});
