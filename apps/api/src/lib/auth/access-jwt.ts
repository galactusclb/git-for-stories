import jwt from 'jsonwebtoken';

import { constants } from '@/utils/constant';
import { Role } from '@/utils/constant/role';

const { ACCESS_SECRET } = constants.auth;

export type AccessPayload = {
    id: string;
    email: string;
    role: Role;
};

export function signAccessToken(
    payload: AccessPayload,
    expiresIn: jwt.SignOptions['expiresIn'] = '15m'
): string {
    const secret = ACCESS_SECRET;
    if (!secret) throw new Error('ACCESS_SECRET is not set');
    return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string): AccessPayload {
    const secret = ACCESS_SECRET;
    if (!secret) throw new Error('ACCESS_SECRET is not set');
    return jwt.verify(token, secret) as AccessPayload;
}
