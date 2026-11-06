import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { mediaIdRule, dateRule, idRule, linkRule } from '../common.js';

const baseFields = {
  badge: Joi.string().trim().max(60).allow('').optional(),
  title: Joi.string().trim().max(120).messages({ 'string.max': 'Headline must be at most 120 characters' }),
  message: Joi.string().trim().max(250).messages({ 'string.max': 'Message must be at most 250 characters' }),
  type: Joi.string().valid('POPUP', 'BANNER'),
  eventDate: dateRule.allow('', null).optional(),
  venue: Joi.string().trim().max(120).allow('').optional(),
  ctaLabel: Joi.string().trim().max(40).allow('').optional(),
  ctaUrl: linkRule.optional(),
  imageId: mediaIdRule.optional(),
  startDate: dateRule,
  endDate: dateRule,
  status: Joi.string().valid('ACTIVE', 'INACTIVE'),
};

/** The call-to-action button needs both a label and a link — or neither. */
const ctaPair = (value: { ctaLabel?: string; ctaUrl?: string }, helpers: Joi.CustomHelpers) =>
  Boolean(value.ctaLabel) !== Boolean(value.ctaUrl) ? helpers.error('cta.pair') : value;

const endAfterStart = (value: { startDate?: string; endDate?: string }, helpers: Joi.CustomHelpers) =>
  value.startDate && value.endDate && value.endDate < value.startDate ? helpers.error('date.order') : value;

const messages = {
  'cta.pair': 'Button text and link must be filled in together',
  'date.order': 'End date must be on or after the start date',
};

const createAnnouncementSchema = Joi.object({
  ...baseFields,
  title: baseFields.title.required().messages({ 'any.required': 'Headline is required', 'string.empty': 'Headline is required' }),
  message: baseFields.message.required().messages({ 'any.required': 'Message is required', 'string.empty': 'Message is required' }),
  type: baseFields.type.default('POPUP'),
  startDate: baseFields.startDate.required(),
  endDate: baseFields.endDate.required(),
})
  .custom(ctaPair)
  .custom(endAfterStart)
  .messages(messages);

const updateAnnouncementSchema = Joi.object({
  id: idRule,
  ...baseFields,
  title: baseFields.title.optional(),
  message: baseFields.message.optional(),
  type: baseFields.type.optional(),
  startDate: baseFields.startDate.optional(),
  endDate: baseFields.endDate.optional(),
})
  .custom(ctaPair)
  .custom(endAfterStart)
  .messages(messages);

const listAnnouncementsQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().trim().allow('').optional(),
  type: Joi.string().valid('POPUP', 'BANNER', '').optional(),
});

export const createAnnouncementValidation = validateRequest(createAnnouncementSchema);
export const updateAnnouncementValidation = validateRequest(updateAnnouncementSchema);
export const listAnnouncementsValidation = validateRequest(listAnnouncementsQuery, 'query');
