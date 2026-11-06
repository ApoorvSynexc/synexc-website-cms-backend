import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { mediaIdRule } from '../common.js';

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Name must be at most 100 characters',
    'string.empty': 'Name cannot be empty',
  }),
  avatarId: mediaIdRule.optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({ 'any.required': 'Current password is required' }),
  newPassword: Joi.string()
    .min(8)
    .max(64)
    .pattern(/[A-Za-z]/, 'letter')
    .pattern(/\d/, 'number')
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.max': 'New password must be at most 64 characters',
      'string.pattern.name': 'New password needs at least one letter and one number',
      'any.required': 'New password is required',
    }),
});

export const updateProfileValidation = validateRequest(updateProfileSchema);
export const changePasswordValidation = validateRequest(changePasswordSchema);
