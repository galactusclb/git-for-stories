import bcrypt from 'bcrypt';
import {
    authorizationCodeGrant,
    buildAuthorizationUrl,
    calculatePKCECodeChallenge,
    randomPKCECodeVerifier,
} from 'openid-client';

import { signAccessToken } from '@/lib/auth/access-jwt.ts';
import {
    getRefreshSession,
    issueRefreshToken,
    revokeRefreshSession,
    rotateRefreshSession,
    saveRefreshSession,
} from '@/lib/auth/refresh-store.ts';
import { randomToken, sha256Hex } from '@/lib/auth/token-utils.ts';
import prisma from '@/lib/prisma/prisma.ts';
import { redisClient } from '@/lib/redis/redis-client.ts';
import { ConflictError, UnauthorizedError } from '@/utils/errors/http-error.ts';

import {
    createEmailUser,
    findUserByEmail,
    findUserById,
    findUserByGoogleId,
    upsertGoogleUser,
} from './auth.repository.ts';
import { getGoogleOAuthConfig, getGoogleOIDCConfig } from './utils/google-oauth.config.ts';
import { consumeGoogleOAuthState, saveGoogleOAuthState } from './utils/google-oauth.store.ts';

export async function register(email: string, password: string) {
    const existing = await findUserByEmail(email);
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createEmailUser(email, passwordHash);
    return issueAppTokens(user);
}

export async function login(email: string, password: string) {
    const user = await findUserByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    return issueAppTokens(user);
}

export async function issueAppTokens(user: { id: string; email: string; role: string }) {
    const accessToken = signAccessToken({
        id: user.id,
        email: user.email,
        role: user.role as never,
    });
    const { token: refreshToken, tokenHash, sessionId } = issueRefreshToken();
    await saveRefreshSession(redisClient, tokenHash, { userId: user.id, sessionId });
    return { accessToken, refreshToken };
}

export async function refreshTokens(refreshToken: string) {
    const tokenHash = sha256Hex(refreshToken);
    const session = await getRefreshSession(redisClient, tokenHash);
    if (!session) return null;

    const { token: newRefreshToken, tokenHash: newTokenHash } = issueRefreshToken();
    await rotateRefreshSession(redisClient, tokenHash, newTokenHash, session);

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return null;

    const accessToken = signAccessToken({
        id: user.id,
        email: user.email,
        role: user.role as never,
    });

    return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = sha256Hex(refreshToken);
    await revokeRefreshSession(redisClient, tokenHash);
}

export async function getMe(id: string) {
    return findUserById(id);
}

export async function startGoogleOAuth(returnTo: string): Promise<string> {
    const state = randomToken(24);
    const codeVerifier = randomPKCECodeVerifier();
    const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);

    await saveGoogleOAuthState(redisClient, state, { codeVerifier, returnTo });

    const config = await getGoogleOIDCConfig();
    const cfg = getGoogleOAuthConfig();

    return buildAuthorizationUrl(config, {
        scope: 'openid email profile',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        redirect_uri: cfg.redirectUri,
        response_type: 'code',
    }).href;
}

export async function handleGoogleCallback(originalUrl: string, state: string) {
    const cfg = getGoogleOAuthConfig();
    const stored = await consumeGoogleOAuthState(redisClient, state);
    if (!stored) return null;

    const config = await getGoogleOIDCConfig();
    const callbackUrl = new URL(originalUrl, new URL(cfg.redirectUri).origin);

    const result = await authorizationCodeGrant(config, callbackUrl, {
        pkceCodeVerifier: stored.codeVerifier,
        expectedState: state,
    });

    if (!result.access_token) throw new Error('Missing access_token from Google');

    const claims = result.claims();
    const email = claims?.email as string;
    const sub = claims?.sub as string;
    if (!email || !sub) throw new Error('Google profile missing email or sub');

    const user = await upsertGoogleUser(email, sub);
    const tokens = await issueAppTokens(user);
    const redirectTo = new URL(stored.returnTo || '/', cfg.webAppUrl).toString();

    return { user, tokens, redirectTo };
}

// Keep for future use: look up by googleId in non-upsert flows
export { findUserByGoogleId };
