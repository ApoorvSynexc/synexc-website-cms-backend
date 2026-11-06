import Joi from 'joi';

/** lowercase letters, numbers and single hyphens: "my-first-post" */
export const slugRule = Joi.string()
  .trim()
  .max(160)
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .messages({ 'string.pattern.base': 'Use lowercase letters, numbers and single hyphens only' });

/** A file is always referenced by the id of its Media row (upload first via POST /common/upload). */
export const mediaIdRule = Joi.string().trim().max(60).allow('', null);

/** Optional link: http(s) URL or a site path. */
export const linkRule = Joi.string()
  .trim()
  .max(500)
  .pattern(/^(https?:\/\/\S+|\/\S*)$/)
  .allow('', null)
  .messages({ 'string.pattern.base': 'Enter an http(s) link or a site path like /contact-us' });

/** YYYY-MM-DD */
export const dateRule = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ 'string.pattern.base': 'Use the format YYYY-MM-DD' });

export const idRule = Joi.string().trim().required().messages({ 'any.required': 'ID is required' });

export const rowStatusRule = Joi.string().valid('ACTIVE', 'INACTIVE');

export const idQuerySchema = Joi.object({ id: idRule });
