import jwt from 'jsonwebtoken';

import { constants } from '@/utils/constant';
import { Role } from '@/utils/constant/role.ts';

const { ACCESS_SECRET, REFRESH_SECRET } = constants.auth;

export interface AccessPayload {
    sub: string;
    role: Role;
    email?: string;
}

export const signAccessToken = (userId: string, role: Role, email?: string) =>
    jwt.sign({ sub: userId, role, email }, ACCESS_SECRET!, { expiresIn: '15m' });

export const signRefreshToken = (userId: string) =>
    jwt.sign({ sub: userId }, REFRESH_SECRET!, { expiresIn: '7d' });

export const verifyAccessToken = (token: string) =>
    jwt.verify(token, ACCESS_SECRET!) as AccessPayload;

export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, REFRESH_SECRET!) as { sub: string };
