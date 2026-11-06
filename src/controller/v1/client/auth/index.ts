import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { makeResponse } from '../../../../lib/response/index.js';
import { IRequest } from '../../../../lib/index.js';
import { generateTokens, parseTokens, wrapController } from '../../../../utils/index.js';
import { prisma } from '../../../../config/database/index.js';
import {
  createSession,
  findSession,
  findSessionWithUser,
  findUser,
  updateSession,
  updateUser,
} from '../../../../services/index.js';

const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const setCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 minutes
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: SESSION_EXPIRY });
};

const clearCookies = (res: Response): void => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const login = async (req: Request, res: Response) => {
  const { email, password, deviceType = 'WEB' } = req.body;

  const user = await findUser({ email: String(email).toLowerCase() });

  // Same answer for "no such user" and "wrong password" so accounts cannot be enumerated.
  if (!user || user.status !== 'ACTIVE') {
    return makeResponse(req, res, 401, false, 'invalid_credentials');
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return makeResponse(req, res, 423, false, 'account_locked');
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    const attempts = user.loginAttempts + 1;
    await prisma.user.update({
      where: { id: user.id },
      data:
        attempts >= MAX_LOGIN_ATTEMPTS
          ? { loginAttempts: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000) }
          : { loginAttempts: attempts },
    });
    return makeResponse(req, res, 401, false, 'invalid_credentials');
  }

  await updateUser({ id: user.id }, { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() });

  const session = await createSession({
    user: { connect: { id: user.id } },
    deviceType,
    expiresAt: new Date(Date.now() + SESSION_EXPIRY),
  });

  const { accessToken, refreshToken } = generateTokens({
    sessionId: session.id,
    id: user.id,
    email: user.email,
    role: user.role.name,
  });
  setCookies(res, accessToken, refreshToken);

  // Tokens live only in httpOnly cookies — never in the response body where scripts could read them.
  return makeResponse(req, res, 200, true, 'login', {
    user: { id: user.id, email: user.email, name: user.name },
  });
};

const refreshToken = async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refreshToken;
  if (!tokenFromCookie) return makeResponse(req, res, 401, false, 'unauthorized');

  let decoded: { sessionId: string } | null = null;
  try {
    decoded = parseTokens(tokenFromCookie);
  } catch {
    return makeResponse(req, res, 401, false, 'unauthorized');
  }
  if (!decoded?.sessionId) return makeResponse(req, res, 401, false, 'unauthorized');

  const session = await findSessionWithUser({ id: decoded.sessionId, status: 'ACTIVE' });
  if (!session || session.expiresAt < new Date()) return makeResponse(req, res, 401, false, 'unauthorized');

  const user = session.user;
  if (!user || user.status !== 'ACTIVE') return makeResponse(req, res, 401, false, 'unauthorized');

  await updateSession({ id: session.id }, { expiresAt: new Date(Date.now() + SESSION_EXPIRY) });

  const tokens = generateTokens({
    sessionId: session.id,
    id: user.id,
    email: user.email,
    role: user.role.name,
  });
  setCookies(res, tokens.accessToken, tokens.refreshToken);

  return makeResponse(req, res, 200, true, 'login', null);
};

const logout = async (req: IRequest, res: Response) => {
  const sessionId = req.sessionId;

  if (sessionId) {
    const session = await findSession({ id: sessionId });
    if (session && session.userId === req.user?.id) {
      await updateSession({ id: sessionId }, { revokedAt: new Date(), status: 'REVOKED' });
    }
  }

  clearCookies(res);
  return makeResponse(req, res, 200, true, 'logout', null);
};

export const authController = wrapController({ login, refreshToken, logout });
