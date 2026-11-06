import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { idRule, slugRule } from '../common.js';

const createBlogCategorySchema = Joi.object({
  name: Joi.string().trim().max(80).required().messages({
    'string.max': 'Category name must be at most 80 characters',
    'any.required': 'Category name is required',
    'string.empty': 'Category name is required',
  }),
  // Optional: generated from the name when omitted.
  slug: slugRule.max(100).optional(),
  description: Joi.string().trim().max(300).allow('').optional(),
});

const updateBlogCategorySchema = Joi.object({
  id: idRule,
  name: Joi.string().trim().max(80).optional(),
  slug: slugRule.max(100).optional(),
  description: Joi.string().trim().max(300).allow('').optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

export const createBlogCategoryValidation = validateRequest(createBlogCategorySchema);
export const updateBlogCategoryValidation = validateRequest(updateBlogCategorySchema);
