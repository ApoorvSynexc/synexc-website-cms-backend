import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validates req.body (or req.query) against a Joi schema. Unknown keys are stripped.
 * On failure answers 400 with the same `{ message, errors }` shape HRM uses, which the frontend already reads.
 */
const validateRequest = (schema: Joi.ObjectSchema, source: 'body' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ message: details[0]?.message ?? 'Validation error', errors: details });
    }

    if (source === 'body') {
      req.body = value;
    } else {
      // Express 5 exposes req.query as a getter, so redefine it with the cleaned values.
      Object.defineProperty(req, 'query', { value, writable: true, configurable: true });
    }
    next();
  };
};

export { validateRequest };
