import { Response } from 'express';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { wrapController } from '../../../../utils/index.js';
import {
  assertMediaExists,
  certificationService,
  faqService,
  galleryImageService,
  heroSlideService,
  keyStatService,
  partnerLogoService,
  teamMemberService,
  testimonialService,
  timelineEventService,
  type createOrderedListService,
} from '../../../../services/index.js';

type Service = ReturnType<typeof createOrderedListService<any>>;

type Options = {
  service: Service;
  /** Singular name used in error messages. */
  label: string;
  /** Items are ordered within this column (e.g. a FAQ's group); omit for one global order. */
  groupField?: string;
  /** Body fields that hold a Media id (e.g. "imageId") — checked to exist before saving. */
  mediaFields?: string[];
  /** Query-string filters: ?<key>=value -> a Prisma `where` fragment. */
  filters?: Record<string, (value: string) => Record<string, unknown>>;
};

/** "" -> null so cleared optional fields are really cleared in the database. */
const clean = (data: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === '' ? null : value]));

/**
 * Same five handlers (+ move) for every ordered website list. `status` ACTIVE/INACTIVE is the
 * "Visible on website" switch, so a plain update toggles it.
 */
const createOrderedListController = ({ service, label, groupField, mediaFields = [], filters = {} }: Options) => {
  const assertFilesExist = (body: Record<string, unknown>) =>
    assertMediaExists(mediaFields.map((field) => body[field] as string | null | undefined));

  const createHandler = async (req: IRequest, res: Response) => {
    await assertFilesExist(req.body);
    const item = await service.create(
      {
        ...clean(req.body),
        status: req.body.status ?? 'ACTIVE',
        ...(req.user?.id && { createdById: req.user.id }),
      },
      groupField,
    );
    return makeResponse(req, res, 201, true, 'create', item);
  };

  /** Not paginated — these lists are short. Optional filters via the query string. */
  const findAllHandler = async (req: IRequest, res: Response) => {
    const where = Object.entries(filters).reduce<Record<string, unknown>>((acc, [key, build]) => {
      const value = req.query[key];
      return typeof value === 'string' && value ? { ...acc, ...build(value) } : acc;
    }, {});
    const items = await service.findAll(where);
    return makeResponse(req, res, 200, true, 'fetch', items);
  };

  const findOneHandler = async (req: IRequest, res: Response) => {
    const item = await service.findOne({ id: String(req.query.id) });
    if (!item) return makeResponse(req, res, 404, false, 'not_exist');
    return makeResponse(req, res, 200, true, 'fetch', item);
  };

  const updateHandler = async (req: IRequest, res: Response) => {
    const { id, ...data } = req.body;
    if (!(await service.findOne({ id }))) return makeResponse(req, res, 404, false, 'not_exist');
    await assertFilesExist(data);
    const item = await service.update(id, clean(data));
    return makeResponse(req, res, 200, true, 'update', item);
  };

  const deleteHandler = async (req: IRequest, res: Response) => {
    const id = String(req.query.id ?? '');
    if (!id) throw new Error(`${label} ID is required in query params`);
    if (!(await service.findOne({ id }))) return makeResponse(req, res, 404, false, 'not_exist');
    await service.softDelete(id);
    return makeResponse(req, res, 200, true, 'delete', null);
  };

  const moveHandler = async (req: IRequest, res: Response) => {
    const { id, direction } = req.body as { id: string; direction: 'up' | 'down' };
    if (!(await service.findOne({ id }))) return makeResponse(req, res, 404, false, 'not_exist');
    await service.move(id, direction, groupField);
    return makeResponse(req, res, 200, true, 'update', null);
  };

  return wrapController({ createHandler, findAllHandler, findOneHandler, updateHandler, deleteHandler, moveHandler });
};

export const heroSlideController = createOrderedListController({
  service: heroSlideService,
  label: 'Hero slide',
  mediaFields: ['imageId', 'logoId'],
});

export const testimonialController = createOrderedListController({
  service: testimonialService,
  label: 'Testimonial',
  mediaFields: ['avatarId'],
  filters: { page: (value) => ({ pages: { has: value } }) },
});

export const faqController = createOrderedListController({
  service: faqService,
  label: 'FAQ',
  groupField: 'group',
  filters: { group: (value) => ({ group: value }) },
});

export const partnerLogoController = createOrderedListController({
  service: partnerLogoService,
  label: 'Logo',
  mediaFields: ['logoId'],
  groupField: 'placement',
  filters: { placement: (value) => ({ placement: value }) },
});

export const teamMemberController = createOrderedListController({
  service: teamMemberService,
  label: 'Team member',
  mediaFields: ['photoId'],
});
export const timelineEventController = createOrderedListController({ service: timelineEventService, label: 'Milestone' });
export const certificationController = createOrderedListController({ service: certificationService, label: 'Certification' });
export const keyStatController = createOrderedListController({ service: keyStatService, label: 'Key stat' });

export const galleryImageController = createOrderedListController({
  service: galleryImageService,
  label: 'Photo',
  mediaFields: ['imageId'],
  groupField: 'album',
  filters: { album: (value) => ({ album: value }) },
});
