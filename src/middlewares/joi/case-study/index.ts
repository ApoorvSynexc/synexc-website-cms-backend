import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { mediaIdRule, dateRule, idRule } from '../common.js';

const CATEGORIES = ['CRM', 'Software Development', 'AI & Automation', 'Cloud', 'ITSM', 'Managed IT'];

const htmlContent = Joi.string()
  .custom((value: string, helpers) => {
    const text = value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
    return text.length < 20 && !/<img\b/i.test(value) ? helpers.error('content.short') : value;
  })
  .messages({ 'content.short': 'Content must be at least 20 characters', 'string.empty': 'Content is required' });

const resultsRule = Joi.array()
  .items(
    Joi.object({
      metric: Joi.string().trim().max(12).required(),
      label: Joi.string().trim().max(60).required(),
    }),
  )
  .max(4)
  .messages({ 'array.max': 'At most 4 key results' });

const tagsRule = Joi.array().items(Joi.string().trim().max(40)).max(10).messages({ 'array.max': 'At most 10 tags' });

const createCaseStudySchema = Joi.object({
  title: Joi.string().trim().max(200).required().messages({ 'any.required': 'Title is required', 'string.empty': 'Title is required' }),
  client: Joi.string().trim().max(100).required().messages({ 'any.required': 'Client is required', 'string.empty': 'Client is required' }),
  category: Joi.string().valid(...CATEGORIES).required().messages({ 'any.only': `Category must be one of: ${CATEGORIES.join(', ')}` }),
  description: Joi.string().trim().max(400).required().messages({ 'any.required': 'Description is required', 'string.empty': 'Description is required' }),
  imageId: mediaIdRule.optional(),
  content: htmlContent.required(),
  tags: tagsRule.optional(),
  results: resultsRule.optional(),
  readTime: Joi.string().trim().pattern(/^\d{1,2} min read$/).required().messages({
    'string.pattern.base': 'Use the format "5 min read"',
    'any.required': 'Read time is required',
  }),
  publishStatus: Joi.string().valid('DRAFT', 'PUBLISHED').optional(),
  publishedAt: dateRule.required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

const updateCaseStudySchema = Joi.object({
  id: idRule,
  title: Joi.string().trim().max(200).optional(),
  client: Joi.string().trim().max(100).optional(),
  category: Joi.string().valid(...CATEGORIES).optional(),
  description: Joi.string().trim().max(400).optional(),
  imageId: mediaIdRule.optional(),
  content: htmlContent.optional(),
  tags: tagsRule.optional(),
  results: resultsRule.optional(),
  readTime: Joi.string().trim().pattern(/^\d{1,2} min read$/).optional(),
  publishStatus: Joi.string().valid('DRAFT', 'PUBLISHED').optional(),
  publishedAt: dateRule.optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
});

const listCaseStudiesQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().allow('').optional(),
  category: Joi.string().trim().allow('').optional(),
  publishStatus: Joi.string().valid('DRAFT', 'PUBLISHED', '').optional(),
});

export const createCaseStudyValidation = validateRequest(createCaseStudySchema);
export const updateCaseStudyValidation = validateRequest(updateCaseStudySchema);
export const listCaseStudiesValidation = validateRequest(listCaseStudiesQuery, 'query');
