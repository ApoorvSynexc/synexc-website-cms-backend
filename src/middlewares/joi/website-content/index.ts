import Joi from 'joi';
import { validateRequest } from '../validate.js';
import { mediaIdRule, idRule, linkRule, rowStatusRule } from '../common.js';

/**
 * Builds create + update validators for one ordered-list module.
 * `required` lists the fields a create must include; on update every field is optional.
 * `status` is the "Visible on website" switch (ACTIVE / INACTIVE).
 */
const buildValidators = (fields: Record<string, Joi.Schema>, required: string[]) => {
  const forCreate = Object.fromEntries(
    Object.entries(fields).map(([key, schema]) => [key, required.includes(key) ? schema.required() : schema.optional()]),
  );
  const forUpdate = Object.fromEntries(Object.entries(fields).map(([key, schema]) => [key, schema.optional()]));

  return {
    createValidation: validateRequest(Joi.object({ ...forCreate, status: rowStatusRule.optional() })),
    updateValidation: validateRequest(Joi.object({ id: idRule, ...forUpdate, status: rowStatusRule.optional() })),
  };
};

const text = (max: number, min = 1) =>
  Joi.string().trim().min(min).max(max).messages({
    'string.empty': 'This field is required',
    'string.min': `Must be at least ${min} characters`,
    'string.max': `Must be at most ${max} characters`,
  });

export const TESTIMONIAL_PAGES = ['home', 'about', 'culture', 'case-studies', 'industries'];
export const CERTIFICATION_ICONS = ['zap', 'check', 'shield', 'award'];
export const KEY_STAT_ICONS = ['clock', 'trophy', 'users', 'shield'];
export const FAQ_GROUPS = [
  'General', 'Industries', 'Salesforce', 'Zoho', 'HubSpot', 'AWS', 'Azure', 'ITSM', 'Managed IT',
  'AI & Automation', 'App Development',
];

export const heroSlide = buildValidators(
  {
    category: text(80),
    title: text(120),
    description: text(200),
    imageId: mediaIdRule.invalid('', null),
    logoId: mediaIdRule,
    link: linkRule,
  },
  ['category', 'title', 'description', 'imageId'],
);

export const testimonial = buildValidators(
  {
    name: text(80),
    role: text(100),
    message: text(500, 20),
    avatarId: mediaIdRule,
    pages: Joi.array().items(Joi.string().valid(...TESTIMONIAL_PAGES)).min(1).unique().messages({
      'array.min': 'Pick at least one page',
      'any.only': `Pages must be among: ${TESTIMONIAL_PAGES.join(', ')}`,
    }),
  },
  ['name', 'role', 'message', 'pages'],
);

export const faq = buildValidators(
  {
    question: text(250),
    answer: text(1200, 10),
    group: Joi.string().valid(...FAQ_GROUPS).messages({ 'any.only': `Group must be one of: ${FAQ_GROUPS.join(', ')}` }),
  },
  ['question', 'answer', 'group'],
);

export const partnerLogo = buildValidators(
  {
    name: text(80),
    logoId: mediaIdRule.invalid('', null),
    link: linkRule,
    placement: Joi.string().valid('PARTNER', 'CLIENT'),
  },
  ['name', 'logoId'],
);

export const teamMember = buildValidators(
  {
    name: text(80),
    role: text(80),
    bio: text(300, 20),
    photoId: mediaIdRule,
    linkedin: Joi.string()
      .trim()
      .pattern(/^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i)
      .allow('', null)
      .messages({ 'string.pattern.base': 'Enter a LinkedIn profile link, e.g. https://www.linkedin.com/in/name' }),
    email: Joi.string().trim().email({ tlds: { allow: false } }).allow('', null),
  },
  ['name', 'role', 'bio'],
);

export const timelineEvent = buildValidators(
  {
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).messages({
      'number.base': 'Year must be a number',
      'number.min': 'Enter a four-digit year',
      'number.max': 'Year cannot be that far in the future',
    }),
    title: text(80),
    description: text(300, 20),
  },
  ['year', 'title', 'description'],
);

export const certification = buildValidators(
  {
    title: text(80),
    type: text(80),
    description: text(250, 20),
    icon: Joi.string().valid(...CERTIFICATION_ICONS),
  },
  ['title', 'type', 'description', 'icon'],
);

export const keyStat = buildValidators(
  {
    stat: Joi.string().trim().max(10).pattern(/\d/).messages({
      'string.pattern.base': 'The figure should contain a number, e.g. 12+',
      'string.max': 'Keep the figure short, e.g. 24/7 or 100+',
    }),
    title: text(60),
    description: text(200, 20),
    icon: Joi.string().valid(...KEY_STAT_ICONS),
  },
  ['stat', 'title', 'description', 'icon'],
);

export const galleryImage = buildValidators(
  {
    imageId: mediaIdRule.invalid('', null),
    caption: Joi.string().trim().max(120).allow('', null),
    album: text(80),
  },
  ['imageId', 'album'],
);

/** PUT /<module>/move  { id, direction } */
export const moveValidation = validateRequest(
  Joi.object({
    id: idRule,
    direction: Joi.string().valid('up', 'down').required().messages({ 'any.only': 'Direction must be "up" or "down"' }),
  }),
);
