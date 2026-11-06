import { Response, Request } from 'express';
import { LANGUAGE, MEDIA_BASE_URL } from '../../constant/index.js';
import { LOCALIZATION } from '../../assets/index.js';

type ILanguage = keyof typeof LANGUAGE;

const absoluteUrl = (key: string): string => (/^https?:\/\//i.test(key) ? key : `${MEDIA_BASE_URL}/${key}`);

/** A linked file as the services select it: { id, name, size, mimetype, url, thumbnailUrl }. */
const isMedia = (value: any): boolean =>
  typeof value.url === 'string' && typeof value.mimetype === 'string' && 'thumbnailUrl' in value;

/**
 * The database stores S3 *keys*. Anywhere a response contains a file object, swap the keys for full URLs so
 * clients (the CMS and the public website) never need to know where files live.
 */
const resolveMedia = (value: any): any => {
  if (Array.isArray(value)) return value.map(resolveMedia);
  if (value === null || typeof value !== 'object' || value instanceof Date) return value;
  if (isMedia(value)) {
    return { ...value, url: absoluteUrl(value.url), thumbnailUrl: value.thumbnailUrl ? absoluteUrl(value.thumbnailUrl) : null };
  }
  return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, resolveMedia(inner)]));
};

const makeResponse = async (
  req: Request,
  res: Response,
  statusCode: number,
  success: boolean,
  message: keyof typeof LOCALIZATION.en,
  payload: any = undefined,
  meta: any = {}
) =>
  new Promise<any>((resolve) => {
    const acceptLanguage = req.headers['accept-language'] as ILanguage;
    const allowedLanguages = Object.values(LANGUAGE) as Array<ILanguage>;
    const language =
      acceptLanguage && allowedLanguages.includes(acceptLanguage) ? acceptLanguage : 'en';
    const localizationMessage = LOCALIZATION[language]?.[message] ?? message;

    res.status(statusCode).send({
      success,
      message: localizationMessage || message,
      data: resolveMedia(payload ?? null),
      meta,
    });

    resolve(statusCode);
  });

export { makeResponse, resolveMedia };
