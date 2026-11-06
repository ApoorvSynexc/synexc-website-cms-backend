import Joi from 'joi';
import { validateRequest } from '../validate.js';

const loginSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
  }),
  deviceType: Joi.string().valid('WEB', 'IOS', 'ANDROID').optional(),
});

// The refresh token travels in an httpOnly cookie, so these bodies are intentionally empty.
const emptySchema = Joi.object({});

export const loginValidation = validateRequest(loginSchema);
export const refreshTokenValidation = validateRequest(emptySchema);
export const logoutValidation = validateRequest(emptySchema);
