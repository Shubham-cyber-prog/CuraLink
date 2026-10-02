import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export interface RequestValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

/**
 * Central Zod request validator middleware.
 * Validates req.body, req.query, and/or req.params against provided Zod schemas.
 * Throws ZodError which is centrally captured and formatted as 400 by error middleware.
 */
export function validateRequest(schemas: RequestValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        try {
          req.params = parsedParams;
        } catch {
          Object.defineProperty(req, 'params', {
            value: parsedParams,
            writable: true,
            configurable: true,
          });
        }
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        try {
          req.query = parsedQuery;
        } catch {
          Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
          });
        }
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
