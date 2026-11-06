import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { idRule } from '../common.js';

/** Replaces the role's entire permission set with `permissionIds`. */
const updateRolePermissionsSchema = Joi.object({
  roleId: idRule,
  permissionIds: Joi.array().items(Joi.string().trim()).unique().required().messages({
    'any.required': 'permissionIds is required',
    'array.unique': 'permissionIds must not contain duplicates',
  }),
});

export const updateRolePermissionsValidation = validateRequest(updateRolePermissionsSchema);
