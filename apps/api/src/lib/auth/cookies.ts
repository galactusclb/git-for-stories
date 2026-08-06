import { constants } from '@/utils/constant';

import type { CookieOptions, Response } from 'express';

const isProd = constants.NODE_ENV;

const baseCookie: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
};

export function setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string }
) {
    res.cookie('access_token', tokens.accessToken, {
        ...baseCookie,
        maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', tokens.refreshToken, {
        ...baseCookie,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
}
