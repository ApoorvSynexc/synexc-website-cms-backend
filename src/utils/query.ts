import type { Request } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { Status } from '../../generated/prisma/enums.js';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/** `?page=2&limit=20` -> { page, limit, skip }. Limit is capped so a client cannot request the whole table. */
const parsePagination = (query: Request['query']) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
};

const buildMeta = (page: number, limit: number, total: number) => ({
  page,
  limit,
  totalRecords: total,
  totalPages: Math.ceil(total / limit),
});

/** Reads never return soft-deleted rows. */
const NOT_DELETED = { status: { not: Status.DELETED } } as const;

/** Delete is soft: the row stays, flagged DELETED. */
const softDeleteData = () => ({ status: Status.DELETED, deletedAt: new Date() }) as const;

/** "2026-05-10" -> Date at UTC midnight (the DB columns are @db.Date). */
const toDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

/** Turns a Prisma / generic error into one of the localized message keys the API returns. */
const toMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return 'exist';
    if (error.code === 'P2025') return 'not_exist';
    if (error.code === 'P2003') return 'related_record_exists';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

/** Wraps a DB call so callers see a clean message instead of a Prisma stack. */
const db = async <T>(action: string, fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const message = toMessage(error, `Failed to ${action}`);
    if (message === `Failed to ${action}`) console.error(`[db] ${action}:`, error);
    throw new Error(message);
  }
};

export { parsePagination, buildMeta, NOT_DELETED, softDeleteData, toDate, toMessage, db };
