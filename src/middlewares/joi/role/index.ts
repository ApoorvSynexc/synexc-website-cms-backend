import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { idRule } from '../common.js';

/** "Super Admin" (and plain "Admin", to avoid confusion) are reserved for the built-in role. */
const roleName = Joi.string()
  .trim()
  .max(80)
  .custom((value: string, helpers) => {
    const normalised = value.toLowerCase().replace(/\s+/g, ' ');
    return ['admin', 'super admin', 'superadmin'].includes(normalised) ? helpers.error('name.reserved') : value;
  })
  .messages({
    'string.max': 'Role name must be at most 80 characters',
    'name.reserved': 'That name is reserved for the Super Admin role',
    'string.empty': 'Role name is required',
  });

const createRoleSchema = Joi.object({
  name: roleName.required().messages({ 'any.required': 'Role name is required' }),
  description: Joi.string().trim().max(300).allow('').optional().messages({
    'string.max': 'Description must be at most 300 characters',
  }),
});

const updateRoleSchema = Joi.object({
  id: idRule,
  name: roleName.optional(),
  description: Joi.string().trim().max(300).allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

export const createRoleValidation = validateRequest(createRoleSchema);
export const updateRoleValidation = validateRequest(updateRoleSchema);
