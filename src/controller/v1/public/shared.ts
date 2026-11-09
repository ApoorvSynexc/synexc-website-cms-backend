/**
 * Helpers shared by the public (website) controllers. These endpoints are read-only, need no login, and only ever
 * return content that is switched on (status ACTIVE) and, for articles, published. Audit columns (createdById,
 * deletedAt) are never exposed.
 */
export const strip = <T extends Record<string, any>>(row: T) => {
  const { createdById: _c, deletedAt: _d, ...rest } = row;
  return rest;
};

export const stripAll = <T extends Record<string, any>>(rows: T[]) => rows.map(strip);

/** Visitors can see an article once its publish date has arrived. */
export const livePost = () => ({
  status: 'ACTIVE' as const,
  publishStatus: 'PUBLISHED' as const,
  publishedAt: { lte: new Date() },
});
