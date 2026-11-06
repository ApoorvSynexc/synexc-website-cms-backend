import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { linkRule } from '../common.js';

const socialLink = (label: string) =>
  Joi.string()
    .trim()
    .uri({ scheme: ['http', 'https'] })
    .allow('', null)
    .messages({
      'string.uri': `Enter a valid ${label} link starting with https://`,
      'string.uriCustomScheme': `Enter a valid ${label} link starting with https://`,
    });

const updateSiteSettingSchema = Joi.object({
  phone: Joi.string().trim().pattern(/^\+?[0-9][0-9\s-]{6,18}$/).messages({
    'string.pattern.base': 'Enter a valid phone number, e.g. +91 9810512585',
  }),
  phoneHours: Joi.string().trim().max(80).allow('', null),
  email: Joi.string().trim().email({ tlds: { allow: false } }).messages({ 'string.email': 'Enter a valid email address' }),
  emailNote: Joi.string().trim().max(80).allow('', null),
  whatsapp: Joi.string().trim().pattern(/^\d{8,15}$/).allow('', null).messages({
    'string.pattern.base': 'Digits only with country code, e.g. 919910189504',
  }),
  companyName: Joi.string().trim().max(100),
  address: Joi.string().trim().max(300),
  facebook: socialLink('Facebook'),
  linkedin: socialLink('LinkedIn'),
  instagram: socialLink('Instagram'),
  copyrightName: Joi.string().trim().max(100),
  privacyUrl: linkRule,
  termsUrl: linkRule,
}).min(1);

export const updateSiteSettingValidation = validateRequest(updateSiteSettingSchema);
