import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '@/lib/auth/access-jwt.ts';
import { Role } from '@/utils/constant/role';
import { IsAuthMiddlewareMissingError } from '@/utils/errors/app-errors.ts';

export type Permission = Role;

export const requireAuth = (req: Request): NonNullable<Request['user']> => {
    if (!req.user) throw new IsAuthMiddlewareMissingError(req.path);
    return req.user;
};

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.cookies?.access_token;
    if (!authToken) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    try {
        const payload = verifyAccessToken(authToken);
        req.user = { id: payload.id, role: payload.role, email: payload.email };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;
    if (!token) return next();

    try {
        const payload = verifyAccessToken(token);
        req.user = { id: payload.id, role: payload.role, email: payload.email };
    } catch {
        // Ignore invalid token — treat as unauthenticated
    }

    next();
};

export const requireRole =
    (...required: Permission[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (!required.includes(req.user.role)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        next();
    };
