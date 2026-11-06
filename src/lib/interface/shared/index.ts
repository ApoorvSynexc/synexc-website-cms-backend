import { Request, Response } from 'express';
import { type Role, type User } from '../../../../generated/prisma/client.js';

export interface IRequest extends Request {
  /** Set by the authenticate middleware (the logged-in CMS user, with their role). */
  user?: User & { role?: Role };
  sessionId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IResponse extends Response {}
