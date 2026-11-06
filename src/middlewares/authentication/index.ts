import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import { JWT_SECRET, SESSION_STATUS, STATUS } from '../../constant/index.js';
import { IRequest, IResponse, makeResponse } from '../../lib/index.js';
import { findSession, findUser } from '../../services/index.js';

/** Private routes: needs a valid access-token cookie, a live session and an active user. */
const authenticate = async (req: IRequest, res: IResponse, next: NextFunction): Promise<void> => {
  const token = req.cookies?.accessToken ?? null;

  if (!token) {
    await makeResponse(req, res, 401, false, 'unauthorized');
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const session = await findSession({ id: payload.sessionId, status: SESSION_STATUS.active as 'ACTIVE' });
    if (!session || session.expiresAt < new Date()) {
      await makeResponse(req, res, 401, false, 'unauthorized');
      return;
    }

    const user = await findUser({ id: payload.id });
    if (!user) {
      await makeResponse(req, res, 401, false, 'unauthorized');
      return;
    }
    if (user.status === STATUS.inactive) {
      await makeResponse(req, res, 403, false, 'blocked_or_removed');
      return;
    }

    req.user = user;
    req.sessionId = payload.sessionId;
    next();
  } catch {
    await makeResponse(req, res, 401, false, 'unauthorized');
  }
};

export { authenticate };
