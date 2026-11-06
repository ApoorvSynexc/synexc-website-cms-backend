import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { mediaIdRule, idRule } from '../common.js';

const passwordRule = Joi.string()
  .min(8)
  .max(64)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/\d/, 'number')
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must be at most 64 characters',
    'string.pattern.name': 'Password needs at least one letter and one number',
  });

const createUserSchema = Joi.object({
  name: Joi.string().trim().max(100).required().messages({
    'string.max': 'Name must be at most 100 characters',
    'any.required': 'Name is required',
    'string.empty': 'Name is required',
  }),
  email: Joi.string().trim().max(150).email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Enter a valid email address',
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
  }),
  password: passwordRule.required().messages({ 'any.required': 'Password is required' }),
  roleId: Joi.string().trim().required().messages({ 'any.required': 'Role is required' }),
  avatarId: mediaIdRule.optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

/** On update the password is optional — leave it out to keep the current one. */
const updateUserSchema = Joi.object({
  id: idRule,
  name: Joi.string().trim().max(100).optional(),
  email: Joi.string().trim().max(150).email({ tlds: { allow: false } }).optional(),
  password: passwordRule.optional(),
  roleId: Joi.string().trim().optional(),
  avatarId: mediaIdRule.optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

const listUsersQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().allow('').optional(),
  roleId: Joi.string().trim().allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', '').optional(),
});

export const createUserValidation = validateRequest(createUserSchema);
export const updateUserValidation = validateRequest(updateUserSchema);
export const listUsersValidation = validateRequest(listUsersQuery, 'query');
