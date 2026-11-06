import { prisma } from '../../config/database/index.js';
import { Prisma, type Session } from '../../../generated/prisma/client.js';
import { db } from '../../utils/query.js';

const createSession = (data: Prisma.SessionCreateInput): Promise<Session> =>
  db('create session', () => prisma.session.create({ data }));

const updateSession = (where: Prisma.SessionWhereUniqueInput, data: Prisma.SessionUpdateInput): Promise<Session> =>
  db('update session', () => prisma.session.update({ where, data }));

const findSession = (where: Prisma.SessionWhereInput): Promise<Session | null> =>
  db('find session', () => prisma.session.findFirst({ where }));

const findSessionWithUser = (where: Prisma.SessionWhereInput) =>
  db('find session', () => prisma.session.findFirst({ where, include: { user: { include: { role: true } } } }));

export { createSession, updateSession, findSession, findSessionWithUser };

/** After a password change, sign the user out of every other device. */
const revokeOtherSessions = (userId: string, keepSessionId?: string) =>
  db('revoke sessions', () =>
    prisma.session.updateMany({
      where: { userId, status: 'ACTIVE', ...(keepSessionId ? { id: { not: keepSessionId } } : {}) },
      data: { status: 'REVOKED', revokedAt: new Date() },
    }),
  );

export { revokeOtherSessions };
