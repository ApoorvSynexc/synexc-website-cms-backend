import { prisma } from '../../config/database/index.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';

/**
 * The nine "ordered list" tables (hero slides, testimonials, FAQs, partner logos, team members, timeline,
 * certifications, key stats, gallery) behave identically: create / update / soft-delete / list in
 * `sortOrder`, plus swapping an item with its neighbour. One factory serves all of them.
 *
 * `delegate` is typed loosely on purpose — Prisma has no shared type across different model delegates.
 * Callers (see the per-module services) pass the real delegate and get typed Joi-validated input.
 */
type OrderedListModel =
  | 'heroSlide'
  | 'testimonial'
  | 'faq'
  | 'partnerLogo'
  | 'teamMember'
  | 'timelineEvent'
  | 'certification'
  | 'keyStat'
  | 'galleryImage';

type Row = { id: string; sortOrder: number };

const createOrderedListService = <T extends Row>(
  model: OrderedListModel,
  label: string,
  /** Linked files to embed in every result, e.g. { image: { select: mediaSelect } }. */
  include?: Record<string, unknown>,
) => {
  const delegate = () => (prisma as any)[model];

  /** Groups scope the ordering (e.g. a FAQ group, a gallery album); lists without groups use one big group. */
  const scopeOf = (row: Record<string, unknown>, groupField?: string) =>
    groupField ? { [groupField]: row[groupField] } : {};

  return {
    findAll: (where: Record<string, unknown> = {}): Promise<T[]> =>
      db(`find ${label}`, () =>
        delegate().findMany({
          where: { ...NOT_DELETED, ...where },
          include,
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        }),
      ),

    findOne: (where: Record<string, unknown>): Promise<T | null> =>
      db(`find ${label}`, () => delegate().findFirst({ where: { ...NOT_DELETED, ...where }, include })),

    /** New items go to the end of their list. */
    create: (data: Record<string, unknown>, groupField?: string): Promise<T> =>
      db(`create ${label}`, async () => {
        const last = await delegate().findFirst({
          where: { ...NOT_DELETED, ...scopeOf(data, groupField) },
          orderBy: { sortOrder: 'desc' },
          select: { sortOrder: true },
        });
        return delegate().create({ data: { ...data, sortOrder: (last?.sortOrder ?? -1) + 1 }, include });
      }),

    update: (id: string, data: Record<string, unknown>): Promise<T> =>
      db(`update ${label}`, () => delegate().update({ where: { id }, data, include })),

    softDelete: (id: string): Promise<T> =>
      db(`delete ${label}`, () => delegate().update({ where: { id }, data: softDeleteData() })),

    /** Swap with the neighbour above/below (within the same group, if the list has groups). */
    move: (id: string, direction: 'up' | 'down', groupField?: string): Promise<void> =>
      db(`reorder ${label}`, () =>
        prisma.$transaction(async (tx) => {
          const d = (tx as any)[model];
          const current = await d.findFirst({ where: { id, ...NOT_DELETED } });
          if (!current) throw new Error('not_exist');

          const neighbour = await d.findFirst({
            where: {
              ...NOT_DELETED,
              ...scopeOf(current, groupField),
              sortOrder: direction === 'up' ? { lt: current.sortOrder } : { gt: current.sortOrder },
            },
            orderBy: { sortOrder: direction === 'up' ? 'desc' : 'asc' },
          });
          if (!neighbour) return; // already first / last

          await d.update({ where: { id: current.id }, data: { sortOrder: neighbour.sortOrder } });
          await d.update({ where: { id: neighbour.id }, data: { sortOrder: current.sortOrder } });
        }),
      ),
  };
};

export { createOrderedListService };
export type { OrderedListModel };
