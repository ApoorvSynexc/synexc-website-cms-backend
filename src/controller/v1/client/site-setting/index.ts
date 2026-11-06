import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import { findSiteSetting, updateSiteSetting } from '../../../../services/index.js';

const getHandler = async (req: IRequest, res: Response) => {
  const setting = await findSiteSetting();
  if (!setting) return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', setting);
};

/** Only the fields sent are changed; an empty string clears an optional field. */
const updateHandler = async (req: IRequest, res: Response) => {
  if (!(await findSiteSetting())) return makeResponse(req, res, 404, false, 'not_exist');

  const required = new Set(['phone', 'email', 'companyName', 'address', 'copyrightName']);
  const data = Object.fromEntries(
    Object.entries(req.body as Record<string, string | null>).map(([key, value]) => [
      key,
      required.has(key) ? value : value || null,
    ]),
  );

  const setting = await updateSiteSetting(data);
  return makeResponse(req, res, 200, true, 'update', setting);
};

export const siteSettingController = wrapController({ getHandler, updateHandler });
