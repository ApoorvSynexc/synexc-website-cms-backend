import { prisma } from '../../config/database/index.js';
import { Prisma, type CaseStudy } from '../../../generated/prisma/client.js';
import { db, NOT_DELETED, softDeleteData } from '../../utils/query.js';
import { mediaSelect } from '../media/index.js';

const include = { image: { select: mediaSelect } } as const;

const createCaseStudy = (data: Prisma.CaseStudyCreateInput) =>
  db('create case study', () => prisma.caseStudy.create({ data, include }));

const updateCaseStudy = (where: Prisma.CaseStudyWhereUniqueInput, data: Prisma.CaseStudyUpdateInput) =>
  db('update case study', () => prisma.caseStudy.update({ where, data, include }));

/** Soft delete: only flags the row DELETED (status + deletedAt) — every other column keeps its value. */
const deleteCaseStudy = (id: string): Promise<CaseStudy> =>
  db('delete case study', () => prisma.caseStudy.update({ where: { id }, data: softDeleteData() }));

const findCaseStudy = (where: Prisma.CaseStudyWhereInput) =>
  db('find case study', () => prisma.caseStudy.findFirst({ where: { ...NOT_DELETED, ...where }, include }));

/** `omitContent` skips the (large) HTML body — used by public lists, which only need the card fields. */
const findCaseStudiesWithPagination = (where: Prisma.CaseStudyWhereInput, skip: number, take: number, omitContent = false) =>
  db('find case studies', async () => {
    const filter = { ...NOT_DELETED, ...where };
    const [caseStudies, total] = await Promise.all([
      prisma.caseStudy.findMany({
        where: filter,
        include,
        ...(omitContent && { omit: { content: true } }),
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.caseStudy.count({ where: filter }),
    ]);
    return { caseStudies, total };
  });

export { createCaseStudy, updateCaseStudy, deleteCaseStudy, findCaseStudy, findCaseStudiesWithPagination };
