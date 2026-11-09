import { Request, Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { wrapController } from '../../../../utils/index.js';
import {
  certificationService,
  faqService,
  galleryImageService,
  heroSlideService,
  keyStatService,
  partnerLogoService,
  teamMemberService,
  testimonialService,
  timelineEventService,
} from '../../../../services/index.js';
import { stripAll } from '../shared.js';

/** Visible items of an ordered list, in the order the team arranged them. */
const visibleList =
  (
    service: { findAll: (where?: Record<string, unknown>) => Promise<any[]> },
    filters: Record<string, (v: string) => Record<string, unknown>> = {},
  ) =>
  async (req: Request, res: Response) => {
    const where = Object.entries(filters).reduce<Record<string, unknown>>(
      (acc, [key, build]) => {
        const value = req.query[key];
        return typeof value === 'string' && value ? { ...acc, ...build(value) } : acc;
      },
      { status: 'ACTIVE' },
    );
    return makeResponse(req, res, 200, true, 'fetch', stripAll(await service.findAll(where)));
  };

export const publicWebsiteContentController = wrapController({
  heroSlideList: visibleList(heroSlideService),
  testimonialList: visibleList(testimonialService, { page: (v) => ({ pages: { has: v } }) }),
  faqList: visibleList(faqService, { group: (v) => ({ group: v }) }),
  partnerLogoList: visibleList(partnerLogoService, { placement: (v) => ({ placement: v }) }),
  teamMemberList: visibleList(teamMemberService),
  timelineEventList: visibleList(timelineEventService),
  certificationList: visibleList(certificationService),
  keyStatList: visibleList(keyStatService),
  galleryImageList: visibleList(galleryImageService, { album: (v) => ({ album: v }) }),
});
