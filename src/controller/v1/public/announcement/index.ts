import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { makeResponse } from '../../../../lib/response/index.js';
import { wrapController } from '../../../../utils/index.js';
import { findLiveAnnouncements } from '../../../../services/index.js';
import { stripAll } from '../shared.js';

/** Announcements switched on and inside their display window today. */
const announcementList = async (req: Request, res: Response) => {
  const today = new Date(`${dayjs().format('YYYY-MM-DD')}T00:00:00.000Z`);
  const announcements = await findLiveAnnouncements(today);
  return makeResponse(req, res, 200, true, 'fetch', stripAll(announcements));
};

export const publicAnnouncementController = wrapController({ announcementList });
