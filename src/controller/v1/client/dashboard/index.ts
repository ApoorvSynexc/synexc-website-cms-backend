import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import { getDashboardStats } from '../../../../services/index.js';

const statsHandler = async (req: IRequest, res: Response) => {
  const stats = await getDashboardStats();
  return makeResponse(req, res, 200, true, 'fetch', stats);
};

export const dashboardController = wrapController({ statsHandler });
