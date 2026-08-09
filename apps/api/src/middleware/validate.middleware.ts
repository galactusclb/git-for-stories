import { NextFunction, Request, Response } from 'express';
import { ZodObject, ZodError } from 'zod';

import { BadRequestError } from '../utils/errors/http-error.ts';

type Schemas = {
    headers?: ZodObject;
    body?: ZodObject;
    params?: ZodObject;
    query?: ZodObject;
};

export const validate =
    (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
        try {
            if (schemas.headers) req.validatedHeaders = schemas.headers.parse(req.headers);
            if (schemas.body) req.validatedBody = schemas.body.parse(req.body);
            if (schemas.params) req.validatedParams = schemas.params.parse(req.params);
            if (schemas.query) req.validatedQuery = schemas.query.parse(req.query);
            return next();
        } catch (err) {
            if (err instanceof ZodError) {
                const formatted = err.issues.map((e) => ({
                    path: e.path.join('.'),
                    message: e.message,
                }));
                return next(new BadRequestError('Validation error', formatted));
            }
            return next(err);
        }
    };
