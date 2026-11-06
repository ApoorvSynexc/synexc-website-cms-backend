import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../constant/index.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface JwtPayload {
  sessionId: string;
  id: string;
  email: string;
  role: string;
}

const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

const generateTokens = (payload: JwtPayload): { accessToken: string; refreshToken: string } => ({
  accessToken: generateAccessToken(payload),
  refreshToken: generateRefreshToken(payload),
});

const parseTokens = (token: string): { sessionId: string } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Partial<JwtPayload>;
    return decoded.sessionId ? { sessionId: decoded.sessionId } : null;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) throw new Error('Token has expired');
    if (error instanceof jwt.JsonWebTokenError) throw new Error('Invalid token');
    throw error;
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  parseTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};

export type { JwtPayload };
