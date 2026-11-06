import { Request, Response } from 'express';
import { makeResponse } from '../lib/index.js';

type IHandler = (req: Request, res: Response) => Promise<void>;

/** Turns a thrown Error into a standard 400 envelope instead of an unhandled rejection. */
const asyncHandler = (fn: IHandler): IHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      await fn(req, res);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      makeResponse(req, res, 400, false, (message || 'unknown_error') as Parameters<typeof makeResponse>[4]);
    }
  };
};

const wrapController = <T extends Record<string, IHandler>>(controller: T): T =>
  Object.fromEntries(Object.entries(controller).map(([key, fn]) => [key, asyncHandler(fn)])) as T;

/** "How AI Is Changing Gaming!" -> "how-ai-is-changing-gaming" */
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export { asyncHandler, wrapController, generateSlug };
