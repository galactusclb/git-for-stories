import { Request, Response } from 'express';

import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies.ts';
import { requireAuth } from '@/middleware/auth.middleware.ts';

import { LoginInput, RegisterInput } from './auth.schema.ts';
import {
    getMe,
    handleGoogleCallback,
    login,
    logout,
    refreshTokens,
    register,
    startGoogleOAuth,
} from './auth.service.ts';
import { getGoogleOAuthConfig } from './utils/google-oauth.config.ts';

function safeReturnTo(input: unknown): string {
    if (typeof input !== 'string' || !input.startsWith('/') || input.startsWith('//')) return '/';
    return input;
}

const registerHandler = async (req: Request, res: Response) => {
    const { email, password } = req.validatedBody as RegisterInput;
    const tokens = await register(email, password);
    setAuthCookies(res, tokens);
    res.status(201).json({ success: true });
};

const loginHandler = async (req: Request, res: Response) => {
    const { email, password } = req.validatedBody as LoginInput;
    const tokens = await login(email, password);
    setAuthCookies(res, tokens);
    res.status(200).json({ success: true });
};

const meHandler = async (req: Request, res: Response) => {
    const { id } = requireAuth(req);
    const user = await getMe(id);
    if (!user) {
        res.status(401).json({ error: 'Profile not found' });
        return;
    }
    const { passwordHash: _pw, ...safe } = user;
    res.status(200).json({ success: true, data: safe });
};

const refreshHandler = async (req: Request, res: Response) => {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) {
        res.status(401).json({ ok: false });
        return;
    }

    const rotated = await refreshTokens(token);
    if (!rotated) {
        clearAuthCookies(res);
        res.status(401).json({ ok: false });
        return;
    }

    setAuthCookies(res, rotated);
    res.status(200).json({ ok: true });
};

const logoutHandler = async (req: Request, res: Response) => {
    const token = req.cookies?.refresh_token as string | undefined;
    await logout(token);
    clearAuthCookies(res);
    res.status(200).json({ success: true });
};

const googleStart = async (req: Request, res: Response) => {
    const returnTo = safeReturnTo(req.query.returnTo);
    const authUrl = await startGoogleOAuth(returnTo);
    res.redirect(authUrl);
};

const googleCallback = async (req: Request, res: Response) => {
    const { webAppUrl } = getGoogleOAuthConfig();

    try {
        const error = typeof req.query.error === 'string' ? req.query.error : null;
        if (error) {
            res.redirect(`${webAppUrl}/login?error=${encodeURIComponent(error)}`);
            return;
        }

        const state = typeof req.query.state === 'string' ? req.query.state : null;
        if (!state) {
            res.redirect(`${webAppUrl}/login?error=invalid_state`);
            return;
        }

        const result = await handleGoogleCallback(req.originalUrl, state);
        if (!result) {
            res.redirect(`${webAppUrl}/login?error=invalid_state`);
            return;
        }

        setAuthCookies(res, result.tokens);
        res.redirect(result.redirectTo);
    } catch (err) {
        console.error('[googleCallback]', err);
        res.redirect(`${webAppUrl}/login?error=server_error`);
    }
};

export default {
    registerHandler,
    loginHandler,
    meHandler,
    refreshHandler,
    logoutHandler,
    googleStart,
    googleCallback,
};
