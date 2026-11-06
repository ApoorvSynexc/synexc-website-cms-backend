import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { mediaIdRule, dateRule, idRule } from '../common.js';

/** HTML from the rich-text editor: must contain real text (or an image), not just empty tags. */
const htmlContent = Joi.string()
  .custom((value: string, helpers) => {
    const text = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    return text.length < 20 && !/<img\b/i.test(value) ? helpers.error('content.short') : value;
  })
  .messages({ 'content.short': 'Content must be at least 20 characters', 'string.empty': 'Content is required' });

const createBlogSchema = Joi.object({
  title: Joi.string().trim().max(150).required().messages({
    'string.max': 'Title must be at most 150 characters',
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
  }),
  excerpt: Joi.string().trim().max(300).required().messages({
    'string.max': 'Excerpt must be at most 300 characters',
    'any.required': 'Excerpt is required',
    'string.empty': 'Excerpt is required',
  }),
  content: htmlContent.required().messages({ 'any.required': 'Content is required' }),
  categoryId: Joi.string().trim().required().messages({ 'any.required': 'Category is required' }),
  author: Joi.string().trim().max(80).required().messages({
    'string.max': 'Author must be at most 80 characters',
    'any.required': 'Author is required',
    'string.empty': 'Author is required',
  }),
  featuredImageId: mediaIdRule.optional(),
  publishStatus: Joi.string().valid('DRAFT', 'PUBLISHED').optional(),
  publishedAt: dateRule.required().messages({ 'any.required': 'Publish date is required' }),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

const updateBlogSchema = Joi.object({
  id: idRule,
  title: Joi.string().trim().max(150).optional(),
  excerpt: Joi.string().trim().max(300).optional(),
  content: htmlContent.optional(),
  categoryId: Joi.string().trim().optional(),
  author: Joi.string().trim().max(80).optional(),
  featuredImageId: mediaIdRule.optional(),
  publishStatus: Joi.string().valid('DRAFT', 'PUBLISHED').optional(),
  publishedAt: dateRule.optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

const listBlogsQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().allow('').optional(),
  categoryId: Joi.string().trim().allow('').optional(),
  publishStatus: Joi.string().valid('DRAFT', 'PUBLISHED', '').optional(),
});

export const createBlogValidation = validateRequest(createBlogSchema);
export const updateBlogValidation = validateRequest(updateBlogSchema);
export const listBlogsValidation = validateRequest(listBlogsQuery, 'query');
