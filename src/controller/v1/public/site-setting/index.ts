import { Request, Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { wrapController } from '../../../../utils/index.js';
import { findSiteSetting } from '../../../../services/index.js';
import { strip } from '../shared.js';

const siteSetting = async (req: Request, res: Response) => {
  const setting = await findSiteSetting();
  if (!setting || setting.status !== 'ACTIVE') return makeResponse(req, res, 404, false, 'not_exist');
  return makeResponse(req, res, 200, true, 'fetch', strip(setting));
};

export const publicSiteSettingController = wrapController({ siteSetting });
